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

        // Exclui reservas cujo dia de hoje tenha sido especificamente
        // libertado por falta de check-in (ver LiberarReservasSemCheckIn,
        // que apaga a linha de reserva_dias do dia libertado) — os
        // restantes dias de uma reserva de vários dias continuam ativos
        // normalmente, só hoje fica livre no mapa. Sem nenhuma linha
        // registada (dados antigos) conta sempre como ocupado.
        $reservasAtivasHoje = Reserva::query()
            ->noIntervalo($hoje)
            ->whereIn('estado_reserva_id', $idsEstadosAtivos)
            ->where(function ($query) use ($hoje) {
                $query
                    ->whereDoesntHave('diasOcupados')
                    ->orWhereHas('diasOcupados', function ($query) use ($hoje) {
                        $query->whereDate('dia', $hoje);
                    });
            })
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
                    $reservasAtivasHoje,
                    $hoje
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
        Collection $reservasAtivasHoje,
        Carbon $hoje
    ): array {
        $setores = $piso->setores
            ->values()
            ->map(
                function ($setor, int $indice) use (
                    $reservasAtivasHoje,
                    $hoje
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
                                'descricao' => $secretaria->descricao,
                                'imagem_url' => $secretaria->imagem_url,
                                'reservavel' => $secretaria->reservavel,
                                'monitor' => $secretaria->monitor,
                                'dock_usb' => $secretaria->dock_usb,
                                'hdmi' => $secretaria->hdmi,
                                'junto_janela' => $secretaria->junto_janela,
                                'ergonomica' => $secretaria->ergonomica,
                                'luz_natural' => $secretaria->luz_natural,
                                'zona_silenciosa' => $secretaria->zona_silenciosa,
                                'proximo_copa' => $secretaria->proximo_copa,
                                'disponibilidade' => $this->disponibilidadeDaSecretaria(
                                    $reservasAtivasHoje->get($secretaria->id)
                                ),
                                'status' => $this->statusDaSecretaria(
                                    $secretaria,
                                    $reservasAtivasHoje->get(
                                        $secretaria->id
                                    ),
                                    $hoje
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
                        'tipo' => $setor->tipo,
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
        ?Collection $reservasAtivas,
        Carbon $hoje
    ): string {
        if (! $secretaria->ativo || ! $secretaria->reservavel) {
            return 'indisponivel';
        }

        if (! $reservasAtivas || $reservasAtivas->isEmpty()) {
            return 'livre';
        }

        $agora = now();

        /*
         * A janela horária de hoje usa sempre $hoje, nunca
         * $reserva->data: numa reserva de vários dias já em curso,
         * $reserva->data é o primeiro dia (pode ter sido há vários
         * dias) — usar essa data aqui calcularia um período já no
         * passado, e a secretária apareceria sempre livre a partir
         * do segundo dia da reserva.
         */
        $diaFormatado = $hoje->format('Y-m-d');

        $reservasComPeriodo = $reservasAtivas->filter(
            fn (Reserva $reserva) => $reserva->periodo !== null
        );

        // Considera qualquer reserva de hoje cujo período ainda não tenha
        // terminado — não só as que já estão dentro da janela horária ativa.
        // Sem isto, uma reserva para mais tarde hoje (ex: reservou a Tarde
        // e ainda é de manhã) era ignorada e a secretária aparecia livre.
        $reservasAindaRelevantes = $reservasComPeriodo->filter(
            function (Reserva $reserva) use ($agora, $diaFormatado): bool {
                $fim = Carbon::parse(
                    $diaFormatado
                    .' '
                    .$reserva->periodo->hora_fim->format('H:i')
                );

                return $agora->lessThan($fim);
            }
        );

        if ($reservasAindaRelevantes->isEmpty()) {
            return 'livre';
        }

        // Procura a reserva cujo próprio período contém "agora" — em vez
        // de escolher só a que começa mais cedo, para nunca divergir do
        // segmento que disponibilidadeDaSecretaria() (e a timeline no
        // frontend) já usam para decidir o estado "agora" desta mesma
        // secretária.
        $reservaAtual = $reservasAindaRelevantes->first(
            function (Reserva $reserva) use ($agora, $diaFormatado): bool {
                $inicio = Carbon::parse(
                    $diaFormatado
                    .' '
                    .$reserva->periodo->hora_inicio->format('H:i')
                );

                $fim = Carbon::parse(
                    $diaFormatado
                    .' '
                    .$reserva->periodo->hora_fim->format('H:i')
                );

                return $agora->greaterThanOrEqualTo($inicio)
                    && $agora->lessThan($fim);
            }
        );

        if ($reservaAtual) {
            return $reservaAtual->check_in_at !== null
                ? 'ocupada'
                : 'reservada';
        }

        $tolerancia = config('reservas.tolerancia_checkin_minutos');

        $prestesAComecar = $reservasAindaRelevantes->contains(
            function (Reserva $reserva) use ($agora, $diaFormatado, $tolerancia): bool {
                $inicio = Carbon::parse(
                    $diaFormatado
                    .' '
                    .$reserva->periodo->hora_inicio->format('H:i')
                );

                return $agora->between(
                    $inicio->copy()->subMinutes($tolerancia),
                    $inicio->copy()->addMinutes($tolerancia)
                );
            }
        );

        return $prestesAComecar ? 'expira' : 'reservada';
    }

    private function disponibilidadeDaSecretaria(
        ?Collection $reservasAtivas
    ): array {
        if (! $reservasAtivas || $reservasAtivas->isEmpty()) {
            return [];
        }

        return $reservasAtivas
            ->filter(fn (Reserva $reserva) => $reserva->periodo !== null)
            ->sortBy(fn (Reserva $reserva) => $reserva->periodo->hora_inicio)
            ->map(fn (Reserva $reserva) => [
                'inicio' => $reserva->periodo->hora_inicio->format('H:i'),
                'fim' => $reserva->periodo->hora_fim->format('H:i'),
                'estado' => $reserva->check_in_at !== null
                    ? 'ocupada'
                    : 'reservada',
            ])
            ->values()
            ->all();
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
