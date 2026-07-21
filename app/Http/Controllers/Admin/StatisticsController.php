<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setor;
use App\Services\EstatisticasService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function __construct(
        private readonly EstatisticasService $estatisticasService,
    ) {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Setor::class);

        $periodo = $request->input('periodo', 'geral');

        if (! in_array($periodo, ['geral', 'semana', 'mes'], true)) {
            $periodo = 'geral';
        }

        $dataInicio = $this->estatisticasService->obterDataInicio($periodo);

        return Inertia::render('Admin/Statistics/Index', [
            'estatisticas' => $this->estatisticasService->obterEstatisticas($dataInicio),
            'periodo' => $periodo,
            'geradoEm' => now()->format('d/m/Y H:i'),
        ]);
    }
}
