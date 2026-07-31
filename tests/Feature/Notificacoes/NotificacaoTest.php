<?php

namespace Tests\Feature\Notificacoes;

use App\Models\PedidoSuporte;
use App\Models\Role;
use App\Models\User;
use App\Notifications\SuporteRespondidoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Marcar notificações como lidas.
 *
 * O controller usa $request->user(), por isso a rota só pode alcançar as
 * notificações de quem está autenticado — é isso que o segundo teste
 * fixa, para ninguém trocar mais tarde por um id vindo do pedido.
 */
class NotificacaoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_visitante_e_redirecionado_para_o_login(): void
    {
        $this->post(route('notificacoes.marcarLidas'))
            ->assertRedirect(route('login'));
    }

    public function test_marcar_lidas_limpa_as_notificacoes_por_ler(): void
    {
        $user = $this->criarUtilizador();

        $this->notificar($user, 2);

        $this->assertCount(2, $user->unreadNotifications);

        $this->actingAs($user)
            ->post(route('notificacoes.marcarLidas'))
            ->assertRedirect();

        $this->assertCount(
            0,
            $user->fresh()->unreadNotifications
        );
    }

    public function test_nao_toca_nas_notificacoes_de_outro_utilizador(): void
    {
        $user = $this->criarUtilizador();
        $outro = $this->criarUtilizador();

        $this->notificar($user, 1);
        $this->notificar($outro, 3);

        $this->actingAs($user)
            ->post(route('notificacoes.marcarLidas'));

        $this->assertCount(3, $outro->fresh()->unreadNotifications);
    }

    private function criarUtilizador(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    /**
     * Gera notificações reais na base de dados (o canal destas é
     * 'database'), em vez de as inserir à mão na tabela.
     */
    private function notificar(User $user, int $quantidade): void
    {
        for ($i = 0; $i < $quantidade; $i++) {
            $pedido = PedidoSuporte::create([
                'user_id' => $user->id,
                'assunto' => "Assunto {$i}",
                'mensagem' => 'Mensagem com detalhe suficiente.',
                'resposta' => 'Resposta dada pelo suporte.',
                'estado' => 'Resolvido',
            ]);

            $user->notify(new SuporteRespondidoNotification($pedido));
        }
    }
}
