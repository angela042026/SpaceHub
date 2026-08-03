<?php

namespace Tests\Feature\Console;

use App\Models\Reserva;
use App\Notifications\ReservaExpiradaNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class CancelarReservasExpiradasTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_expira_reserva_pendente_sem_checkin_apos_tolerancia_e_notifica_utilizador(): void
    {
        Notification::fake();

        Carbon::setTestNow(Carbon::parse('2026-01-15 09:00:00'));

        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();

        // Início às 07:00 + tolerância de 30 min (default) = limite 07:30,
        // já ultrapassado às 09:00 "de agora".
        $periodo = $this->criarPeriodo('07:00:00', '13:00:00');

        $this->criarEstadoReserva('expirada');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => '2026-01-15',
            'data_fim' => '2026-01-15',
            'tipo_duracao' => 'diaria',
        ]);

        Artisan::call('reservas:cancelar-expiradas');

        $reserva->refresh();

        $this->assertSame('expirada', $reserva->estadoReserva->codigo);
        $this->assertNotNull($reserva->cancelada_at);

        Notification::assertSentTo(
            $user,
            ReservaExpiradaNotification::class
        );
    }

    public function test_nao_expira_reserva_com_checkin_ja_feito(): void
    {
        Notification::fake();

        Carbon::setTestNow(Carbon::parse('2026-01-15 09:00:00'));

        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('07:00:00', '13:00:00');

        $estadoPendente = $this->criarEstadoReserva('pendente');
        $this->criarEstadoReserva('expirada');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => '2026-01-15',
            'data_fim' => '2026-01-15',
            'tipo_duracao' => 'diaria',
            'check_in_at' => Carbon::parse('2026-01-15 07:05:00'),
        ]);

        Artisan::call('reservas:cancelar-expiradas');

        $reserva->refresh();

        $this->assertSame($estadoPendente->id, $reserva->estado_reserva_id);
        $this->assertNull($reserva->cancelada_at);

        Notification::assertNotSentTo(
            $user,
            ReservaExpiradaNotification::class
        );
    }

    public function test_nao_expira_reserva_ainda_dentro_da_tolerancia(): void
    {
        Notification::fake();

        // "Agora" é logo a seguir ao início do período — dentro da
        // tolerância de 30 minutos, ainda não deve expirar.
        Carbon::setTestNow(Carbon::parse('2026-01-15 07:10:00'));

        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('07:00:00', '13:00:00');

        $estadoPendente = $this->criarEstadoReserva('pendente');
        $this->criarEstadoReserva('expirada');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => '2026-01-15',
            'data_fim' => '2026-01-15',
            'tipo_duracao' => 'diaria',
        ]);

        Artisan::call('reservas:cancelar-expiradas');

        $reserva->refresh();

        $this->assertSame($estadoPendente->id, $reserva->estado_reserva_id);
        $this->assertNull($reserva->cancelada_at);

        Notification::assertNotSentTo(
            $user,
            ReservaExpiradaNotification::class
        );
    }
}
