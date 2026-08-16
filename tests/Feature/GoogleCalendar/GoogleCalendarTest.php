<?php

namespace Tests\Feature\GoogleCalendar;

use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Integração com o Google Calendar (trazida do PR #40, já mergeado em
 * origin/main, e integrada nesta branch). Sem mocks à API do Google:
 * cobre só os caminhos que não dependem de uma chamada externa —
 * criar/cancelar reserva sem o calendário ligado (sincronização é
 * sempre um no-op nesse caso) e o estado de ligação em si.
 */
class GoogleCalendarTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_utilizador_sem_tokens_nao_esta_conectado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $this->assertFalse($user->googleCalendarConectado());
    }

    public function test_utilizador_com_refresh_token_esta_conectado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $user->update(['google_calendar_refresh_token' => 'um-refresh-token']);

        $this->assertTrue($user->fresh()->googleCalendarConectado());
    }

    /**
     * A sincronização com o Google Calendar nunca deve impedir a
     * criação da reserva — sem o calendário ligado, é simplesmente
     * ignorada (ver GoogleCalendarService::sincronizarReserva()).
     */
    public function test_criar_reserva_sem_calendario_ligado_nao_falha(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $this->criarEstadoReserva('pendente');

        $response = $this->actingAs($user)->post(route('reservas.store'), [
            'data' => Carbon::tomorrow()->format('Y-m-d'),
            'periodo_id' => $periodo->id,
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'diaria',
        ]);

        $response->assertRedirect(route('reservas.index'));

        $this->assertDatabaseHas('reservas', [
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'google_event_id' => null,
        ]);
    }

    /**
     * Cancelar também nunca deve falhar por causa do Calendar —
     * removerEvento() é um no-op sem google_event_id.
     */
    public function test_cancelar_reserva_sem_evento_no_calendario_nao_falha(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $estadoPendente = $this->criarEstadoReserva('pendente');
        $estadoCancelada = $this->criarEstadoReserva('cancelada');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => Carbon::tomorrow()->format('Y-m-d'),
            'data_fim' => Carbon::tomorrow()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $response = $this->actingAs($user)
            ->patch(route('reservas.cancelar', $reserva->id));

        $response->assertRedirect(route('reservas.index'));

        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
            'estado_reserva_id' => $estadoCancelada->id,
        ]);
    }

    public function test_rotas_do_calendario_exigem_autenticacao(): void
    {
        $this->get(route('google-calendar.redirect'))->assertRedirect(route('login'));
        $this->get(route('google-calendar.callback'))->assertRedirect(route('login'));
        $this->delete(route('google-calendar.desconectar'))->assertRedirect(route('login'));
    }

    public function test_desconectar_limpa_os_tokens(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $user->update([
            'google_calendar_access_token' => 'access',
            'google_calendar_refresh_token' => 'refresh',
            'google_calendar_token_expira_em' => now()->addHour(),
        ]);

        $response = $this->actingAs($user)
            ->delete(route('google-calendar.desconectar'));

        $response->assertRedirect(route('profile.edit'));

        $user->refresh();
        $this->assertNull($user->google_calendar_access_token);
        $this->assertNull($user->google_calendar_refresh_token);
        $this->assertNull($user->google_calendar_token_expira_em);
        $this->assertFalse($user->googleCalendarConectado());
    }

    public function test_pagina_de_perfil_mostra_estado_de_ligacao(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $this->actingAs($user)
            ->get(route('profile.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Profile/Edit')
                ->where('googleCalendarConectado', false));
    }
}
