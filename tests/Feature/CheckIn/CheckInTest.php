<?php

namespace Tests\Feature\CheckIn;

use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class CheckInTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private function criarReservaHoje(User $user, string $horaInicio = '08:00:00', string $horaFim = '13:00:00'): Reserva
    {
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo($horaInicio, $horaFim);
        $estadoPendente = $this->criarEstadoReserva('pendente');

        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => Carbon::today()->format('Y-m-d'),
        ]);
    }

    public function test_scan_com_reserva_valida_dentro_da_janela(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->get(route('checkin.scan', $reserva->secretaria->qr_token));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Scan')
            ->where('status', 'pronta'));
    }

    public function test_scan_de_reserva_com_checkin_ja_feito(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $reserva->update(['check_in_at' => now()]);

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->get(route('checkin.scan', $reserva->secretaria->qr_token));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Scan')
            ->where('status', 'ja_check_in'));
    }

    public function test_scan_sem_reserva_para_a_secretaria(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();

        $response = $this->actingAs($user)
            ->get(route('checkin.scan', $secretaria->qr_token));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Scan')
            ->where('status', 'sem_reserva'));
    }

    public function test_scan_de_secretaria_ocupada_por_outro_utilizador(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($dono);

        $response = $this->actingAs($outro)
            ->get(route('checkin.scan', $reserva->secretaria->qr_token));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Scan')
            ->where('status', 'ocupada_por_outro'));
    }

    public function test_scan_com_token_inexistente_devolve_404(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($user)
            ->get(route('checkin.scan', 'token-que-nao-existe'));

        $response->assertNotFound();
    }

    public function test_confirm_de_reserva_de_outro_utilizador_devolve_403(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($dono);

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($outro)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertForbidden();
    }

    public function test_confirm_fora_da_janela_devolve_erro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);

        $this->travelTo(Carbon::today()->setTime(20, 0));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertSessionHasErrors('reserva');
        $this->assertNull($reserva->fresh()->check_in_at);
    }

    public function test_confirm_bem_sucedido_marca_check_in(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reserva->refresh();
        $this->assertNotNull($reserva->check_in_at);
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);
    }
}
