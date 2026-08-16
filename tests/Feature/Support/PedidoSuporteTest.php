<?php

namespace Tests\Feature\Support;

use App\Models\PedidoSuporte;
use App\Models\Role;
use App\Models\User;
use App\Notifications\SuporteRespondidoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Pedidos de suporte: qualquer utilizador cria o seu, mas só
 * Administrador e Gestor veem a lista e respondem.
 */
class PedidoSuporteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_utilizador_cria_pedido_pendente_em_seu_nome(): void
    {
        $user = $this->criarComRole('Utilizador');

        $this->actingAs($user)
            ->post(route('support.store'), [
                'assunto' => 'Não consigo fazer check-in',
                'mensagem' => 'O QR Code da secretária A-12 não é reconhecido.',
            ])
            ->assertRedirect(route('faqs.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('pedido_suportes', [
            'user_id' => $user->id,
            'assunto' => 'Não consigo fazer check-in',
            'estado' => 'Pendente',
        ]);
    }

    public function test_assunto_e_mensagem_sao_obrigatorios(): void
    {
        $user = $this->criarComRole('Utilizador');

        $this->actingAs($user)
            ->post(route('support.store'), [
                'assunto' => '',
                'mensagem' => 'curta',
            ])
            ->assertSessionHasErrors(['assunto', 'mensagem']);

        $this->assertDatabaseCount('pedido_suportes', 0);
    }

    public function test_o_formulario_mostra_apenas_os_pedidos_do_proprio(): void
    {
        $user = $this->criarComRole('Utilizador');
        $outro = $this->criarComRole('Utilizador');

        $this->criarPedido($user, 'O meu pedido');
        $this->criarPedido($outro, 'O pedido do outro');

        $this->actingAs($user)
            ->get(route('support.create'))
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Support/Create')
                    ->has('meusPedidos', 1)
                    ->where('meusPedidos.0.assunto', 'O meu pedido')
            );
    }

    /**
     * Antes limitava-se a get() sem qualquer limite — um utilizador
     * com muitos pedidos ao longo do tempo fazia o payload desta
     * página crescer sem controlo.
     */
    public function test_o_formulario_limita_aos_20_pedidos_mais_recentes(): void
    {
        $user = $this->criarComRole('Utilizador');

        for ($i = 1; $i <= 25; $i++) {
            $this->criarPedido($user, "Pedido {$i}");
        }

        $this->actingAs($user)
            ->get(route('support.create'))
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Support/Create')
                    ->has('meusPedidos', 20)
            );
    }

    public function test_utilizador_normal_nao_acede_a_lista_de_pedidos(): void
    {
        $user = $this->criarComRole('Utilizador');

        $this->actingAs($user)
            ->get(route('support.index'))
            ->assertForbidden();
    }

    public function test_utilizador_normal_nao_pode_responder(): void
    {
        $dono = $this->criarComRole('Utilizador');
        $pedido = $this->criarPedido($dono, 'Assunto qualquer');

        $this->actingAs($this->criarComRole('Utilizador'))
            ->patch(route('support.update', $pedido->id), [
                'resposta' => 'Uma resposta que não devia passar.',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('pedido_suportes', [
            'id' => $pedido->id,
            'estado' => 'Pendente',
        ]);
    }

    public function test_gestor_ve_todos_os_pedidos(): void
    {
        $this->criarPedido($this->criarComRole('Utilizador'), 'Pedido A');
        $this->criarPedido($this->criarComRole('Utilizador'), 'Pedido B');

        $this->actingAs($this->criarComRole('Gestor'))
            ->get(route('support.index'))
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Support/Index')
                    ->has('pedidos', 2)
            );
    }

    public function test_responder_resolve_o_pedido_e_notifica_o_autor(): void
    {
        Notification::fake();

        $dono = $this->criarComRole('Utilizador');
        $pedido = $this->criarPedido($dono, 'Problema no pagamento');

        $this->actingAs($this->criarComRole('Administrador'))
            ->patch(route('support.update', $pedido->id), [
                'resposta' => 'Já corrigimos o pagamento, obrigado pelo aviso.',
            ])
            ->assertRedirect(route('support.index'));

        $this->assertDatabaseHas('pedido_suportes', [
            'id' => $pedido->id,
            'estado' => 'Resolvido',
            'resposta' => 'Já corrigimos o pagamento, obrigado pelo aviso.',
        ]);

        Notification::assertSentTo($dono, SuporteRespondidoNotification::class);
    }

    public function test_resposta_vazia_e_rejeitada(): void
    {
        $pedido = $this->criarPedido(
            $this->criarComRole('Utilizador'),
            'Assunto'
        );

        $this->actingAs($this->criarComRole('Administrador'))
            ->patch(route('support.update', $pedido->id), ['resposta' => 'abc'])
            ->assertSessionHasErrors('resposta');

        $this->assertDatabaseHas('pedido_suportes', [
            'id' => $pedido->id,
            'estado' => 'Pendente',
        ]);
    }

    private function criarComRole(string $nomeRole): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', $nomeRole)->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    private function criarPedido(User $user, string $assunto): PedidoSuporte
    {
        return PedidoSuporte::create([
            'user_id' => $user->id,
            'assunto' => $assunto,
            'mensagem' => 'Mensagem com detalhe suficiente para passar na validação.',
            'estado' => 'Pendente',
        ]);
    }
}
