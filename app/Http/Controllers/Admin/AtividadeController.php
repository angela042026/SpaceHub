<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AtividadeController extends Controller
{
    private const PERIODOS = [
        'hoje' => 'Hoje',
        '7dias' => 'Últimos 7 dias',
        '30dias' => 'Últimos 30 dias',
        '90dias' => 'Últimos 90 dias',
        'tudo' => 'Todo o período',
    ];

    /**
     * Lista o Registo de Atividade, com pesquisa, filtros e paginação de
     * 10 por página. "Últimos 7 dias" é o período por omissão.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ActivityLog::class);

        $registos = $this->queryFiltrada($request)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Atividade/Index', [
            'registos' => $registos,
            'acoes' => $this->opcoesAcoes(),
            'utilizadores' => User::whereHas('activityLogs')
                ->orderBy('name')
                ->get(['id', 'name']),
            'periodos' => $this->opcoesPeriodos(),
            'filters' => $request->only(['search', 'acao', 'utilizador', 'periodo']),
            // Sem filtros nenhuns, para o frontend distinguir "não há
            // atividade nenhuma no sistema" de "os filtros aplicados não
            // encontraram nada".
            'existemRegistos' => ActivityLog::query()->exists(),
        ]);
    }

    /**
     * Query com pesquisa + filtros aplicados, usada por index() — não
     * carrega os registos todos em memória antes de filtrar.
     */
    private function queryFiltrada(Request $request): Builder
    {
        $query = ActivityLog::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('actor_name', 'like', "%{$search}%")
                    ->orWhere('actor_email', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('acao')) {
            $query->where('action', $request->input('acao'));
        }

        if ($request->filled('utilizador')) {
            $query->where('actor_id', $request->integer('utilizador'));
        }

        $periodo = $request->input('periodo', '7dias');

        match ($periodo) {
            'hoje' => $query->whereDate('created_at', now()->toDateString()),
            '30dias' => $query->where('created_at', '>=', now()->subDays(30)),
            '90dias' => $query->where('created_at', '>=', now()->subDays(90)),
            'tudo' => null,
            default => $query->where('created_at', '>=', now()->subDays(7)),
        };

        return $query;
    }

    private function opcoesAcoes()
    {
        return collect(ActivityLogger::ACOES)->map(
            fn (array $info, string $codigo) => ['codigo' => $codigo, 'label' => $info['label']]
        )->values();
    }

    private function opcoesPeriodos()
    {
        return collect(self::PERIODOS)->map(
            fn (string $label, string $codigo) => ['codigo' => $codigo, 'label' => $label]
        )->values();
    }
}
