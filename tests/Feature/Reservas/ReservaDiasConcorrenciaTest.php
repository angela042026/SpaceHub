<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Secretaria;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Fecha a lacuna que ReservaConcorrenciaTest deixou de propósito: aqui
 * as duas reservas em "concorrência" têm datas de início DIFERENTES,
 * mas intervalos sobrepostos — o cenário que a constraint única de
 * `reservas` (por data de início) nunca apanhava. Quem trava isto agora
 * é a constraint de `reserva_dias` (ver 2026_08_04_010000).
 *
 * Tal como em ReservaConcorrenciaTest, a "concorrência" é simulada
 * ignorando de propósito a verificação da aplicação (que só existe no
 * service) e inserindo diretamente as linhas em disputa — reproduz o
 * estado exato em que duas requisições já passaram ambas a validação
 * antes de qualquer uma gravar.
 */
class ReservaDiasConcorrenciaTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private function criarSecretariaComPrecoSemanal(): Secretaria
    {
        $secretaria = $this->criarSecretaria();
        $secretaria->setor->update(['preco_semanal' => 40.00]);

        return $secretaria;
    }

    private function criarPeriodoDiaInteiro(): Periodo
    {
        return Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
    }

    public function test_reserva_dias_impede_sobreposicao_de_secretaria_com_datas_de_inicio_diferentes(): void
    {
        $secretaria = $this->criarSecretariaComPrecoSemanal();
        $this->criarPeriodo();
        $periodoDiaInteiro = $this->criarPeriodoDiaInteiro();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        // Reserva 1, pelo fluxo real: 7 dias corridos, segunda a domingo.
        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        // Reserva 2 "concorrente": começa na quarta da MESMA semana
        // (data de início diferente), sobrepõe-se a quarta/quinta/sexta
        // da reserva 1. Criada diretamente no model, ignorando de
        // propósito garantirSemConflitos() — é exatamente o que a
        // verificação da aplicação não consegue impedir sob concorrência
        // real, porque não tem lock.
        $quarta = $segunda->copy()->addDays(2);
        $dataFimReserva2 = $quarta->copy()->addDays(4)->toDateString();

        $reservaConcorrente = Reserva::create([
            'user_id' => $outro->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $quarta->toDateString(),
            'data_fim' => $dataFimReserva2,
            'tipo_duracao' => 'semanal',
        ]);

        $diasOcupados = app(ReservaDisponibilidadeService::class)->gerarDiasOcupados(
            $quarta->toDateString(),
            $dataFimReserva2,
            'Dia inteiro'
        );

        try {
            ReservaDia::insert(array_map(
                fn (array $dia) => [
                    'reserva_id' => $reservaConcorrente->id,
                    'secretaria_id' => $secretaria->id,
                    'user_id' => $outro->id,
                    'dia' => $dia['dia'],
                    'slot' => $dia['slot'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                $diasOcupados
            ));

            $this->fail('Esperava QueryException por violação da constraint de reserva_dias.');
        } catch (QueryException $e) {
            $this->assertTrue(
                app(ReservaDisponibilidadeService::class)->ehConflitoDeReservaAtiva($e)
            );
        }
    }

    public function test_reserva_dias_impede_dupla_reserva_do_mesmo_utilizador_com_datas_de_inicio_diferentes(): void
    {
        $secretaria1 = $this->criarSecretariaComPrecoSemanal();
        $secretaria2 = $this->criarSecretariaComPrecoSemanal();
        $this->criarPeriodo();
        $periodoDiaInteiro = $this->criarPeriodoDiaInteiro();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $user = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria1->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        $quinta = $segunda->copy()->addDays(3);
        $dataFimReserva2 = $quinta->copy()->addDays(4)->toDateString();

        $reservaConcorrente = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria2->id,
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $quinta->toDateString(),
            'data_fim' => $dataFimReserva2,
            'tipo_duracao' => 'semanal',
        ]);

        $diasOcupados = app(ReservaDisponibilidadeService::class)->gerarDiasOcupados(
            $quinta->toDateString(),
            $dataFimReserva2,
            'Dia inteiro'
        );

        try {
            ReservaDia::insert(array_map(
                fn (array $dia) => [
                    'reserva_id' => $reservaConcorrente->id,
                    'secretaria_id' => $secretaria2->id,
                    'user_id' => $user->id,
                    'dia' => $dia['dia'],
                    'slot' => $dia['slot'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                $diasOcupados
            ));

            $this->fail('Esperava QueryException por violação da constraint de reserva_dias.');
        } catch (QueryException $e) {
            $this->assertTrue(
                app(ReservaDisponibilidadeService::class)->ehConflitoDeReservaAtiva($e)
            );
        }
    }

    public function test_cancelar_reserva_liberta_os_dias_para_uma_nova_reserva_sobreposta(): void
    {
        $secretaria = $this->criarSecretariaComPrecoSemanal();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $this->criarEstadoReserva('cancelada');

        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        $reserva1 = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        $this->assertSame(
            14, // 7 dias × 2 slots (manhã+tarde)
            ReservaDia::where('reserva_id', $reserva1->id)->count()
        );

        $reserva1->update(['cancelada_at' => now()]);
        ReservaDia::where('reserva_id', $reserva1->id)->delete();

        $this->assertSame(0, ReservaDia::where('reserva_id', $reserva1->id)->count());

        // Com os dias libertados, uma reserva sobreposta (quarta da
        // mesma semana) já não deve encontrar conflito nenhum — nem na
        // verificação da aplicação, nem na constraint da BD.
        $quarta = $segunda->copy()->addDays(2);

        $reserva2 = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $quarta->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $outro->id);

        $this->assertNotNull($reserva2->id);
    }
}
