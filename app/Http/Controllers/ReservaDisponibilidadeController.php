<?php

namespace App\Http\Controllers;

use App\Services\ReservaDisponibilidadeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Consulta de disponibilidade de lugares.
 *
 * Separado do ReservaController porque são pedidos read-only (a página
 * dedicada de consulta e os pedidos JSON do formulário de reserva), sem
 * qualquer escrita de reservas ou pagamentos.
 */
class ReservaDisponibilidadeController extends Controller
{
    public function __construct(
        private ReservaDisponibilidadeService $disponibilidade
    ) {
    }

    /**
     * Consultar disponibilidade dos lugares.
     *
     * Usado tanto pela consulta em direto do formulário de criação (JSON)
     * como pela página dedicada de consulta de disponibilidade (Inertia).
     */
    public function index(Request $request)
    {
        if ($request->wantsJson()) {

            $request->validate([
                'data' => ['required', 'date'],
                'periodo_id' => ['required', 'exists:periodos,id'],
                'setor_id' => ['nullable', 'exists:setores,id'],
            ]);

            return response()->json(
                $this->disponibilidade->secretariasDisponiveis(
                    $request->data,
                    $request->periodo_id,
                    $request->setor_id
                )
            );
        }

        $secretariasDisponiveis = null;

        if (
            $request->filled('data') &&
            $request->filled('periodo_id') &&
            $request->filled('setor_id')
        ) {

            $request->validate([
                'data' => ['required', 'date'],
                'periodo_id' => ['required', 'exists:periodos,id'],
                'setor_id' => ['required', 'exists:setores,id'],
            ]);

            $secretariasDisponiveis = $this->disponibilidade
                ->secretariasDisponiveis(
                    $request->data,
                    $request->periodo_id,
                    $request->setor_id
                )
                ->load('setor.piso.edificio');
        }

        return Inertia::render('Reservas/Availability', [
            'periodos' => $this->disponibilidade->periodosReservaAtivos(),
            'pisos' => $this->disponibilidade->pisosAtivosParaReserva(),
            'setores' => $this->disponibilidade->setoresReservaveis(),
            'secretariasDisponiveis' => $secretariasDisponiveis,
            'filters' => $request->only([
                'data',
                'periodo_id',
                'setor_id',
            ]),
        ]);
    }

    /**
     * Lugares de um setor com a disponibilidade de cada período numa data.
     *
     * Usado pelos cartões das páginas "Nova Reserva" e "Editar Reserva",
     * onde cada lugar mostra diretamente os períodos (Manhã/Tarde) que
     * ainda estão livres.
     */
    public function lugaresPorSetor(Request $request)
    {
        $request->validate([
            'data' => ['required', 'date'],
            'setor_id' => ['required', 'exists:setores,id'],

            ...array_fill_keys(
                ReservaDisponibilidadeService::CARACTERISTICAS_FILTRAVEIS,
                ['sometimes', 'boolean']
            ),

            'excluir_reserva_id' => ['sometimes', 'nullable', 'exists:reservas,id'],
        ]);

        return response()->json(
            $this->disponibilidade->secretariasComDisponibilidade(
                $request->data,
                $request->setor_id,
                $this->disponibilidade->preferenciasDaRequisicao($request),
                $request->integer('excluir_reserva_id') ?: null
            )
        );
    }
}
