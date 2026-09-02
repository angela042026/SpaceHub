<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\User;
use App\Notifications\ReservaCriadaNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class ReservaTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    /**
     * Criar uma reserva diretamente na base de dados
     * para utilização nos testes.
     */
    private function criarReserva(
        User $user,
        Secretaria $secretaria,
        Periodo $periodo,
        string $estadoCodigo = 'pendente',
        ?string $data = null,
        ?string $canceladaAt = null,
    ): Reserva {
        $dataReserva = $data
            ?? Carbon::today()->format('Y-m-d');

        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this
                ->criarEstadoReserva($estadoCodigo)
                ->id,
            'data' => $dataReserva,
            'data_fim' => $dataReserva,
            'tipo_duracao' => 'diaria',
            'cancelada_at' => $canceladaAt,
        ]);
    }

    /**
     * Verificar que uma reserva diária válida é criada.
     */
    public function test_criar_reserva_valida(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $this->criarEstadoReserva('pendente');

        $dataReserva = Carbon::tomorrow()->format('Y-m-d');

        $response = $this->actingAs($user)->post(
            route('reservas.store'),
            [
                'data' => $dataReserva,
                'periodo_id' => $periodo->id,
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'diaria',
                'observacoes' => 'Preciso de monitor extra.',
            ]
        );

        $response->assertRedirect(
            route('reservas.index')
        );

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('reservas', [
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'data' => $dataReserva.' 00:00:00',
            'data_fim' => $dataReserva.' 00:00:00',
            'tipo_duracao' => 'diaria',
        ]);
    }

    /**
     * A notificação de reserva criada é despachada depois da transação
     * fechar (ver ReservaCriacaoService::persistir()) — confirma que o
     * refactor não deixou de a enviar.
     */
    public function test_criar_reserva_notifica_o_utilizador(): void
    {
        Notification::fake();

        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $this->criarEstadoReserva('pendente');

        $dataReserva = Carbon::tomorrow()->format('Y-m-d');

        $this->actingAs($user)->post(
            route('reservas.store'),
            [
                'data' => $dataReserva,
                'periodo_id' => $periodo->id,
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'diaria',
            ]
        );

        Notification::assertSentTo(
            $user,
            ReservaCriadaNotification::class
        );
    }

    /**
     * Verificar que uma secretária não pode ser reservada
     * novamente na mesma data e período.
     */
    public function test_rejeita_sobreposicao_de_secretaria(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $data = Carbon::tomorrow()->format('Y-m-d');

        $this->criarReserva(
            $dono,
            $secretaria,
            $periodo,
            'pendente',
            $data
        );

        $response = $this->actingAs($outro)->post(
            route('reservas.store'),
            [
                'data' => $data,
                'periodo_id' => $periodo->id,
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'diaria',
            ]
        );

        $response->assertSessionHasErrors(
            'secretaria_id'
        );

        $this->assertSame(
            1,
            Reserva::where(
                'secretaria_id',
                $secretaria->id
            )->count()
        );
    }

    /**
     * Verificar que o mesmo utilizador não pode criar
     * duas reservas incompatíveis na mesma data e período.
     */
    public function test_rejeita_duplicacao_do_mesmo_utilizador(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $secretaria1 = $this->criarSecretaria();
        $secretaria2 = $this->criarSecretaria();

        $periodo = $this->criarPeriodo();

        $data = Carbon::tomorrow()->format('Y-m-d');

        $this->criarReserva(
            $user,
            $secretaria1,
            $periodo,
            'pendente',
            $data
        );

        $response = $this->actingAs($user)->post(
            route('reservas.store'),
            [
                'data' => $data,
                'periodo_id' => $periodo->id,
                'secretaria_id' => $secretaria2->id,
                'tipo_duracao' => 'diaria',
            ]
        );

        $response->assertSessionHasErrors('data');

        $this->assertSame(
            1,
            Reserva::where(
                'user_id',
                $user->id
            )->count()
        );
    }

    /**
     * Verificar que o utilizador pode cancelar
     * a própria reserva.
     */
    public function test_cancelar_reserva(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $this->criarEstadoReserva('cancelada');

        $response = $this->actingAs($user)->patch(
            route('reservas.cancelar', $reserva)
        );

        $response->assertRedirect(
            route('reservas.index')
        );

        $response->assertSessionHas('success');

        $reserva->refresh();

        $this->assertSame(
            'cancelada',
            $reserva->estadoReserva->codigo
        );

        $this->assertNotNull(
            $reserva->cancelada_at
        );
    }

    /**
     * Verificar que um utilizador não pode cancelar
     * uma reserva pertencente a outro utilizador.
     */
    public function test_impede_cancelar_reserva_de_outro_utilizador(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = $this->criarReserva(
            $dono,
            $secretaria,
            $periodo
        );

        $response = $this->actingAs($outro)->patch(
            route('reservas.cancelar', $reserva)
        );

        $response->assertForbidden();

        $this->assertNull(
            $reserva->fresh()->cancelada_at
        );
    }

    /**
     * Verificar que um utilizador não pode editar
     * uma reserva pertencente a outro utilizador.
     */
    public function test_impede_editar_reserva_de_outro_utilizador(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = $this->criarReserva(
            $dono,
            $secretaria,
            $periodo
        );

        $response = $this->actingAs($outro)->get(
            route('reservas.edit', $reserva)
        );

        $response->assertForbidden();
    }

    /**
     * Verificar que uma reserva cancelada não pode
     * voltar a ser alterada.
     */
    public function test_impede_alterar_reserva_cancelada(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo,
            'cancelada',
            null,
            now()->toDateTimeString()
        );

        $response = $this->actingAs($user)->get(
            route('reservas.edit', $reserva)
        );

        $response->assertRedirect(
            route('reservas.index')
        );

        $response->assertSessionHas('error');
    }

    /**
     * Verificar a consulta de secretárias disponíveis
     * para uma determinada data e período.
     */
    public function test_consultar_disponibilidade(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $secretariaOcupada = $this->criarSecretaria();
        $secretariaLivre = $this->criarSecretaria();

        $periodo = $this->criarPeriodo();

        $data = Carbon::tomorrow()->format('Y-m-d');

        $this->criarReserva(
            $user,
            $secretariaOcupada,
            $periodo,
            'pendente',
            $data
        );

        $response = $this->actingAs($user)->getJson(
            route('reservas.availability', [
                'data' => $data,
                'periodo_id' => $periodo->id,
            ])
        );

        $response->assertOk();

        $codigos = collect(
            $response->json()
        )->pluck('codigo');

        $this->assertTrue(
            $codigos->contains(
                $secretariaLivre->codigo
            )
        );

        $this->assertFalse(
            $codigos->contains(
                $secretariaOcupada->codigo
            )
        );
    }

    /**
     * Verificar que o histórico de reservas
     * é apresentado com paginação.
     */
    public function test_historico_e_paginado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $periodo = $this->criarPeriodo();

        for ($i = 1; $i <= 12; $i++) {
            $secretaria = $this->criarSecretaria();

            $this->criarReserva(
                $user,
                $secretaria,
                $periodo,
                'expirada',
                Carbon::today()
                    ->subDays($i)
                    ->format('Y-m-d')
            );
        }

        $response = $this->actingAs($user)->get(
            route('reservas.history')
        );

        $response->assertOk();

        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Reservas/History')
                ->has('reservas.data', 10)
                ->where('reservas.total', 12)
        );
    }
}
