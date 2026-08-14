<?php

namespace App\Http\Controllers;

use App\Models\Edificio;
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

        // A listagem em si já não é pré-calculada aqui — a página busca-a
        // do lado do cliente a partir de lugaresPorSetor() (mesma rota já
        // usada por "Nova Reserva" e "Editar Reserva"), com debounce e
        // reatualização automática a cada filtro. Esta ação só prepara as
        // opções dos filtros e os valores iniciais.
        return Inertia::render('Reservas/Availability', [
            'periodos' => $this->disponibilidade->periodosAtivos(),
            'pisos' => $this->disponibilidade->pisosAtivosParaReserva(),
            'setores' => $this->disponibilidade->setoresReservaveis(),
            'edificios' => Edificio::where('ativo', true)
                ->orderBy('nome')
                ->get(),
            'filters' => $request->only([
                'data',
                'periodo_id',
                'edificio_id',
                'piso_id',
                'setor_id',
            ]),
        ]);
    }

    /**
     * Lugares com a disponibilidade de cada período numa data.
     *
     * Usado pelos cartões das páginas "Nova Reserva" e "Editar Reserva".
     * Em "Editar Reserva" vem sempre com setor_id (mantém o comportamento
     * antigo); em "Nova Reserva", piso_id e setor_id são ambos opcionais
     * — quando omitidos, devolve lugares de todo o edifício, para os
     * espaços aparecerem imediatamente sem obrigar a escolher piso e
     * categoria primeiro.
     */
    public function lugaresPorSetor(Request $request)
    {
        $request->validate([
            'data' => ['required', 'date'],
            'setor_id' => ['nullable', 'exists:setores,id'],
            'piso_id' => ['nullable', 'exists:pisos,id'],
            'edificio_id' => ['nullable', 'exists:edificios,id'],

            ...array_fill_keys(
                ReservaDisponibilidadeService::CARACTERISTICAS_FILTRAVEIS,
                ['sometimes', 'boolean']
            ),

            'excluir_reserva_id' => ['sometimes', 'nullable', 'exists:reservas,id'],
        ]);

        return response()->json(
            $this->disponibilidade->secretariasComDisponibilidade(
                $request->data,
                $request->filled('setor_id') ? $request->setor_id : null,
                $this->disponibilidade->preferenciasDaRequisicao($request),
                $request->integer('excluir_reserva_id') ?: null,
                $request->filled('piso_id') ? $request->piso_id : null,
                $request->filled('edificio_id') ? $request->edificio_id : null
            )
        );
    }
}
