<?php

namespace Tests\Feature\Reservas;

use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Secretaria;
use App\Models\User;
use App\Services\MapaOcupacaoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * CHECKIN-JANELA: reservas confirmadas sem check-in 30 minutos depois
 * do início do período ficam com o dia libertado (ver
 * app/Console/Commands/LiberarReservasSemCheckIn.php).
 */
class LiberarReservasSemCheckInTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    private function criarReservaDiaRows(
        Reserva $reserva,
        Secretaria $secretaria,
        User $user,
        Carbon $dataInicio,
        Carbon $dataFim
    ): void {
        $dia = $dataInicio->copy();

        while ($dia->lte($dataFim)) {
            ReservaDia::create([
                'reserva_id' => $reserva->id,
                'secretaria_id' => $secretaria->id,
                'user_id' => $user->id,
                'dia' => $dia->toDateString(),
                'slot' => 'manha',
            ]);

            $dia->addDay();
        }
    }

    public function test_reserva_de_um_dia_e_libertada_e_marcada_nao_compareceu(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');

        $hoje = Carbon::today();

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $hoje->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $user, $hoje, $hoje);

        $this->travelTo($hoje->copy()->setTime(8, 31));

        $this->artisan('reservas:liberar-nao-comparecimentos')->assertExitCode(0);

        $reserva->refresh();
        $this->assertSame('nao_compareceu', $reserva->estadoReserva->codigo);

        $this->assertSame(
            0,
            ReservaDia::where('reserva_id', $reserva->id)->count(),
            'A linha do dia libertado devia ter sido apagada.'
        );

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'reserva_nao_compareceu',
            'subject_id' => $reserva->id,
        ]);
    }

    public function test_antes_da_tolerancia_nao_liberta_nada(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');

        $hoje = Carbon::today();

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $hoje->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $user, $hoje, $hoje);

        // Tolerância default é 30 min — às 08:15 ainda não passou.
        $this->travelTo($hoje->copy()->setTime(8, 15));

        $this->artisan('reservas:liberar-nao-comparecimentos')->assertExitCode(0);

        $reserva->refresh();
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);

        $this->assertSame(
            1,
            ReservaDia::where('reserva_id', $reserva->id)->count(),
            'Antes da tolerância, a linha do dia não devia ser apagada.'
        );
    }

    public function test_reserva_com_check_in_nao_e_afetada(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');

        $hoje = Carbon::today();

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $hoje->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
            'check_in_at' => $hoje->copy()->setTime(8, 5),
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $user, $hoje, $hoje);

        $this->travelTo($hoje->copy()->setTime(8, 31));

        $this->artisan('reservas:liberar-nao-comparecimentos')->assertExitCode(0);

        $reserva->refresh();
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);

        $this->assertSame(
            1,
            ReservaDia::where('reserva_id', $reserva->id)->count(),
            'Com check-in já feito, a linha do dia não devia ser apagada.'
        );
    }

    /**
     * Numa reserva semanal, só o primeiro dia (o único já dentro da
     * janela de tolerância) é libertado — a reserva mantém-se
     * "confirmada" porque ainda há dias por vir, e os restantes dias
     * continuam com a sua linha em reserva_dias.
     */
    public function test_reserva_semanal_liberta_so_o_primeiro_dia_mantendo_confirmada(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');

        $hoje = Carbon::today();
        $fim = $hoje->copy()->addDays(6);

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $fim->format('Y-m-d'),
            'tipo_duracao' => 'semanal',
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $user, $hoje, $fim);

        $this->travelTo($hoje->copy()->setTime(8, 31));

        $this->artisan('reservas:liberar-nao-comparecimentos')->assertExitCode(0);

        $reserva->refresh();
        $this->assertSame('confirmada', $reserva->estadoReserva->codigo);

        $this->assertSame(
            0,
            ReservaDia::where('reserva_id', $reserva->id)
                ->whereDate('dia', $hoje->toDateString())
                ->count(),
            'A linha de hoje devia ter sido apagada.'
        );

        $this->assertSame(
            1,
            ReservaDia::where('reserva_id', $reserva->id)
                ->whereDate('dia', $hoje->copy()->addDay()->toDateString())
                ->count(),
            'A linha de amanhã não devia ser afetada.'
        );
    }

    /**
     * Depois de libertado, o dia específico deixa de bloquear uma nova
     * reserva de outro utilizador na mesma secretária — mas os
     * restantes dias da reserva original continuam a bloquear
     * normalmente.
     */
    public function test_dia_libertado_fica_disponivel_para_nova_reserva(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');

        $hoje = Carbon::today();
        $fim = $hoje->copy()->addDays(6);

        $reserva = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $fim->format('Y-m-d'),
            'tipo_duracao' => 'semanal',
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $dono, $hoje, $fim);

        $this->travelTo($hoje->copy()->setTime(8, 31));

        $this->artisan('reservas:liberar-nao-comparecimentos');

        $disponibilidade = app(ReservaDisponibilidadeService::class);
        $periodosConflito = $disponibilidade->periodosEmConflito($periodo->id);

        $bloqueiaHoje = $disponibilidade->existeReservaAtivaNoIntervalo(
            'secretaria_id',
            $secretaria->id,
            $periodosConflito,
            $hoje->toDateString(),
            $hoje->toDateString()
        );
        $this->assertFalse($bloqueiaHoje, 'O dia libertado não devia continuar a bloquear novas reservas.');

        $bloqueiaAmanha = $disponibilidade->existeReservaAtivaNoIntervalo(
            'secretaria_id',
            $secretaria->id,
            $periodosConflito,
            $hoje->copy()->addDay()->toDateString(),
            $hoje->copy()->addDay()->toDateString()
        );
        $this->assertTrue($bloqueiaAmanha, 'Os restantes dias da reserva original devem continuar a bloquear.');
    }

    /**
     * O mapa de ocupação de hoje mostra a secretária livre no dia
     * libertado, mesmo com a reserva de vários dias ainda "confirmada".
     */
    public function test_mapa_mostra_secretaria_livre_no_dia_libertado(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $this->criarEstadoReserva('nao_compareceu');
        $this->criarEstadoReserva('pendente');

        $hoje = Carbon::today();
        $fim = $hoje->copy()->addDays(6);

        $reserva = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => $hoje->format('Y-m-d'),
            'data_fim' => $fim->format('Y-m-d'),
            'tipo_duracao' => 'semanal',
        ]);

        $this->criarReservaDiaRows($reserva, $secretaria, $dono, $hoje, $fim);

        $this->travelTo($hoje->copy()->setTime(8, 31));

        $this->artisan('reservas:liberar-nao-comparecimentos');

        $dados = app(MapaOcupacaoService::class)->obterDados();

        $secretariaNoMapa = collect($dados['pisos'])
            ->flatMap(fn (array $piso) => $piso['setores'])
            ->flatMap(fn (array $setor) => $setor['secretarias'])
            ->firstWhere('id', $secretaria->id);

        $this->assertNotNull($secretariaNoMapa);
        $this->assertSame('livre', $secretariaNoMapa['status']);
    }
}
