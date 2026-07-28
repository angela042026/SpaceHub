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
        $idsEstadosValidos = EstadoReserva::idsValidos();
        $limiteRanking = config('reservas.dashboard.top_ranking');

        $secretariasMaisUtilizadas = Reserva::query()
            ->selectRaw('secretaria_id, COUNT(*) as total')
            ->with('secretaria')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate('data', '>=', $dataInicio)
            )
            ->groupBy('secretaria_id')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        $secretariasMenosUtilizadas = Secretaria::query()
            ->withCount([
                'reservas' => function (Builder $query) use ($dataInicio, $idsEstadosValidos): void {
                    $query
                        ->whereIn('estado_reserva_id', $idsEstadosValidos)
                        ->when(
                            $dataInicio,
                            fn (Builder $reservaQuery) => $reservaQuery->whereDate('data', '>=', $dataInicio)
                        );
                },
            ])
            ->where('ativo', true)
            ->where('reservavel', true)
            ->orderBy('reservas_count')
            ->take($limiteRanking)
            ->get();

        $pisosPorUtilizacao = Reserva::query()
            ->selectRaw('pisos.id, pisos.nome, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->join('pisos', 'setores.piso_id', '=', 'pisos.id')
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate('reservas.data', '>=', $dataInicio)
            )
            ->groupBy('pisos.id', 'pisos.nome')
            ->orderByDesc('total')
            ->get();

        $setoresPorUtilizacao = Reserva::query()
            ->selectRaw('setores.id, setores.nome, COUNT(reservas.id) as total')
            ->join('secretarias', 'reservas.secretaria_id', '=', 'secretarias.id')
            ->join('setores', 'secretarias.setor_id', '=', 'setores.id')
            ->whereIn('reservas.estado_reserva_id', $idsEstadosValidos)
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate('reservas.data', '>=', $dataInicio)
            )
            ->groupBy('setores.id', 'setores.nome')
            ->orderByDesc('total')
            ->get();

        $utilizadoresComMaisReservas = Reserva::query()
            ->selectRaw('user_id, COUNT(*) as total')
            ->with('user')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate('data', '>=', $dataInicio)
            )
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        $diasComMaiorOcupacao = Reserva::query()
            ->selectRaw('data, COUNT(*) as total')
            ->whereIn('estado_reserva_id', $idsEstadosValidos)
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate('data', '>=', $dataInicio)
            )
            ->groupBy('data')
            ->orderByDesc('total')
            ->take($limiteRanking)
            ->get();

        return [
            'secretariasMaisUtilizadas' => $secretariasMaisUtilizadas,
            'secretariasMenosUtilizadas' => $secretariasMenosUtilizadas,
            'pisosPorUtilizacao' => $pisosPorUtilizacao,
            'pisoMaisUtilizado' => $pisosPorUtilizacao->first(),
            'setoresPorUtilizacao' => $setoresPorUtilizacao,
            'setorMaisUtilizado' => $setoresPorUtilizacao->first(),
            'utilizadoresComMaisReservas' => $utilizadoresComMaisReservas,
            'diasComMaiorOcupacao' => $diasComMaiorOcupacao,
        ];
    }
}
