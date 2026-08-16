<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setor;
use App\Services\EstatisticasService;
use App\Services\MapaOcupacaoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    /**
     * Períodos aceites pelo dashboard de Estatísticas (redesign) — cada
     * um tem uma janela anterior do mesmo tamanho, para os KPIs
     * mostrarem sempre uma comparação. "Geral"/"semana"/"mês" (usados
     * pelo antigo EstatisticasService::obterEstatisticas()) deixaram de
     * ser aceites aqui, mas o método continua disponível no serviço.
     */
    private const PERIODOS_ACEITES = ['7dias', '30dias', '90dias', 'ano'];

    public function __construct(
        private readonly EstatisticasService $estatisticasService,
        private readonly MapaOcupacaoService $mapaOcupacaoService,
    ) {
    }

    public function index(Request $request): Response
    {
        // 'viewAny' de SetorPolicy devolve sempre true — 'create' é que
        // está restrita a Administrador/Gestor (ver o mesmo padrão,
        // mais detalhado, em ReportController::autorizarAcessoRelatorios()).
        Gate::authorize('create', Setor::class);

        $periodo = $request->input('periodo', '30dias');

        if (! in_array($periodo, self::PERIODOS_ACEITES, true)) {
            $periodo = '30dias';
        }

        $edificioId = $request->filled('edificio_id')
            ? $request->integer('edificio_id')
            : null;

        [
            'pisos' => $pisos,
            'edificios' => $edificios,
        ] = $this->mapaOcupacaoService->obterDados();

        return Inertia::render('Admin/Statistics/Index', [
            'dashboard' => $this->estatisticasService->obterDashboard($periodo, $edificioId),
            'periodo' => $periodo,
            'edificioId' => $edificioId,
            // Já vem só com id+nome selecionados (ver
            // MapaOcupacaoService::obterDados()) — reutilizado tanto para
            // o filtro de "Reservas por Piso" como para o Mapa de Ocupação.
            'edificios' => $edificios,
            // Mapa de Ocupação: fotografia em tempo real (não filtrada
            // pelo período escolhido) — ver MapaOcupacaoService::obterDados().
            'mapaOcupacao' => [
                'pisos' => $pisos,
                'edificios' => $edificios,
            ],
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }
}
