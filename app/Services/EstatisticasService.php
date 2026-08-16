<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class EstatisticasService
{
    private const CACHE_TTL_SEGUNDOS = 60;

    /**
     * Dias cobertos por cada opção do filtro de período do dashboard de
     * Estatísticas (ver obterDashboard()) — todos têm uma janela anterior
     * do mesmo tamanho para a comparação dos KPIs, ao contrário de
     * "geral"/"semana"/"mês" (usados só por obterEstatisticas()).
     */
    private const DIAS_POR_PERIODO = [
        '7dias' => 7,
        '30dias' => 30,
        '90dias' => 90,
        'ano' => 365,
    ];

    public function __construct(
        private readonly DashboardMetricsService $dashboardMetricsService,
    ) {
    }

    public function obterDataInicio(string $periodo): ?Carbon
    {
        return match ($periodo) {
            'semana' => Carbon::today()->startOfWeek(),
            'mes' => Carbon::today()->startOfMonth(),
            '30dias' => Carbon::today()->subDays(29),
            '90dias' => Carbon::today()->subDays(89),
            'ano' => Carbon::today()->subDays(364),
            default => null,
        };
    }

    /**
     * 6 queries agregadas por visita ao dashboard. Não está ligado ao
     * refresh em tempo real do mapa (ao contrário de obterStats), por
     * isso basta uma cache simples por TTL, sem invalidação ativa.
     */
    public function obterEstatisticas(?Carbon $dataInicio): array
    {
        $chave = 'dashboard:estatisticas:' . ($dataInicio?->toDateString() ?? 'geral');

        return Cache::remember(
            $chave,
            self::CACHE_TTL_SEGUNDOS,
            fn () => $this->calcularEstatisticas($dataInicio)
        );
    }

    private function calcularEstatisticas(?Carbon $dataInicio): array
    {
        /*
         * Mesmo critério do gráfico "Reservas por piso"
         * (DashboardMetricsService::calcularReservasPorPisoComparativo):
         * só reservas confirmadas, sem data futura — senão os dois
         * cards do dashboard mostram números diferentes para o
         * "mesmo" período de 30/90 dias.
         */
        $idsEstadosValidos = [EstadoReserva::idPorCodigo('confirmada')];
        $limiteRanking = config('reservas.dashboard.top_ranking');

        $limitarPeriodo = fn (Builder $query, string $coluna) => $query
            ->when(
                $dataInicio,
                fn (Builder $q) => $q
                    ->whereDate($coluna, '>=', $dataInicio)
                    ->whereDate($coluna, '<=', Carbon::today())
            );

        $secretariasMaisUtilizadas = Reserva::query()
            ->selectRaw('secretaria_id, COUNT(*) as total')
            ->with('secretaria')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->whereNull('cancelada_at')
            ->tap(fn (Builder $query) => $limitarPeriodo($query, 'data'))
            ->groupBy('secretaria_id')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        $secretariasMenosUtilizadas = Secretaria::query()
            ->withCount([
                'reservas' => function (Builder $query) use ($dataInicio, $idsEstadosValidos): void {
                    $query
                        ->whereIn('estado_reserva_id', $idsEstadosValidos)
                        ->whereNull('cancelada_at')
                        ->when(
                            $dataInicio,
                            fn (Builder $reservaQuery) => $reservaQuery
                                ->whereDate('data', '>=', $dataInicio)
                                ->whereDate('data', '<=', Carbon::today())
                        );
                },
            ])
            ->where('ativo', true)
            ->where('reservavel', true)
            ->orderBy('reservas_count')
            ->take($limiteRanking)
            ->get();

        $pisosPorUtilizacao = Reserva::query()
            ->selectRaw('pisos.id, pisos.nome, pisos.codigo, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->whereNull('reservas.cancelada_at')
            ->tap(fn (Builder $query) => $limitarPeriodo($query, 'reservas.data'))
            ->groupBy('pisos.id', 'pisos.nome', 'pisos.codigo')
            ->orderByDesc('total')
            ->get();

        $setoresPorUtilizacao = Reserva::query()
            ->selectRaw('setores.id, setores.nome, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->whereNull('reservas.cancelada_at')
            ->tap(fn (Builder $query) => $limitarPeriodo($query, 'reservas.data'))
            ->groupBy('setores.id', 'setores.nome')
            ->orderByDesc('total')
            ->get();

        $utilizadoresComMaisReservas = Reserva::query()
            ->selectRaw('user_id, COUNT(*) as total')
            ->with('user')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->whereNull('cancelada_at')
            ->tap(fn (Builder $query) => $limitarPeriodo($query, 'data'))
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        $diasComMaiorOcupacao = Reserva::query()
            ->selectRaw('data, COUNT(*) as total')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->whereNull('cancelada_at')
            ->tap(fn (Builder $query) => $limitarPeriodo($query, 'data'))
            ->groupBy('data')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        $setorTop = $setoresPorUtilizacao->first();
        $utilizadorTop = $utilizadoresComMaisReservas->first();
        $secretariaTop = $secretariasMaisUtilizadas->first();

        return [
            'secretariasMaisUtilizadas' => $secretariasMaisUtilizadas,
            'secretariasMenosUtilizadas' => $secretariasMenosUtilizadas,
            'pisosPorUtilizacao' => $pisosPorUtilizacao,
            'pisoMaisUtilizado' => $pisosPorUtilizacao->first(),
            'setoresPorUtilizacao' => $setoresPorUtilizacao,
            'setorMaisUtilizado' => $setorTop,
            'utilizadoresComMaisReservas' => $utilizadoresComMaisReservas,
            'diasComMaiorOcupacao' => $diasComMaiorOcupacao,
            'tendenciaSetorTop' => $setorTop
                ? $this->obterTendenciaSetor($setorTop->id, $dataInicio, $idsEstadosValidos)
                : null,
            'distribuicaoUtilizadorTop' => $utilizadorTop
                ? $this->obterDistribuicaoSemanal('user_id', $utilizadorTop->user_id, $dataInicio, $idsEstadosValidos)
                : null,
            'distribuicaoSecretariaTop' => $secretariaTop
                ? $this->obterDistribuicaoSemanal('secretaria_id', $secretariaTop->secretaria_id, $dataInicio, $idsEstadosValidos)
                : null,
        ];
    }

    /**
     * Série diária de reservas do setor líder (para o sparkline do card
     * "Setor mais procurado") + variação face ao período anterior
     * equivalente.
     */
    private function obterTendenciaSetor(int $setorId, ?Carbon $dataInicio, array $idsEstadosValidos): array
    {
        $pontos = Reserva::query()
            ->selectRaw('reservas.data, COUNT(*) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->where('secretarias.setor_id', $setorId)
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->whereNull('reservas.cancelada_at')
            ->when(
                $dataInicio,
                fn (Builder $query) => $query
                    ->whereDate('reservas.data', '>=', $dataInicio)
                    ->whereDate('reservas.data', '<=', Carbon::today())
            )
            ->groupBy('reservas.data')
            ->orderBy('reservas.data')
            ->get();

        $totalAtual = (int) $pontos->sum('total');
        $variacaoPercentual = null;

        if ($dataInicio) {
            $diasPeriodo = (int) $dataInicio->diffInDays(Carbon::today()) + 1;
            $dataInicioAnterior = $dataInicio->copy()->subDays($diasPeriodo);
            $dataFimAnterior = $dataInicio->copy()->subDay();

            $totalAnterior = Reserva::query()
                ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
                ->where('secretarias.setor_id', $setorId)
                ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
                ->whereNull('reservas.cancelada_at')
                ->whereBetween('reservas.data', [
                    $dataInicioAnterior->toDateString(),
                    $dataFimAnterior->toDateString(),
                ])
                ->count();

            if ($totalAnterior > 0) {
                $variacaoPercentual = round((($totalAtual - $totalAnterior) / $totalAnterior) * 100, 1);
            }
        }

        return [
            'pontos' => $pontos
                ->map(fn ($ponto) => [
                    'data' => (string) $ponto->data,
                    'total' => (int) $ponto->total,
                ])
                ->values(),
            'total' => $totalAtual,
            'variacaoPercentual' => $variacaoPercentual,
        ];
    }

    /**
     * Distribuição de reservas por dia da semana (Seg..Dom) de uma
     * entidade específica (utilizador ou secretária), para os mini
     * gráficos de barras dos cards "Utilizador mais ativo" e
     * "Secretária destaque".
     */
    private function obterDistribuicaoSemanal(string $coluna, int $id, ?Carbon $dataInicio, array $idsEstadosValidos): array
    {
        $datas = Reserva::query()
            ->where($coluna, $id)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->whereNull('cancelada_at')
            ->when(
                $dataInicio,
                fn (Builder $query) => $query
                    ->whereDate('data', '>=', $dataInicio)
                    ->whereDate('data', '<=', Carbon::today())
            )
            ->pluck('data');

        $contagem = array_fill(0, 7, 0);

        foreach ($datas as $data) {
            $indice = Carbon::parse($data)->dayOfWeekIso - 1;
            $contagem[$indice]++;
        }

        return array_values($contagem);
    }

    /**
     * Dashboard de BI da página Estatísticas (redesign) — 4 KPIs com
     * comparação + sparkline, evolução diária, ocupação por dia (via
     * DashboardMetricsService, mesma definição usada no dashboard
     * principal), reservas por piso/setor/período do dia/estado, e top 5
     * utilizadores. Todos os números vêm de queries reais sobre o
     * período escolhido — nada hardcoded.
     *
     * Ao contrário de obterEstatisticas() (mantido intacto para não
     * quebrar nada que já dependa dele), este método não filtra só por
     * "confirmada" — usa EstadoReserva::idsValidos() (pendente,
     * confirmada, concluída, não compareceu), o mesmo critério já usado
     * para estatísticas noutros pontos (ver
     * DashboardMetricsService::calcularStats()), para não inflacionar
     * os indicadores com reservas canceladas/expiradas que nunca chegaram
     * a acontecer. Exceção deliberada: reservas_por_estado mostra TODOS
     * os estados, incluindo cancelada/expirada — o objetivo desse cartão
     * é precisamente mostrar essa distribuição.
     */
    public function obterDashboard(string $periodo, ?int $edificioId = null): array
    {
        $dias = self::DIAS_POR_PERIODO[$periodo] ?? self::DIAS_POR_PERIODO['30dias'];

        $chave = sprintf(
            'dashboard:estatisticas-completas:%s:%s:%s',
            $periodo,
            $edificioId ?? 'todos',
            Carbon::today()->toDateString()
        );

        return Cache::remember(
            $chave,
            self::CACHE_TTL_SEGUNDOS,
            fn () => $this->calcularDashboard($periodo, $dias, $edificioId)
        );
    }

    private function calcularDashboard(string $periodo, int $dias, ?int $edificioId): array
    {
        $hoje = Carbon::today();
        $inicio = $hoje->copy()->subDays($dias - 1);
        $fimAnterior = $inicio->copy()->subDay();
        $inicioAnterior = $fimAnterior->copy()->subDays($dias - 1);

        $confirmadaId = EstadoReserva::idPorCodigo('confirmada');

        // STAT-03: canceladas/expiradas nunca contam nos indicadores —
        // só reservas_por_estado (mais abaixo) mostra todos os estados,
        // de propósito.
        $idsEstadosValidos = EstadoReserva::idsValidos();

        $variacaoPercentual = function (int|float $atual, int|float $anterior): ?float {
            if ($anterior == 0) {
                return null;
            }

            return round((($atual - $anterior) / $anterior) * 100, 1);
        };

        // --- Duração de cada período (para "tempo médio por reserva") ---
        $periodos = Periodo::query()->get(['id', 'nome', 'hora_inicio', 'hora_fim']);

        $duracaoPorPeriodo = $periodos
            ->mapWithKeys(fn (Periodo $p) => [
                $p->id => $p->hora_inicio->diffInMinutes($p->hora_fim) / 60,
            ]);

        // --- Série diária (data, periodo_id, total, confirmadas) do período
        // atual — alimenta a "Evolução de Reservas" e o sparkline de
        // "Tempo Médio por Reserva" numa única query. ---
        $brutoPorDiaEPeriodo = Reserva::query()
            ->whereDate('data', '>=', $inicio)
            ->whereDate('data', '<=', $hoje)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->selectRaw(
                'data, periodo_id, COUNT(*) as total, SUM(CASE WHEN estado_reserva_id = ? THEN 1 ELSE 0 END) as confirmadas',
                [$confirmadaId]
            )
            ->groupBy('data', 'periodo_id')
            ->get()
            // "data" tem cast 'date' no model, por isso $linha->data já
            // vem como Carbon — (string) produzia "Y-m-d H:i:s" (via
            // __toString) em vez de "Y-m-d", o que nunca batia certo com
            // $dia->toDateString() no loop abaixo e fazia esta série
            // (e o sparkline de tempo médio) aparecer sempre a zeros.
            ->groupBy(fn ($linha) => $linha->data->toDateString());

        $evolucaoReservas = [];
        $tempoMedioSparkline = [];

        for ($dia = $inicio->copy(); $dia->lte($hoje); $dia->addDay()) {
            $chaveDia = $dia->toDateString();
            $linhasDoDia = $brutoPorDiaEPeriodo->get($chaveDia, collect());

            $totalDia = (int) $linhasDoDia->sum('total');
            $confirmadasDia = (int) $linhasDoDia->sum('confirmadas');

            $evolucaoReservas[] = [
                'data' => $chaveDia,
                'total' => $totalDia,
                'confirmadas' => $confirmadasDia,
            ];

            $somaHorasDia = $linhasDoDia->sum(
                fn ($linha) => ($duracaoPorPeriodo[$linha->periodo_id] ?? 0) * $linha->total
            );

            $tempoMedioSparkline[] = $totalDia > 0 ? round($somaHorasDia / $totalDia, 1) : 0.0;
        }

        // --- KPI 1: total de reservas ---
        $totalReservasAtual = (int) collect($evolucaoReservas)->sum('total');
        $totalReservasAnterior = Reserva::query()
            ->whereDate('data', '>=', $inicioAnterior)
            ->whereDate('data', '<=', $fimAnterior)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->count();

        // --- KPI 2: utilizadores ativos (distintos) ---
        $utilizadoresAtivosAtual = Reserva::query()
            ->whereDate('data', '>=', $inicio)
            ->whereDate('data', '<=', $hoje)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->distinct()
            ->count('user_id');

        $utilizadoresAtivosAnterior = Reserva::query()
            ->whereDate('data', '>=', $inicioAnterior)
            ->whereDate('data', '<=', $fimAnterior)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->distinct()
            ->count('user_id');

        $utilizadoresPorDia = Reserva::query()
            ->whereDate('data', '>=', $inicio)
            ->whereDate('data', '<=', $hoje)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->selectRaw('data, COUNT(DISTINCT user_id) as total')
            ->groupBy('data')
            ->get()
            ->keyBy(fn ($linha) => $linha->data->toDateString());

        $utilizadoresSparkline = [];

        for ($dia = $inicio->copy(); $dia->lte($hoje); $dia->addDay()) {
            $utilizadoresSparkline[] = (int) ($utilizadoresPorDia->get($dia->toDateString())->total ?? 0);
        }

        // --- KPI 3: taxa de ocupação média (reutiliza a definição já usada
        // no dashboard principal, para os dois nunca divergirem) ---
        $ocupacao = $this->dashboardMetricsService->obterTendenciaOcupacaoComparativa($hoje, $dias);

        // --- KPI 4: tempo médio por reserva (horas do período, ponderado
        // pela contagem de reservas em cada período) ---
        $contarPorPeriodo = fn (Carbon $ini, Carbon $fim) => Reserva::query()
            ->whereDate('data', '>=', $ini)
            ->whereDate('data', '<=', $fim)
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->selectRaw('periodo_id, COUNT(*) as total')
            ->groupBy('periodo_id')
            ->get()
            ->keyBy('periodo_id');

        $mediaHoras = function (Collection $contagem) use ($duracaoPorPeriodo): float {
            $totalReservas = (int) $contagem->sum('total');

            if ($totalReservas === 0) {
                return 0.0;
            }

            $somaHoras = $contagem->sum(
                fn ($linha) => ($duracaoPorPeriodo[$linha->periodo_id] ?? 0) * $linha->total
            );

            return round($somaHoras / $totalReservas, 1);
        };

        $periodoAtualContagem = $contarPorPeriodo($inicio, $hoje);
        $periodoAnteriorContagem = $contarPorPeriodo($inicioAnterior, $fimAnterior);

        $tempoMedioAtual = $mediaHoras($periodoAtualContagem);
        $tempoMedioAnterior = $mediaHoras($periodoAnteriorContagem);

        // --- Reservas por período do dia (Manhã/Tarde/Dia inteiro) ---
        $totalPeriodoDoDia = (int) $periodoAtualContagem->sum('total');

        $reservasPorPeriodoDoDia = $periodos
            ->map(function (Periodo $p) use ($periodoAtualContagem, $totalPeriodoDoDia) {
                $total = (int) ($periodoAtualContagem->get($p->id)->total ?? 0);

                return [
                    'id' => $p->id,
                    'nome' => $p->nome,
                    'total' => $total,
                    'percentual' => $totalPeriodoDoDia > 0
                        ? round($total / $totalPeriodoDoDia * 100, 1)
                        : 0.0,
                ];
            })
            ->values();

        // --- Reservas por piso (filtrável por edifício) ---
        $queryPiso = Reserva::query()
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->whereDate('reservas.data', '>=', $inicio)
            ->whereDate('reservas.data', '<=', $hoje)
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->when($edificioId, fn (Builder $q) => $q->where('pisos.edificio_id', $edificioId))
            ->selectRaw('pisos.id, pisos.nome, COUNT(reservas.id) as total')
            ->groupBy('pisos.id', 'pisos.nome')
            ->orderByDesc('total')
            ->get();

        $totalPisos = (int) $queryPiso->sum('total');

        $reservasPorPiso = $queryPiso
            ->map(fn ($linha) => [
                'id' => $linha->id,
                'nome' => $linha->nome,
                'total' => (int) $linha->total,
                'percentual' => $totalPisos > 0 ? round($linha->total / $totalPisos * 100, 1) : 0.0,
            ])
            ->values();

        // --- Reservas por setor (com piso anexado, para o filtro por
        // piso no card "Reservas por Setor" — join extra, sem alterar
        // a contagem/percentual já existentes) ---
        $querySetor = Reserva::query()
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->whereDate('reservas.data', '>=', $inicio)
            ->whereDate('reservas.data', '<=', $hoje)
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->selectRaw('setores.id, setores.nome, pisos.id as piso_id, pisos.nome as piso_nome, pisos.numero as piso_numero, COUNT(reservas.id) as total')
            ->groupBy('setores.id', 'setores.nome', 'pisos.id', 'pisos.nome', 'pisos.numero')
            ->orderByDesc('total')
            ->get();

        $totalSetores = (int) $querySetor->sum('total');

        $reservasPorSetor = $querySetor
            ->map(fn ($linha) => [
                'id' => $linha->id,
                'nome' => $linha->nome,
                'total' => (int) $linha->total,
                'percentual' => $totalSetores > 0 ? round($linha->total / $totalSetores * 100, 1) : 0.0,
                'pisoId' => $linha->piso_id,
                'pisoNome' => $linha->piso_nome,
                'pisoNumero' => (int) $linha->piso_numero,
            ])
            ->values();

        // --- Top 5 utilizadores ---
        $topUtilizadores = Reserva::query()
            ->join('users', 'users.id', '=', 'reservas.user_id')
            ->whereDate('reservas.data', '>=', $inicio)
            ->whereDate('reservas.data', '<=', $hoje)
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->selectRaw('users.id, users.name, COUNT(reservas.id) as total')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn ($linha) => [
                'id' => $linha->id,
                'nome' => $linha->name,
                'total' => (int) $linha->total,
            ])
            ->values();

        // --- Reservas por estado (exceção deliberada ao filtro de
        // $idsEstadosValidos usado no resto deste método — aqui o
        // objetivo é mostrar TODOS os estados reais, incluindo
        // cancelada/expirada, com 0 quando não houver nenhuma no
        // período — nunca inventa estados novos) ---
        $estados = EstadoReserva::query()->get(['id', 'codigo', 'nome']);

        $contagemEstados = Reserva::query()
            ->whereDate('data', '>=', $inicio)
            ->whereDate('data', '<=', $hoje)
            ->selectRaw('estado_reserva_id, COUNT(*) as total')
            ->groupBy('estado_reserva_id')
            ->get()
            ->keyBy('estado_reserva_id');

        $totalEstados = (int) $contagemEstados->sum('total');

        $reservasPorEstado = $estados
            ->map(function (EstadoReserva $estado) use ($contagemEstados, $totalEstados) {
                $total = (int) ($contagemEstados->get($estado->id)->total ?? 0);

                return [
                    'codigo' => $estado->codigo,
                    'nome' => $estado->nome,
                    'total' => $total,
                    'percentual' => $totalEstados > 0 ? round($total / $totalEstados * 100, 1) : 0.0,
                ];
            })
            ->values();

        return [
            'periodo' => $periodo,
            'kpis' => [
                'totalReservas' => [
                    'valor' => $totalReservasAtual,
                    'variacaoPercentual' => $variacaoPercentual($totalReservasAtual, $totalReservasAnterior),
                    'sparkline' => array_column($evolucaoReservas, 'total'),
                ],
                'utilizadoresAtivos' => [
                    'valor' => $utilizadoresAtivosAtual,
                    'variacaoPercentual' => $variacaoPercentual($utilizadoresAtivosAtual, $utilizadoresAtivosAnterior),
                    'sparkline' => $utilizadoresSparkline,
                ],
                'taxaOcupacaoMedia' => [
                    'valor' => $ocupacao['media'],
                    'variacaoPontosPercentuais' => $ocupacao['variacaoPP'],
                    'sparkline' => array_column($ocupacao['atual'], 'ocupacao'),
                ],
                'tempoMedioPorReserva' => [
                    'valorHoras' => $tempoMedioAtual,
                    'variacaoPercentual' => $variacaoPercentual($tempoMedioAtual, $tempoMedioAnterior),
                    'sparkline' => $tempoMedioSparkline,
                ],
            ],
            'evolucaoReservas' => $evolucaoReservas,
            'ocupacaoPorDia' => $ocupacao,
            'reservasPorPiso' => $reservasPorPiso,
            'reservasPorSetor' => $reservasPorSetor,
            'topUtilizadores' => $topUtilizadores,
            'reservasPorPeriodoDoDia' => $reservasPorPeriodoDoDia,
            'reservasPorEstado' => $reservasPorEstado,
        ];
    }
}
