<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\EstadoReserva;
use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const ESTADOS_ATIVOS = [
        'pendente',
        'confirmada',
    ];

    private const ESTADOS_VALIDOS_ESTATISTICAS = [
        'pendente',
        'confirmada',
        'concluida',
    ];

    public function index(DashboardRequest $request): Response
    {
        $hoje = Carbon::today();
        $ontem = $hoje->copy()->subDay();

        $periodo = $request->validated('periodo', 'geral');
        $dataInicio = $this->obterDataInicio($periodo);

        $idsEstadosAtivos = EstadoReserva::query()
            ->whereIn('codigo', self::ESTADOS_ATIVOS)
            ->pluck('id')
            ->all();

        $idsEstadosValidosEstatisticas = EstadoReserva::query()
            ->whereIn('codigo', self::ESTADOS_VALIDOS_ESTATISTICAS)
            ->pluck('id')
            ->all();

        $estadoCanceladaId = EstadoReserva::query()
            ->where('codigo', 'cancelada')
            ->value('id');

        $estadoExpiradaId = EstadoReserva::query()
            ->where('codigo', 'expirada')
            ->value('id');

        $totalSecretarias = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->count();

        $metricasHoje = $this->metricasDoDia(
            $hoje,
            $idsEstadosAtivos,
            $estadoCanceladaId,
            $estadoExpiradaId,
            $totalSecretarias
        );

        $metricasOntem = $this->metricasDoDia(
            $ontem,
            $idsEstadosAtivos,
            $estadoCanceladaId,
            $estadoExpiradaId,
            $totalSecretarias
        );

        $stats = [];

        foreach ($metricasHoje as $chave => $valor) {
            $stats[$chave] = [
                'value' => $valor,
                'changePercent' => $this->percentChange(
                    $valor,
                    $metricasOntem[$chave]
                ),
            ];
        }

        $totalReservas = Reserva::query()
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosValidosEstatisticas
            )
            ->count();

        $secretariasMaisUtilizadas = Reserva::query()
            ->selectRaw('secretaria_id, COUNT(*) as total')
            ->with('secretaria')
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosValidosEstatisticas
            )
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate(
                    'data',
                    '>=',
                    $dataInicio
                )
            )
            ->groupBy('secretaria_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $secretariasMenosUtilizadas = Secretaria::query()
            ->withCount([
                'reservas' => function (Builder $query) use (
                    $dataInicio,
                    $idsEstadosValidosEstatisticas
                ): void {
                    $query
                        ->whereIn(
                            'estado_reserva_id',
                            $idsEstadosValidosEstatisticas
                        )
                        ->when(
                            $dataInicio,
                            fn (Builder $reservaQuery) => $reservaQuery
                                ->whereDate('data', '>=', $dataInicio)
                        );
                },
            ])
            ->where('ativo', true)
            ->where('reservavel', true)
            ->orderBy('reservas_count')
            ->take(5)
            ->get();

        $pisosPorUtilizacao = Reserva::query()
            ->selectRaw(
                'pisos.id, pisos.nome, COUNT(reservas.id) as total'
            )
            ->join(
                'secretarias',
                'reservas.secretaria_id',
                '=',
                'secretarias.id'
            )
            ->join(
                'setores',
                'secretarias.setor_id',
                '=',
                'setores.id'
            )
            ->join(
                'pisos',
                'setores.piso_id',
                '=',
                'pisos.id'
            )
            ->whereIn(
                'reservas.estado_reserva_id',
                $idsEstadosValidosEstatisticas
            )
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate(
                    'reservas.data',
                    '>=',
                    $dataInicio
                )
            )
            ->groupBy('pisos.id', 'pisos.nome')
            ->orderByDesc('total')
            ->get();

        $utilizadoresComMaisReservas = Reserva::query()
            ->selectRaw('user_id, COUNT(*) as total')
            ->with('user')
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosValidosEstatisticas
            )
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate(
                    'data',
                    '>=',
                    $dataInicio
                )
            )
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $diasComMaiorOcupacao = Reserva::query()
            ->selectRaw('data, COUNT(*) as total')
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosValidosEstatisticas
            )
            ->when(
                $dataInicio,
                fn (Builder $query) => $query->whereDate(
                    'data',
                    '>=',
                    $dataInicio
                )
            )
            ->groupBy('data')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $reservasAtivasHoje = Reserva::query()
            ->whereDate('data', $hoje)
            ->whereIn('estado_reserva_id', $idsEstadosAtivos)
            ->with('periodo')
            ->get()
            ->groupBy('secretaria_id');

        $pisos = Piso::query()
    ->where('ativo', true)
    ->with([
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
            

        $reservaHojeUtilizador = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where('user_id', $request->user()->id)
            ->whereDate('data', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->orderBy('periodo_id')
            ->first();

        $proximasReservas = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where('user_id', $request->user()->id)
            ->whereDate('data', '>', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->orderBy('data')
            ->orderBy('periodo_id')
            ->take(5)
            ->get();

        $dados = [
            'pisos' => $pisos,
            'reservaHojeUtilizador' => $reservaHojeUtilizador,
            'proximasReservas' => $proximasReservas,
            'periodo' => $periodo,

            'stats' => [
                ...$stats,
                'totalReservas' => $totalReservas,
                'totalSecretarias' => $totalSecretarias,
            ],

            'estatisticas' => [
                'secretariasMaisUtilizadas' =>
                    $secretariasMaisUtilizadas,

                'secretariasMenosUtilizadas' =>
                    $secretariasMenosUtilizadas,

                'pisosPorUtilizacao' =>
                    $pisosPorUtilizacao,

                'pisoMaisUtilizado' =>
                    $pisosPorUtilizacao->first(),

                'utilizadoresComMaisReservas' =>
                    $utilizadoresComMaisReservas,

                'diasComMaiorOcupacao' =>
                    $diasComMaiorOcupacao,
            ],
        ];

        $role = $request->user()->role?->nome;

        if (in_array($role, ['Administrador', 'Gestor'], true)) {
            return Inertia::render('Dashboard/Admin', $dados);
        }

        if ($role === 'Colaborador') {
            return Inertia::render(
                'Dashboard/Funcionario',
                $dados
            );
        }

        return Inertia::render('Dashboard/Utilizador', $dados);
    }

    private function obterDataInicio(string $periodo): ?Carbon
    {
        return match ($periodo) {
            'semana' => Carbon::today()->startOfWeek(),
            'mes' => Carbon::today()->startOfMonth(),
            default => null,
        };
    }

    private function metricasDoDia(
        Carbon $dia,
        array $idsEstadosAtivos,
        ?int $estadoCanceladaId,
        ?int $estadoExpiradaId,
        int $totalSecretarias
    ): array {
        $reservas = Reserva::query()
            ->whereDate('data', $dia)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->count();

        $checkins = Reserva::query()
            ->whereDate('data', $dia)
            ->whereNotNull('check_in_at')
            ->count();

        $cancelamentos = $estadoCanceladaId
            ? Reserva::query()
                ->whereDate('data', $dia)
                ->where(
                    'estado_reserva_id',
                    $estadoCanceladaId
                )
                ->count()
            : 0;

        $expiradas = $estadoExpiradaId
            ? Reserva::query()
                ->whereDate('data', $dia)
                ->where(
                    'estado_reserva_id',
                    $estadoExpiradaId
                )
                ->count()
            : 0;

        $secretariasOcupadas = Reserva::query()
            ->whereDate('data', $dia)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos
            )
            ->distinct()
            ->count('secretaria_id');

        $mesasLivres = max(
            $totalSecretarias - $secretariasOcupadas,
            0
        );

        $taxaOcupacao = $totalSecretarias > 0
            ? (int) round(
                ($secretariasOcupadas / $totalSecretarias) * 100
            )
            : 0;

        return [
            'reservasHoje' => $reservas,
            'checkinsHoje' => $checkins,
            'cancelamentosHoje' => $cancelamentos,
            'reservasExpiradasHoje' => $expiradas,
            'mesasLivres' => $mesasLivres,
            'taxaOcupacao' => $taxaOcupacao,
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

                    $ocupadas = $setor->secretarias
                        ->filter(
                            fn (Secretaria $secretaria) =>
                                in_array(
                                    $this->statusDaSecretaria(
                                        $secretaria,
                                        $reservasAtivasHoje->get(
                                            $secretaria->id
                                        )
                                    ),
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
                    ];
                }
            );

        return [
            'id' => $piso->id,
            'nome' => $piso->nome,
            'codigo' => $piso->codigo,
            'numero' => $piso->numero,
            'planta' => $piso->planta,
            'totalSecretarias' =>
                $setores->sum('totalSecretarias'),
            'setores' => $setores,
        ];
    }

    private function percentChange(
        int|float $atual,
        int|float $anterior
    ): ?float {
        if ($anterior == 0) {
            return null;
        }

        return round(
            (($atual - $anterior) / $anterior) * 100,
            1
        );
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

        $reserva = $reservasAtivas->first(
            function (Reserva $reserva) use ($agora): bool {
                if (! $reserva->periodo) {
                    return false;
                }

                $inicio = Carbon::parse(
                    $reserva->data->format('Y-m-d')
                    .' '
                    .$reserva->periodo->hora_inicio
                );

                $fim = Carbon::parse(
                    $reserva->data->format('Y-m-d')
                    .' '
                    .$reserva->periodo->hora_fim
                );

                return $agora->between(
                    $inicio->copy()->subMinutes(30),
                    $fim
                );
            }
        );

        if (! $reserva || ! $reserva->periodo) {
            return 'livre';
        }

        $inicioPeriodo = Carbon::parse(
            $reserva->data->format('Y-m-d')
            .' '
            .$reserva->periodo->hora_inicio
        );

        $fimPeriodo = Carbon::parse(
            $reserva->data->format('Y-m-d')
            .' '
            .$reserva->periodo->hora_fim
        );

        if ($agora->greaterThan($fimPeriodo)) {
            return 'livre';
        }

        if ($reserva->check_in_at !== null) {
            return 'ocupada';
        }

        if (
            $agora->between(
                $inicioPeriodo->copy()->subMinutes(30),
                $inicioPeriodo->copy()->addMinutes(30)
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