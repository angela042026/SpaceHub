<?php

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Http\Requests\DashboardRequest;
use App\Models\Reserva;
use App\Services\DashboardMetricsService;
use App\Services\EstatisticasService;
use App\Services\MapaOcupacaoService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly MapaOcupacaoService $mapaOcupacaoService,
        private readonly EstatisticasService $estatisticasService,
        private readonly DashboardMetricsService $dashboardMetricsService,
    ) {}

    public function index(DashboardRequest $request): Response
    {
        $hoje = Carbon::today();

        $periodo = $request->validated(
            'periodo',
            'geral',
        );

        $dataInicio =
            $this->estatisticasService
            ->obterDataInicio($periodo);

        $stats =
            $this->dashboardMetricsService
            ->obterStats($hoje);

        $estatisticas =
            $this->estatisticasService
            ->obterEstatisticas($dataInicio);

        $atividadeRecente =
            $this->dashboardMetricsService
            ->obterAtividadeRecente();

        [
            'pisos' => $pisos,
            'edificios' => $edificios,
        ] = $this->mapaOcupacaoService->obterDados();

        $idsEstadosAtivos =
            $this->dashboardMetricsService
            ->idsEstadosAtivos();

        /*
        |--------------------------------------------------------------------------
        | Reservas por piso
        |--------------------------------------------------------------------------
        |
        | Este conjunto de dados será utilizado pelo gráfico horizontal
        | apresentado ao lado do mapa no dashboard administrativo.
        |
        */

        $reservasPorPiso = Reserva::query()
            ->join(
                'secretarias',
                'reservas.secretaria_id',
                '=',
                'secretarias.id',
            )
            ->join(
                'setores',
                'secretarias.setor_id',
                '=',
                'setores.id',
            )
            ->join(
                'pisos',
                'setores.piso_id',
                '=',
                'pisos.id',
            )
            ->when(
                $dataInicio,
                function (Builder $query) use (
                    $dataInicio,
                    $hoje,
                ) {
                    $query
                        ->whereDate(
                            'reservas.data',
                            '>=',
                            $dataInicio,
                        )
                        ->whereDate(
                            'reservas.data',
                            '<=',
                            $hoje,
                        );
                },
            )
            ->whereNull('reservas.cancelada_at')
            ->select([
                'pisos.id',
                'pisos.nome',
            ])
            ->selectRaw(
                'COUNT(reservas.id) as total',
            )
            ->groupBy(
                'pisos.id',
                'pisos.nome',
            )
            ->orderByDesc('total')
            ->get()
            ->map(fn ($piso) => [
                'id' => $piso->id,
                'nome' => $piso->nome,
                'total' => (int) $piso->total,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Reserva atual do utilizador
        |--------------------------------------------------------------------------
        */

        $reservaHojeUtilizador = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where(
                'user_id',
                $request->user()->id,
            )
            ->whereDate('data', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos,
            )
            ->orderBy('periodo_id')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Próximas reservas do utilizador
        |--------------------------------------------------------------------------
        */

        $proximasReservas = Reserva::query()
            ->with([
                'secretaria.setor.piso.edificio',
                'periodo',
                'estadoReserva',
            ])
            ->where(
                'user_id',
                $request->user()->id,
            )
            ->whereDate('data', '>', $hoje)
            ->whereIn(
                'estado_reserva_id',
                $idsEstadosAtivos,
            )
            ->orderBy('data')
            ->orderBy('periodo_id')
            ->take(5)
            ->get();

        $dados = [
            'pisos' => $pisos,
            'edificios' => $edificios,

            'reservaHojeUtilizador' =>
            $reservaHojeUtilizador,

            'proximasReservas' =>
            $proximasReservas,

            'periodo' => $periodo,
            'stats' => $stats,
            'estatisticas' => $estatisticas,

            'atividadeRecente' =>
            $atividadeRecente,

            'reservasPorPiso' =>
            $reservasPorPiso,
        ];

        $user = $request->user();

        if ($user->isAdministrador() || $user->isGestor()) {
            return Inertia::render(
                'Dashboard/Admin',
                $dados,
            );
        }

        if ($user->hasRole(RoleName::Colaborador)) {
            return Inertia::render(
                'Dashboard/Funcionario',
                $dados,
            );
        }

        return Inertia::render(
            'Dashboard/Utilizador',
            $dados,
        );
    }
}
