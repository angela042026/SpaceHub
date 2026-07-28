<?php

namespace App\Services;

use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MapaOcupacaoService
{
    public function obterDados(): array
    {
        $hoje = Carbon::today();

        $idsEstadosAtivos = EstadoReserva::idsAtivos();

        $reservasAtivasHoje = Reserva::query()
            ->whereDate('data', $hoje)
            ->whereIn('estado_reserva_id', $idsEstadosAtivos)
            ->with('periodo')
            ->get()
            ->groupBy('secretaria_id');

        $pisos = Piso::query()
            ->where('ativo', true)
            ->with([
                'edificio',

                'setores' => fn ($query) => $query
                    ->where('ativo', true)
                    ->orderBy('id'),

                'setores.secretarias' => fn ($query) => $query
                    ->where('ativo', true)
                    ->where('reservavel', true),
            ])
            ->orderBy('numero')
            ->get()
            ->map(
                fn (Piso $piso) => $this->mapearPiso(
                    $piso,
                    $reservasAtivasHoje
                )
            );

        $edificios = Edificio::query()
            ->where('ativo', true)
            ->orderBy('nome')
            ->get(['id', 'nome']);

        return [
            'pisos' => $pisos,
            'edificios' => $edificios,
        ];
    }

    private function mapearPiso(
        Piso $piso,
        Collection $reservasAtivasHoje
    ): array {
        $setores = $piso->setores
            ->values()
            ->map(
                function ($setor, int $indice) use (
                    $reservasAtivasHoje
                ): array {
                    $totalSecretarias =
                        $setor->secretarias->count();

                    $secretarias = $setor->secretarias
                        ->values()
                        ->map(
                            fn (Secretaria $secretaria, int $indiceSecretaria) => [
                                'id' => $secretaria->id,
                                'numero' => $indiceSecretaria + 1,
                                'codigo' => $secretaria->codigo,
                                'planta_x' => $secretaria->planta_x,
                                'planta_y' => $secretaria->planta_y,
                                'status' => $this->statusDaSecretaria(
                                    $secretaria,
                                    $reservasAtivasHoje->get(
                                        $secretaria->id
                                    )
                                ),
                            ]
                        );

                    $ocupadas = $secretarias
                        ->filter(
                            fn (array $secretaria) =>
                                in_array(
                                    $secretaria['status'],
                                    [
                                        'ocupada',
                                        'reservada',
                                        'expira',
                                    ],
                                    true
                                )
                        )
                        ->count();

                    return [
                        'id' => $setor->id,
                        'numero' => $indice + 1,
                        'nome' => $setor->nome,
                        'codigo' => $setor->codigo,
                        'planta_x' => $setor->planta_x,
                        'planta_y' => $setor->planta_y,
                        'reservavel' => $setor->reservavel,
                        'totalSecretarias' => $totalSecretarias,
                        'ocupadas' => $ocupadas,
                        'livres' => max(
                            $totalSecretarias - $ocupadas,
                            0
                        ),
                        'status' => $this->estadoDoSetor(
                            $totalSecretarias,
                            $ocupadas
                        ),
                        'secretarias' => $secretarias,
                    ];
                }
            );

        return [
            'id' => $piso->id,
            'nome' => $piso->nome,
            'codigo' => $piso->codigo,
            'numero' => $piso->numero,
            'planta' => $piso->planta,
            'edificio_id' => $piso->edificio_id,
            'edificio_nome' => $piso->edificio?->nome,
            'totalSecretarias' =>
                $setores->sum('totalSecretarias'),
            'setores' => $setores,
        ];
    }

    private function statusDaSecretaria(
        Secretaria $secretaria,
        ?Collection $reservasAtivas
    ): string {
        if (! $secretaria->ativo || ! $secretaria->reservavel) {
            return 'indisponivel';
        }

        if (! $reservasAtivas || $reservasAtivas->isEmpty()) {
            return 'livre';
        }

        $agora = now();

        // Considera qualquer reserva de hoje cujo período ainda não tenha
        // terminado — não só as que já estão dentro da janela horária ativa.
        // Sem isto, uma reserva para mais tarde hoje (ex: reservou a Tarde
        // e ainda é de manhã) era ignorada e a secretária aparecia livre.
        $reserva = $reservasAtivas
            ->filter(function (Reserva $reserva) use ($agora): bool {
                if (! $reserva->periodo) {
                    return false;
                }

                $fim = Carbon::parse(
                    $reserva->data->format('Y-m-d')
                    .' '
                    .$reserva->periodo->hora_fim->format('H:i')
                );

                return $agora->lessThan($fim);
            })
            ->sortBy(fn (Reserva $reserva) => $reserva->periodo->hora_inicio)
            ->first();

        if (! $reserva || ! $reserva->periodo) {
            return 'livre';
        }

        $inicioPeriodo = Carbon::parse(
            $reserva->data->format('Y-m-d')
            .' '
            .$reserva->periodo->hora_inicio->format('H:i')
        );

        $fimPeriodo = Carbon::parse(
            $reserva->data->format('Y-m-d')
            .' '
            .$reserva->periodo->hora_fim->format('H:i')
        );

        if (
            $agora->between($inicioPeriodo, $fimPeriodo)
            && $reserva->check_in_at !== null
        ) {
            return 'ocupada';
        }

        $tolerancia = config('reservas.tolerancia_checkin_minutos');

        if (
            $agora->between(
                $inicioPeriodo->copy()->subMinutes($tolerancia),
                $inicioPeriodo->copy()->addMinutes($tolerancia)
            )
        ) {
            return 'expira';
        }

        return 'reservada';
    }

    private function estadoDoSetor(
        int $total,
        int $ocupadas
    ): string {
        if ($total === 0) {
            return 'indisponivel';
        }

        if ($ocupadas === 0) {
            return 'livre';
        }

        if (($ocupadas / $total) >= 0.8) {
            return 'ocupada';
        }

        return 'reservada';
    }
}
