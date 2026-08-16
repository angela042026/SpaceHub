<?php

namespace Tests\Feature\CheckIn;

use App\Models\ActivityLog;
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

    public function test_confirm_antes_da_janela_abrir_devolve_erro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        // Período começa às 08:00, tolerância default de 30 min abre a
        // janela às 07:30 — às 07:00 ainda não pode fazer check-in.
        $reserva = $this->criarReservaHoje($user);

        $this->travelTo(Carbon::today()->setTime(7, 0));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertSessionHasErrors('reserva');
        $this->assertNull($reserva->fresh()->check_in_at);
    }

    public function test_confirm_de_reserva_com_checkin_ja_feito_e_rejeitado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        // Primeiro check-in, bem sucedido.
        $this->actingAs($user)->post(route('checkin.confirm', $reserva->id), [
            'qr_token' => $reserva->secretaria->qr_token,
        ]);

        $primeiroCheckIn = $reserva->fresh()->check_in_at;
        $this->assertNotNull($primeiroCheckIn);

        // Reutilizar o QR/link para tentar fazer check-in outra vez —
        // seja porque a pessoa voltou a apontar a câmara, seja porque
        // carregou de novo no botão do dashboard — não deve alterar
        // nada nem reenviar a confirmação.
        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id), [
                'qr_token' => $reserva->secretaria->qr_token,
            ]);

        $response->assertSessionHasErrors('reserva');

        $reserva->refresh();
        $this->assertTrue($primeiroCheckIn->equalTo($reserva->check_in_at));
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);
    }

    public function test_scan_no_segundo_dia_de_uma_reserva_semanal_continua_pronta(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '18:00:00');
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $ontem = Carbon::today()->subDay();

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $ontem->format('Y-m-d'),
            'data_fim' => $ontem->copy()->addDays(6)->format('Y-m-d'),
            'tipo_duracao' => 'semanal',
        ]);

        $this->travelTo(Carbon::today()->setTime(9, 0));

        $response = $this->actingAs($user)
            ->get(route('checkin.scan', $secretaria->qr_token));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Scan')
            ->where('status', 'pronta'));
    }

    public function test_camera_lista_reserva_multidia_no_terceiro_dia(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '18:00:00');
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $inicio = Carbon::today()->subDays(2);

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $inicio->format('Y-m-d'),
            'data_fim' => $inicio->copy()->addDays(29)->format('Y-m-d'),
            'tipo_duracao' => 'mensal',
        ]);

        $this->travelTo(Carbon::today()->setTime(9, 0));

        $response = $this->actingAs($user)->get(route('checkin.camera'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('CheckIn/Camera')
            ->has('reservas', 1));
    }

    public function test_confirm_bem_sucedido_marca_check_in(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id), [
                'qr_token' => $reserva->secretaria->qr_token,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reserva->refresh();
        $this->assertNotNull($reserva->check_in_at);
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);
    }

    /**
     * QR-PROVA: um Utilizador comum tem de provar que leu o QR físico
     * da secretária — sem token (ou com um token de outra secretária)
     * o check-in é rejeitado, mesmo estando dentro da janela horária.
     */
    public function test_confirm_de_utilizador_comum_sem_qr_token_e_rejeitado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertSessionHasErrors('reserva');
        $this->assertNull($reserva->fresh()->check_in_at);
    }

    public function test_confirm_de_utilizador_comum_com_qr_token_de_outra_secretaria_e_rejeitado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $outraSecretaria = $this->criarSecretaria();
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)
            ->post(route('checkin.confirm', $reserva->id), [
                'qr_token' => $outraSecretaria->qr_token,
            ]);

        $response->assertSessionHasErrors('reserva');
        $this->assertNull($reserva->fresh()->check_in_at);
    }

    /**
     * Gestor/Administrador podem continuar a confirmar manualmente
     * (sem QR) a sua própria reserva — mas a ocorrência fica marcada
     * como manual no Registo de Atividade, para se conseguir
     * distinguir de um check-in real feito no local. A restrição de
     * só se poder fazer check-in da própria reserva (gerirPropria)
     * mantém-se igual para todos os papéis — o QR-PROVA não altera
     * isso, só acrescenta a exigência do QR para quem não é staff.
     */
    public function test_confirm_manual_por_gestor_e_aceite_e_fica_registado_como_manual(): void
    {
        $gestor = $this->criarUsuarioComRole('Gestor');
        $reserva = $this->criarReservaHoje($gestor);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($gestor)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reserva->refresh();
        $this->assertNotNull($reserva->check_in_at);

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $gestor->id,
            'action' => 'checkin_efetuado',
        ]);

        $registo = ActivityLog::where('action', 'checkin_efetuado')
            ->where('actor_id', $gestor->id)
            ->firstOrFail();

        $this->assertSame('manual', $registo->metadata['via'] ?? null);
    }

    /**
     * QR-PROVA não altera gerirPropria: nem Gestor nem Administrador
     * podem fazer check-in em nome de outro utilizador, com ou sem QR.
     */
    public function test_gestor_nao_pode_fazer_checkin_da_reserva_de_outro(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $gestor = $this->criarUsuarioComRole('Gestor');
        $reserva = $this->criarReservaHoje($dono);

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($gestor)
            ->post(route('checkin.confirm', $reserva->id));

        $response->assertForbidden();
        $this->assertNull($reserva->fresh()->check_in_at);
    }

    public function test_confirm_via_qr_fica_registado_como_qr(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $reserva = $this->criarReservaHoje($user);
        $this->criarEstadoReserva('confirmada');

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $this->actingAs($user)->post(route('checkin.confirm', $reserva->id), [
            'qr_token' => $reserva->secretaria->qr_token,
        ]);

        $registo = ActivityLog::where('action', 'checkin_efetuado')
            ->where('actor_id', $user->id)
            ->firstOrFail();

        $this->assertSame('qr', $registo->metadata['via'] ?? null);
    }
}
