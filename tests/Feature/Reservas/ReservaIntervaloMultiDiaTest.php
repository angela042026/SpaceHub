<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Cenários de reservas multi-dia ainda não cobertos por
 * DisponibilidadeIntervaloTest (que só testa uma semana "normal", sem
 * atravessar mês nem testar sobreposições parciais): sobreposição
 * parcial de intervalos com datas de início diferentes, reserva que
 * atravessa a mudança de mês, e a regra de não poder começar uma
 * reserva de vários dias ao fim de semana.
 */
class ReservaIntervaloMultiDiaTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    /**
     * criarSecretaria() da trait só define preco_meio_dia/preco_dia_inteiro
     * no setor — reservas 'semanal' (PagamentoService::calcularValor())
     * exigem também preco_semanal, senão a criação falha ao gerar o
     * pagamento associado.
     */
    private function criarSecretariaComPrecoSemanal(): \App\Models\Secretaria
    {
        $secretaria = $this->criarSecretaria();
        $secretaria->setor->update(['preco_semanal' => 40.00]);

        return $secretaria;
    }

    /**
     * criarDiaInteiro() exige que o período "Dia inteiro" exista — a
     * trait CriaEstruturaEspacial só cria "Manhã" por omissão.
     */
    private function criarPeriodoDiaInteiro(): Periodo
    {
        return Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
    }

    public function test_sobreposicao_parcial_de_intervalo_com_datas_de_inicio_diferentes_e_rejeitada(): void
    {
        $secretaria = $this->criarSecretariaComPrecoSemanal();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $donoOriginal = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        // Encontra uma segunda-feira distante para não depender do dia
        // em que o teste corre.
        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        // Reserva semanal: segunda a sexta.
        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $donoOriginal->id);

        // Segunda tentativa: começa na quarta da MESMA semana (data de
        // início diferente da primeira reserva) e estende-se até à
        // semana seguinte — sobrepõe-se a quarta/quinta/sexta da
        // primeira reserva, sem partilhar a data de início.
        $quarta = $segunda->copy()->addDays(2);

        $this->expectException(ValidationException::class);

        try {
            app(ReservaCriacaoService::class)->criarDiaInteiro([
                'data' => $quarta->toDateString(),
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'semanal',
            ], $outro->id);
        } finally {
            $this->assertSame(
                1,
                Reserva::where('secretaria_id', $secretaria->id)->count(),
                'A segunda reserva não deveria ter sido criada.'
            );
        }
    }

    public function test_reserva_que_atravessa_mudanca_de_mes_bloqueia_dias_do_mes_seguinte(): void
    {
        $secretaria = $this->criarSecretariaComPrecoSemanal();
        $periodo = $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $dono = $this->criarUsuarioComRole('Utilizador');

        // Última quinta-feira de um mês distante — 5 dias úteis a
        // partir daí (Qui, Sex, [fim de semana], Seg, Ter, Qua)
        // atravessam sempre para o mês seguinte.
        $quinta = Carbon::today()->addYear()->endOfMonth();

        while (! $quinta->isThursday()) {
            $quinta->subDay();
        }

        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $quinta->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        // O 5.º dia útil da reserva, já no mês seguinte, deve continuar
        // a aparecer ocupado — não "livre" só porque já não é o mesmo
        // mês em que a reserva começou.
        $quintoDiaUtil = $quinta->copy();
        $diasContados = 1;

        while ($diasContados < 5) {
            $quintoDiaUtil->addDay();

            if ($quintoDiaUtil->isWeekday()) {
                $diasContados++;
            }
        }

        $this->assertNotSame(
            $quinta->month,
            $quintoDiaUtil->month,
            'O cenário de teste não atravessou a mudança de mês como esperado.'
        );

        $livres = app(ReservaDisponibilidadeService::class)
            ->secretariasDisponiveis($quintoDiaUtil->toDateString(), $periodo->id)
            ->pluck('id')
            ->all();

        $this->assertNotContains(
            $secretaria->id,
            $livres,
            'A secretária apareceu livre num dia do mês seguinte que ainda está dentro da reserva.'
        );
    }

    public function test_reserva_semanal_nao_pode_comecar_ao_fim_de_semana(): void
    {
        $secretaria = $this->criarSecretaria();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $user = $this->criarUsuarioComRole('Utilizador');

        $sabado = Carbon::today()->addDays(200)->next(Carbon::SATURDAY);

        $this->expectException(ValidationException::class);

        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $sabado->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);
    }

    public function test_reserva_diaria_pode_comecar_ao_fim_de_semana(): void
    {
        $secretaria = $this->criarSecretaria();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $sabado = Carbon::today()->addDays(200)->next(Carbon::SATURDAY);

        // A restrição de "não pode começar ao fim de semana" é só para
        // durações não-diárias — uma reserva de um único dia ao sábado
        // é perfeitamente válida.
        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $sabado->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'diaria',
        ], $user->id);

        $this->assertNotNull($reserva->id);
    }
}
