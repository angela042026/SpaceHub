<?php

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Http\Requests\DashboardRequest;
use App\Models\Reserva;
use App\Services\DashboardMetricsService;
use App\Services\EstatisticasService;
use App\Services\MapaOcupacaoService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $stats =
            $this->dashboardMetricsService
            ->obterStats($hoje);

        // "Destaques do período" tem o seu próprio toggle (30
        // dias/90 dias/Ano), independente do filtro "periodo" acima
        // (que não está ligado a nenhum controlo na interface) — o
        // valor inicial deve bater certo com o botão ativo por omissão.
        $estatisticas =
            $this->estatisticasService
            ->obterEstatisticas(
                $this->estatisticasService->obterDataInicio('30dias')
            );

        $atividadeRecente =
            $this->dashboardMetricsService
            ->obterAtividadeRecente();

        $tendenciaOcupacao =
            $this->dashboardMetricsService
            ->obterTendenciaOcupacaoComparativa($hoje);

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
        | Este conjunto de dados será utilizado pelo gráfico de barras
        | apresentado ao lado do mapa no dashboard administrativo. Janela
        | fixa de 30 dias por omissão, independente do filtro "periodo"
        | de estatísticas — ver DashboardMetricsService para os detalhes
        | (só conta "confirmada", exclui canceladas/expiradas).
        */

        $reservasPorPiso =
            $this->dashboardMetricsService
            ->obterReservasPorPisoComparativo($hoje);

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

            'tendenciaOcupacao' =>
            $tendenciaOcupacao,
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

    /**
     * Dados do gráfico "Evolução da Ocupação" para um período e piso
     * escolhidos na interface — chamado via fetch() quando o
     * administrador muda o toggle 7/30/90 dias ou o filtro de piso, sem
     * recarregar o dashboard inteiro.
     */
    public function tendenciaOcupacao(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'dias' => ['sometimes', 'integer', 'in:7,30,90'],
            'piso_id' => ['sometimes', 'nullable', 'integer', 'exists:pisos,id'],
        ]);

        return response()->json(
            $this->dashboardMetricsService->obterTendenciaOcupacaoComparativa(
                Carbon::today(),
                (int) ($dados['dias'] ?? 7),
                isset($dados['piso_id']) ? (int) $dados['piso_id'] : null
            )
        );
    }

    /**
     * Dados do gráfico "Reservas por piso" para um período escolhido na
     * interface.
     */
    public function reservasPorPiso(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'dias' => ['sometimes', 'integer', 'in:7,30,90'],
        ]);

        return response()->json(
            $this->dashboardMetricsService->obterReservasPorPisoComparativo(
                Carbon::today(),
                (int) ($dados['dias'] ?? 30)
            )
        );
    }

    /**
     * Dados do card "Destaques do período" para o período escolhido no
     * toggle (30 dias/90 dias/Ano), chamado via fetch() sem recarregar
     * o dashboard inteiro.
     */
    public function destaques(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'periodo' => ['sometimes', 'in:30dias,90dias,ano'],
        ]);

        return response()->json(
            $this->estatisticasService->obterEstatisticas(
                $this->estatisticasService->obterDataInicio($dados['periodo'] ?? '30dias')
            )
        );
    }
}
