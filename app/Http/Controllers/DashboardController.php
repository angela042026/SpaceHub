<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\Reserva;
use App\Services\DashboardMetricsService;
use App\Services\EstatisticasService;
use App\Services\MapaOcupacaoService;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly MapaOcupacaoService $mapaOcupacaoService,
        private readonly EstatisticasService $estatisticasService,
        private readonly DashboardMetricsService $dashboardMetricsService,
    ) {
    }

    public function index(DashboardRequest $request): Response
    {
        $hoje = Carbon::today();

        $periodo = $request->validated('periodo', 'geral');
        $dataInicio = $this->estatisticasService->obterDataInicio($periodo);

        $stats = $this->dashboardMetricsService->obterStats($hoje);
        $estatisticas = $this->estatisticasService->obterEstatisticas($dataInicio);
        $atividadeRecente = $this->dashboardMetricsService->obterAtividadeRecente();

        ['pisos' => $pisos, 'edificios' => $edificios] = $this->mapaOcupacaoService->obterDados();

        $idsEstadosAtivos = $this->dashboardMetricsService->idsEstadosAtivos();

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

            'stats' => $stats,

            'estatisticas' => $estatisticas,
            'atividadeRecente' => $atividadeRecente,
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
}