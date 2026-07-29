<?php

namespace Tests\Feature\Avaliacoes;

use App\Models\Avaliacao;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\AvaliacaoAprovadaNotification;
use App\Notifications\AvaliacaoRejeitadaNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class AvaliacaoTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private function criarReserva(User $user, ?string $checkInAt = null): Reserva
    {
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'check_in_at' => $checkInAt,
        ]);
    }

    public function test_utilizador_nao_pode_avaliar_reserva_de_outro(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($dono, now());

        $response = $this->actingAs($outro)->post(route('avaliacoes.store', $reserva->id), [
            'nota' => 5,
            'comentario' => 'Ótimo espaço.',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('avaliacoes', 0);
    }

    public function test_nao_pode_avaliar_sem_checkin(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($user);

        $response = $this->actingAs($user)->post(route('avaliacoes.store', $reserva->id), [
            'nota' => 4,
            'comentario' => 'Bom espaço.',
        ]);

        $response->assertSessionHasErrors('avaliacao');
        $this->assertDatabaseCount('avaliacoes', 0);
    }

    public function test_nao_pode_avaliar_duas_vezes(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($user, now());

        Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => 4,
            'comentario' => 'Primeira avaliação.',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($user)->post(route('avaliacoes.store', $reserva->id), [
            'nota' => 5,
            'comentario' => 'Segunda tentativa.',
        ]);

        $response->assertSessionHasErrors('avaliacao');
        $this->assertDatabaseCount('avaliacoes', 1);
    }

    public function test_nota_fora_do_intervalo_e_rejeitada(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($user, now());

        $this->actingAs($user)
            ->post(route('avaliacoes.store', $reserva->id), [
                'nota' => 0,
                'comentario' => 'Comentário válido.',
            ])
            ->assertSessionHasErrors('nota');

        $this->actingAs($user)
            ->post(route('avaliacoes.store', $reserva->id), [
                'nota' => 6,
                'comentario' => 'Comentário válido.',
            ])
            ->assertSessionHasErrors('nota');

        $this->assertDatabaseCount('avaliacoes', 0);
    }

    public function test_comentario_obrigatorio(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($user, now());

        $response = $this->actingAs($user)->post(route('avaliacoes.store', $reserva->id), [
            'nota' => 5,
            'comentario' => '',
        ]);

        $response->assertSessionHasErrors('comentario');
        $this->assertDatabaseCount('avaliacoes', 0);
    }

    public function test_avaliacao_e_criada_com_sucesso_apos_checkin(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($user, now());

        $response = $this->actingAs($user)->post(route('avaliacoes.store', $reserva->id), [
            'nota' => 5,
            'comentario' => 'Espaço excelente, recomendo.',
        ]);

        $response->assertRedirect(route('reservas.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('avaliacoes', [
            'reserva_id' => $reserva->id,
            'nota' => 5,
            'estado' => 'pendente',
        ]);
    }

    public function test_utilizador_normal_nao_acede_a_moderacao(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($user)->get(route('admin.avaliacoes.index'));

        $response->assertForbidden();
    }

    public function test_utilizador_normal_nao_pode_aprovar(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $dono = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($dono, now());

        $avaliacao = Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => 5,
            'comentario' => 'Muito bom.',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($user)
            ->patch(route('admin.avaliacoes.aprovar', $avaliacao->id));

        $response->assertForbidden();
        $this->assertSame('pendente', $avaliacao->fresh()->estado);
    }

    public function test_gestor_pode_moderar(): void
    {
        $gestor = $this->criarUsuarioComRole('Gestor');

        $response = $this->actingAs($gestor)->get(route('admin.avaliacoes.index'));

        $response->assertOk();
    }

    public function test_admin_aprovar_marca_estado_e_notifica(): void
    {
        Notification::fake();

        $admin = $this->criarUsuarioComRole('Administrador');
        $dono = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($dono, now());

        $avaliacao = Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => 5,
            'comentario' => 'Muito bom.',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.avaliacoes.aprovar', $avaliacao->id));

        $response->assertRedirect();
        $this->assertSame('aprovada', $avaliacao->fresh()->estado);

        Notification::assertSentTo($dono, AvaliacaoAprovadaNotification::class, function ($notification) use ($dono) {
            return in_array('mail', $notification->via($dono), true);
        });
    }

    public function test_admin_rejeitar_marca_estado_e_notifica(): void
    {
        Notification::fake();

        $admin = $this->criarUsuarioComRole('Administrador');
        $dono = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($dono, now());

        $avaliacao = Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => 1,
            'comentario' => 'Comentário impróprio.',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.avaliacoes.rejeitar', $avaliacao->id));

        $response->assertRedirect();
        $this->assertSame('rejeitada', $avaliacao->fresh()->estado);

        Notification::assertSentTo($dono, AvaliacaoRejeitadaNotification::class, function ($notification) use ($dono) {
            return in_array('mail', $notification->via($dono), true);
        });
    }

    public function test_nao_permite_re_moderar_avaliacao_ja_decidida(): void
    {
        Notification::fake();

        $admin = $this->criarUsuarioComRole('Administrador');
        $dono = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReserva($dono, now());

        $avaliacao = Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => 5,
            'comentario' => 'Muito bom.',
            'estado' => 'aprovada',
        ]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.avaliacoes.rejeitar', $avaliacao->id));

        $response->assertRedirect();
        $this->assertSame('aprovada', $avaliacao->fresh()->estado);

        Notification::assertNothingSent();
    }

    public function test_utilizador_ve_apenas_as_suas_avaliacoes(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $reservaDono = $this->criarReserva($dono, now());
        $reservaOutro = $this->criarReserva($outro, now());

        Avaliacao::create([
            'reserva_id' => $reservaDono->id,
            'nota' => 5,
            'comentario' => 'Minha avaliação.',
            'estado' => 'pendente',
        ]);

        Avaliacao::create([
            'reserva_id' => $reservaOutro->id,
            'nota' => 2,
            'comentario' => 'Avaliação de outro utilizador.',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($dono)->get(route('avaliacoes.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Avaliacoes/Index')
                ->has('avaliacoes.data', 1)
                ->where('avaliacoes.data.0.comentario', 'Minha avaliação.')
                ->etc();
        });
    }

    public function test_media_de_avaliacoes_por_setor_so_conta_aprovadas(): void
    {
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $pendenteEstado = $this->criarEstadoReserva('pendente');

        $criarAvaliacao = function (int $nota, string $estado, string $data) use ($secretaria, $periodo, $pendenteEstado) {
            $user = $this->criarUsuarioComRole('Utilizador');

            $reserva = Reserva::create([
                'user_id' => $user->id,
                'secretaria_id' => $secretaria->id,
                'periodo_id' => $periodo->id,
                'estado_reserva_id' => $pendenteEstado->id,
                'data' => $data,
                'check_in_at' => now(),
            ]);

            return Avaliacao::create([
                'reserva_id' => $reserva->id,
                'nota' => $nota,
                'comentario' => 'Comentário de teste.',
                'estado' => $estado,
            ]);
        };

        $criarAvaliacao(5, 'aprovada', Carbon::today()->format('Y-m-d'));
        $criarAvaliacao(3, 'aprovada', Carbon::tomorrow()->format('Y-m-d'));
        $criarAvaliacao(1, 'pendente', Carbon::today()->addDays(2)->format('Y-m-d'));

        $visitante = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($visitante)->get(route('reservas.create'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Reservas/Create')
                ->where('setores.0.avaliacao_total', 2)
                ->where('setores.0.avaliacao_media',fn ($valor) => (float) $valor === 4.0)
                ->etc();
        });
    }
}
