<?php

namespace App\Services;

use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class EstatisticasService
{
    private const ESTADOS_VALIDOS = [
        'pendente',
        'confirmada',
        'concluida',
    ];

    public function obterDataInicio(string $periodo): ?Carbon
    {
        return match ($periodo) {
            'semana' => Carbon::today()->startOfWeek(),
            'mes' => Carbon::today()->startOfMonth(),
            default => null,
        };
    }

    public function obterEstatisticas(?Carbon $dataInicio): array
    {
        $idsEstadosValidos = EstadoReserva::query()
            ->whereIn('codigo', self::ESTADOS_VALIDOS)
            ->pluck('id')
            ->all();

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
            ->take(5)
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
            ->take(5)
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
            ->take(5)
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
            ->take(5)
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
