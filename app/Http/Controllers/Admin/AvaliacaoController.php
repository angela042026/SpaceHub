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

        return Inertia::render('Admin/Avaliacoes/Index', [
            'avaliacoes' => AvaliacaoResource::collection($avaliacoes)->response()->getData(true),
            'filters' => $request->only(['estado', 'search']),
        ]);
    }

    public function aprovar(Avaliacao $avaliacao): RedirectResponse
    {
        Gate::authorize('moderar', $avaliacao);

        if ($avaliacao->estado !== 'pendente') {
            return back()->with('error', 'Esta avaliação já foi moderada.');
        }

        $avaliacao->update(['estado' => 'aprovada']);

        $avaliacao->reserva->user?->notify(new AvaliacaoAprovadaNotification($avaliacao));

        return back()->with('success', 'Avaliação aprovada.');
    }

    public function rejeitar(Avaliacao $avaliacao): RedirectResponse
    {
        Gate::authorize('moderar', $avaliacao);

        if ($avaliacao->estado !== 'pendente') {
            return back()->with('error', 'Esta avaliação já foi moderada.');
        }

        $avaliacao->update(['estado' => 'rejeitada']);

        $avaliacao->reserva->user?->notify(new AvaliacaoRejeitadaNotification($avaliacao));

        return back()->with('success', 'Avaliação rejeitada.');
    }
}
