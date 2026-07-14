<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Services\MapaOcupacaoService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
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

    public function __construct(
        private readonly MapaOcupacaoService $mapaOcupacaoService
    ) {
    }

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

        $setoresPorUtilizacao = Reserva::query()
            ->selectRaw(
                'setores.id, setores.nome, COUNT(reservas.id) as total'
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
            ->groupBy('setores.id', 'setores.nome')
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

        ['pisos' => $pisos, 'edificios' => $edificios] = $this->mapaOcupacaoService->obterDados();

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
            'edificios' => $edificios,
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

                'setoresPorUtilizacao' =>
                    $setoresPorUtilizacao,

                'setorMaisUtilizado' =>
                    $setoresPorUtilizacao->first(),

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
}