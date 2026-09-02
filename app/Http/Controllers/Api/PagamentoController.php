<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmarPagamentoRequest;
use App\Http\Requests\ListarPagamentosRequest;
use App\Http\Resources\PagamentoResource;
use App\Models\Pagamento;
use App\Services\PagamentoService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class PagamentoController extends Controller
{
    /**
     * Lista os pagamentos do utilizador autenticado.
     */
    public function index(
        ListarPagamentosRequest $request
    ): AnonymousResourceCollection {
        Gate::authorize('viewAny', Pagamento::class);

        $query = Pagamento::query()
            ->whereHas(
                'reserva',
                function ($query) use ($request): void {
                    $query->where(
                        'user_id',
                        $request->user()->id
                    );
                }
            )
            ->with([
                'reserva.periodo',
                'reserva.secretaria.setor',
            ]);

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

        $perPage = $request->integer('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $pagamentos = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return PagamentoResource::collection($pagamentos);
    }

    /**
     * Apresenta um pagamento.
     */
    public function show(
        Pagamento $pagamento
    ): PagamentoResource {
        $pagamento->load([
            'reserva.periodo',
            'reserva.secretaria.setor',
        ]);

        Gate::authorize('view', $pagamento);

        return new PagamentoResource($pagamento);
    }

    /**
     * Confirma um pagamento simulado.
     */
    public function confirmar(
        ConfirmarPagamentoRequest $request,
        Pagamento $pagamento,
        PagamentoService $pagamentoService
    ): PagamentoResource {
        $pagamento->load('reserva');

        Gate::authorize('confirmar', $pagamento);

        $pagamentoConfirmado =
            $pagamentoService->confirmarPagamento(
                $pagamento,
                $request->validated('metodo_pagamento')
            );

        $pagamentoConfirmado->load([
            'reserva.periodo',
            'reserva.secretaria.setor',
        ]);

        Log::notice('Pagamento simulado confirmado.', [
            'ator_id' => $request->user()->id,
            'pagamento_id' => $pagamentoConfirmado->id,
            'reserva_id' => $pagamentoConfirmado->reserva_id,
            'valor' => $pagamentoConfirmado->valor,
            'metodo_pagamento' => $pagamentoConfirmado->metodo_pagamento,
        ]);

        return new PagamentoResource(
            $pagamentoConfirmado
        );
    }
}
