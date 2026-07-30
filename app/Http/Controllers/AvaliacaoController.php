<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAvaliacaoRequest;
use App\Http\Resources\AvaliacaoResource;
use App\Models\Avaliacao;
use App\Models\Reserva;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AvaliacaoController extends Controller
{
    /**
     * Lista as avaliações do próprio utilizador.
     */
    public function index(): Response
    {
        $avaliacoes = Avaliacao::query()
            ->whereHas('reserva', fn ($q) => $q->where('user_id', Auth::id()))
            ->with(['reserva.secretaria.setor', 'reserva.periodo'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Avaliacoes/Index', [
            'avaliacoes' => AvaliacaoResource::collection($avaliacoes)->response()->getData(true),
        ]);
    }

    /**
     * Regista a avaliação de uma reserva. Só é permitido depois do
     * check-in (prova que o espaço foi mesmo usado) e uma vez por reserva.
     */
    public function store(StoreAvaliacaoRequest $request, Reserva $reserva): RedirectResponse
    {
        if ($reserva->user_id !== Auth::id()) {
            abort(403, 'Esta reserva não te pertence.');
        }

        if ($reserva->check_in_at === null) {
            return back()->withErrors([
                'avaliacao' => 'Só podes avaliar reservas em que já fizeste check-in.',
            ]);
        }

        if ($reserva->avaliacao !== null) {
            return back()->withErrors([
                'avaliacao' => 'Já avaliaste esta reserva.',
            ]);
        }

        Avaliacao::create([
            'reserva_id' => $reserva->id,
            'nota' => $request->integer('nota'),
            'comentario' => $request->string('comentario'),
            'estado' => 'pendente',
        ]);

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Avaliação enviada com sucesso. Obrigado pelo feedback!');
    }
}
