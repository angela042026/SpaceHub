<?php

namespace Tests\Feature\Admin;

use App\Models\Reserva;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Regressão: reservas de utilizadores que já eliminaram a própria conta
 * continuam a existir de propósito (SoftDeletes em User + preservação
 * do histórico — ver ProfileContaEliminacaoTest). Mas Reserva::user() é
 * um belongsTo(User::class), e o Eloquent aplica automaticamente o
 * global scope do SoftDeletingScope do model relacionado — por isso
 * $reserva->user passa a devolver null para esses utilizadores. Sem o
 * operador ?->, qualquer notify() sobre essa relação rebentava com erro
 * fatal ao tentar cancelar a reserva a partir do painel de admin.
 */
class ReservaCancelamentoUtilizadorEliminadoTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_admin_cancela_reserva_de_utilizador_ja_eliminado_sem_rebentar(): void
    {
        Notification::fake();

        $admin = User::factory()->create([
            'role_id' => Role::firstOrCreate(
                ['nome' => 'Administrador'],
                ['descricao' => 'Administrador']
            )->id,
        ]);

        $dono = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $this->criarEstadoReserva('cancelada');

        $reserva = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => Carbon::tomorrow()->format('Y-m-d'),
            'data_fim' => Carbon::tomorrow()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        // O dono elimina a própria conta — soft delete, reserva
        // preservada de propósito.
        $dono->delete();

        // Confirma a premissa do teste: a relação já não resolve.
        $this->assertNull($reserva->fresh()->user);

        $response = $this->actingAs($admin)->patch(
            route('admin.reservas.cancelar', $reserva)
        );

        $response->assertRedirect(route('admin.reservas.index'));
        $response->assertSessionHas('success');

        $this->assertNotNull($reserva->fresh()->cancelada_at);
    }
}
