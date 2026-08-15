<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
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
 * atravessa a mudança de mês/ano, e a regra (agora em dias corridos)
 * de que qualquer duração pode começar em qualquer dia da semana,
 * incluindo sábados e domingos.
 */
class ReservaIntervaloMultiDiaTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    /**
     * criarSecretaria() da trait só define preco_meio_dia/preco_dia_inteiro
     * no setor — reservas 'semanal'/'mensal'/'anual'
     * (PagamentoService::calcularValor()) exigem também o respetivo
     * preco_*, senão a criação falha ao gerar o pagamento associado.
     */
    private function criarSecretariaComPrecos(): \App\Models\Secretaria
    {
        $secretaria = $this->criarSecretaria();
        $secretaria->setor->update([
            'preco_semanal' => 40.00,
            'preco_mensal' => 120.00,
            'preco_anual' => 1000.00,
        ]);

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
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $donoOriginal = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        // Encontra uma segunda-feira distante para não depender do dia
        // em que o teste corre.
        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        // Reserva semanal: 7 dias corridos, segunda a domingo.
        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $donoOriginal->id);

        // Segunda tentativa: começa na quarta da MESMA semana (data de
        // início diferente da primeira reserva) e estende-se até à
        // semana seguinte — sobrepõe-se a quarta/quinta/sexta/sábado/
        // domingo da primeira reserva, sem partilhar a data de início.
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

    public function test_reserva_semanal_atravessa_mudanca_de_mes_e_bloqueia_dias_do_mes_seguinte(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $periodo = $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $dono = $this->criarUsuarioComRole('Utilizador');

        // Último dia de um mês distante — 7 dias corridos a partir daí
        // atravessam sempre para o mês seguinte, seja qual for o dia
        // da semana em que caia.
        $ultimoDiaDoMes = Carbon::today()->addYear()->endOfMonth();

        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $ultimoDiaDoMes->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        $setimoDiaCorrido = $ultimoDiaDoMes->copy()->addDays(6);

        $this->assertNotSame(
            $ultimoDiaDoMes->month,
            $setimoDiaCorrido->month,
            'O cenário de teste não atravessou a mudança de mês como esperado.'
        );

        $livres = app(ReservaDisponibilidadeService::class)
            ->secretariasDisponiveis($setimoDiaCorrido->toDateString(), $periodo->id)
            ->pluck('id')
            ->all();

        $this->assertNotContains(
            $secretaria->id,
            $livres,
            'A secretária apareceu livre num dia do mês seguinte que ainda está dentro da reserva.'
        );
    }

    public function test_reserva_diaria_pode_ocorrer_em_qualquer_dia_da_semana(): void
    {
        $secretaria = $this->criarSecretaria();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $sexta = Carbon::today()->addDays(300)->next(Carbon::FRIDAY);
        $sabado = $sexta->copy()->addDay();
        $domingo = $sexta->copy()->addDays(2);

        foreach ([$sexta, $sabado, $domingo] as $dia) {
            $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
                'data' => $dia->toDateString(),
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'diaria',
            ], $user->id);

            $this->assertNotNull($reserva->id);
            $this->assertSame($dia->toDateString(), $reserva->data_fim);
        }
    }

    public function test_reserva_semanal_iniciada_a_segunda_dura_exatamente_7_dias_e_inclui_fim_de_semana(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(400)->next(Carbon::MONDAY);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        $domingoSeguinte = $segunda->copy()->addDays(6);

        $this->assertSame($domingoSeguinte->toDateString(), $reserva->data_fim);

        $diasOcupados = ReservaDia::where('reserva_id', $reserva->id)
            ->distinct()
            ->pluck('dia')
            ->map(fn ($dia) => $dia->toDateString())
            ->sort()
            ->values()
            ->all();

        $this->assertCount(7, $diasOcupados, 'Deveriam existir exatamente 7 dias corridos ocupados.');

        $sabado = $segunda->copy()->addDays(5)->toDateString();
        $domingo = $segunda->copy()->addDays(6)->toDateString();

        $this->assertContains($sabado, $diasOcupados, 'O sábado deveria estar incluído na reserva semanal.');
        $this->assertContains($domingo, $diasOcupados, 'O domingo deveria estar incluído na reserva semanal.');
    }

    public function test_reserva_semanal_iniciada_a_sexta_cobre_fim_de_semana_e_termina_na_quinta_seguinte(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $sexta = Carbon::today()->addDays(500)->next(Carbon::FRIDAY);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $sexta->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        // sexta, sábado, domingo, segunda, terça, quarta, quinta = 7 dias.
        $quintaSeguinte = $sexta->copy()->addDays(6);

        $this->assertSame($quintaSeguinte->toDateString(), $reserva->data_fim);
        $this->assertTrue($quintaSeguinte->isThursday());

        $diasEsperados = collect(range(0, 6))
            ->map(fn ($offset) => $sexta->copy()->addDays($offset)->toDateString())
            ->sort()
            ->values()
            ->all();

        $diasOcupados = ReservaDia::where('reserva_id', $reserva->id)
            ->distinct()
            ->pluck('dia')
            ->map(fn ($dia) => $dia->toDateString())
            ->sort()
            ->values()
            ->all();

        $this->assertSame($diasEsperados, $diasOcupados);
    }

    public function test_reserva_semanal_pode_comecar_ao_fim_de_semana(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $sabado = Carbon::today()->addDays(200)->next(Carbon::SATURDAY);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $sabado->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        $this->assertNotNull($reserva->id);
        $this->assertSame($sabado->copy()->addDays(6)->toDateString(), $reserva->data_fim);
    }

    public function test_reserva_mensal_permite_fim_de_semana_e_atravessa_mudanca_de_mes(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        // Dia 10 de um mês distante, seja qual for o dia da semana.
        $inicio = Carbon::today()->addYear()->startOfMonth()->addDays(9);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $inicio->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'mensal',
        ], $user->id);

        $fimEsperado = $inicio->copy()->addMonthNoOverflow()->subDay();

        $this->assertSame($fimEsperado->toDateString(), $reserva->data_fim);
        $this->assertNotSame($inicio->month, $fimEsperado->month);
    }

    public function test_reserva_mensal_a_partir_de_31_de_janeiro_nao_transborda_para_marco(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        // 2027 não é bissexto — fevereiro tem 28 dias — caso conhecido
        // de "transbordo" se addMonth() fosse usado sem o NoOverflow.
        $inicio = Carbon::create(2027, 1, 31);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $inicio->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'mensal',
        ], $user->id);

        $this->assertSame('2027-02-27', $reserva->data_fim);
        $this->assertNotSame(3, Carbon::parse($reserva->data_fim)->month, 'A data final não deveria ter avançado para março.');
    }

    public function test_reserva_anual_permite_fim_de_semana_e_atravessa_mudanca_de_ano(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $inicio = Carbon::today()->addYears(2)->month(12)->day(20);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $inicio->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'anual',
        ], $user->id);

        $fimEsperado = $inicio->copy()->addYearNoOverflow()->subDay();

        $this->assertSame($fimEsperado->toDateString(), $reserva->data_fim);
        $this->assertNotSame($inicio->year, $fimEsperado->year);
    }

    public function test_reserva_anual_a_partir_de_29_de_fevereiro_bissexto_nao_transborda(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        // 2028 é bissexto; 2029 não é — caso clássico de transbordo.
        $inicio = Carbon::create(2028, 2, 29);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $inicio->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'anual',
        ], $user->id);

        $this->assertSame('2029-02-27', $reserva->data_fim);
    }

    public function test_secretaria_ocupada_ao_fim_de_semana_continua_a_bloquear_conflito(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $donoOriginal = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(600)->next(Carbon::MONDAY);

        app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $donoOriginal->id);

        // Sábado dentro do intervalo já reservado — tentar reservar o
        // mesmo lugar, nesse dia, para outro utilizador continua a ser
        // um conflito legítimo (não relacionado com dias úteis).
        $sabadoDoIntervalo = $segunda->copy()->addDays(5);

        $this->expectException(ValidationException::class);

        try {
            app(ReservaCriacaoService::class)->criarDiaInteiro([
                'data' => $sabadoDoIntervalo->toDateString(),
                'secretaria_id' => $secretaria->id,
                'tipo_duracao' => 'diaria',
            ], $outro->id);
        } finally {
            $this->assertSame(
                1,
                Reserva::where('secretaria_id', $secretaria->id)->count(),
                'A segunda reserva (em conflito) não deveria ter sido criada.'
            );
        }
    }

    public function test_lugar_volta_a_ficar_livre_no_dia_seguinte_ao_fim_da_validade(): void
    {
        $secretaria = $this->criarSecretariaComPrecos();
        $periodo = $this->criarPeriodo();
        $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');
        $user = $this->criarUsuarioComRole('Utilizador');

        $segunda = Carbon::today()->addDays(700)->next(Carbon::MONDAY);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        $diaForaDaValidade = Carbon::parse($reserva->data_fim)->addDay();

        $livres = app(ReservaDisponibilidadeService::class)
            ->secretariasDisponiveis($diaForaDaValidade->toDateString(), $periodo->id)
            ->pluck('id')
            ->all();

        $this->assertContains(
            $secretaria->id,
            $livres,
            'A secretária deveria voltar a estar livre assim que a validade da reserva termina.'
        );
    }
}
