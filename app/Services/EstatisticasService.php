<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class EstatisticasService
{
    private const CACHE_TTL_SEGUNDOS = 60;

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
}
