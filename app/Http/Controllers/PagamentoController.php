<?php

namespace App\Http\Controllers;

use App\Models\Pagamento;
use App\Services\PagamentoService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PagamentoController extends Controller
{
    private PagamentoService $pagamentoService;

    public function __construct(PagamentoService $pagamentoService)
    {
        $this->pagamentoService = $pagamentoService;
    }

    /**
     * Lista os pagamentos do utilizador autenticado.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Pagamento::class);

        $user = Auth::user();

        $query = Pagamento::query()
            ->with([
                'reserva.user',
                'reserva.periodo',
                'reserva.secretaria.setor',
            ]);

        /*
         * O administrador vê todos os pagamentos.
         * Os restantes utilizadores veem apenas os próprios.
         */
        if ($user->role?->nome !== 'Administrador') {
            $query->whereHas('reserva', function ($query) use ($user): void {
                $query->where('user_id', $user->id);
            });
        }

        if ($request->filled('estado')) {
            $query->where(
                'estado',
                $request->input('estado')
            );
        }

        if ($request->filled('metodo_pagamento')) {
            $query->where(
                'metodo_pagamento',
                $request->input('metodo_pagamento')
            );
        }

        $pagamentos = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Pagamentos/Index', [
            'pagamentos' => $pagamentos,

            'filters' => $request->only([
                'estado',
                'metodo_pagamento',
            ]),

            'isAdmin' => $user->role?->nome === 'Administrador',
        ]);
    }

    /**
     * Apresenta o detalhe de um pagamento.
     */
    public function show(Pagamento $pagamento): Response
    {
        $pagamento->load([
            'reserva.periodo',
            'reserva.secretaria.setor',
        ]);

        Gate::authorize('view', $pagamento);

        return Inertia::render('Pagamentos/Show', [
            'pagamento' => $pagamento,
        ]);
    }

    /**
     * Confirma um pagamento.
     */
   public function confirmar(
    Request $request,
    Pagamento $pagamento
): RedirectResponse {
    Gate::authorize('confirmar', $pagamento);

    $dados = $request->validate([
        'metodo_pagamento' => [
            'required',
            'in:cartao,mbway,transferencia',
        ],
    ]);

    $this->pagamentoService->confirmarPagamento(
        $pagamento,
        $dados['metodo_pagamento']
    );

    return redirect()
        ->route('pagamentos.show', $pagamento)
        ->with(
            'success',
            'Pagamento confirmado com sucesso.'
        );
}

}