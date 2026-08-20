<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AvaliacaoResource;
use App\Models\Avaliacao;
use App\Notifications\AvaliacaoAprovadaNotification;
use App\Notifications\AvaliacaoRejeitadaNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AvaliacaoController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Avaliacao::class);

        $query = Avaliacao::query()
            ->with(['reserva.user', 'reserva.secretaria.setor', 'reserva.periodo']);

        $estado = $request->filled('estado') ? $request->input('estado') : 'pendente';

        if ($estado !== 'todas') {
            $query->where('estado', $estado);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('comentario', 'like', "%{$search}%")
                    ->orWhereHas('reserva.user', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('reserva.secretaria', fn ($q) => $q->where('codigo', 'like', "%{$search}%"));
            });
        }

        $avaliacoes = $query
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        // Contagens por estado (independentes dos filtros aplicados acima)
        // para os 4 cards de resumo e para o número junto de cada pill de
        // filtro — só leitura, não interfere com a lógica de moderação.
        $contagens = Avaliacao::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $totalGeral = (int) $contagens->sum();
        $pendentes = (int) ($contagens['pendente'] ?? 0);
        $aprovadas = (int) ($contagens['aprovada'] ?? 0);
        $rejeitadas = (int) ($contagens['rejeitada'] ?? 0);

        $mediaAprovadas = round((float) (Avaliacao::where('estado', 'aprovada')->avg('nota') ?? 0), 1);

        $taxaAprovacao = ($aprovadas + $rejeitadas) > 0
            ? round($aprovadas / ($aprovadas + $rejeitadas) * 100, 1)
            : 0.0;

        return Inertia::render('Admin/Avaliacoes/Index', [
            'avaliacoes' => AvaliacaoResource::collection($avaliacoes)->response()->getData(true),
            'filters' => $request->only(['estado', 'search']),
            'stats' => [
                'total' => $totalGeral,
                'media' => $mediaAprovadas,
                'pendentes' => $pendentes,
                'taxaAprovacao' => $taxaAprovacao,
                'porEstado' => [
                    'todas' => $totalGeral,
                    'pendente' => $pendentes,
                    'aprovada' => $aprovadas,
                    'rejeitada' => $rejeitadas,
                ],
            ],
        ]);
    }

    public function aprovar(Avaliacao $avaliacao): RedirectResponse
    {
        Gate::authorize('moderar', $avaliacao);

        if ($avaliacao->estado !== 'pendente') {
            return back()->with('error', __('Esta avaliação já foi moderada.'));
        }

        $avaliacao->update(['estado' => 'aprovada']);

        $avaliacao->reserva->user?->notify(new AvaliacaoAprovadaNotification($avaliacao));

        return back()->with('success', __('Avaliação aprovada.'));
    }

    public function rejeitar(Avaliacao $avaliacao): RedirectResponse
    {
        Gate::authorize('moderar', $avaliacao);

        if ($avaliacao->estado !== 'pendente') {
            return back()->with('error', __('Esta avaliação já foi moderada.'));
        }

        $avaliacao->update(['estado' => 'rejeitada']);

        $avaliacao->reserva->user?->notify(new AvaliacaoRejeitadaNotification($avaliacao));

        return back()->with('success', __('Avaliação rejeitada.'));
    }
}
