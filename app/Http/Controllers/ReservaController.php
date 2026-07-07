<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Periodo;
use App\Models\EstadoReserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReservaController extends Controller
{
    /**
     * Listar as reservas do utilizador autenticado.
     */
    public function index()
    {
        $reservas = Reserva::where('user_id', Auth::id())
            ->with(['secretaria', 'periodo', 'estadoReserva'])
            ->orderBy('data', 'desc')
            ->get();

        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas,
        ]);
    }

    /**
     * Mostrar o formulário de nova reserva.
     */
    public function create()
    {
        $secretarias = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->orderBy('codigo')
            ->get();

        $periodos = Periodo::where('ativo', true)
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Reservas/Create', [
            'secretarias' => $secretarias,
            'periodos' => $periodos,
        ]);
    }

    /**
     * Guardar uma nova reserva.
     */
    public function store(Request $request)
    {
        // Validar os dados do formulário
        $request->validate([
            'data' => ['required', 'date'],
            'periodo_id' => ['required', 'exists:periodos,id'],
            'secretaria_id' => ['required', 'exists:secretarias,id'],
            'observacoes' => ['nullable', 'string', 'max:500'],
        ]);

        // Obtém o estado "Pendente"
        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->firstOrFail();

        // Cria a reserva
        Reserva::create([
            'user_id'            => Auth::id(),
            'secretaria_id'      => $request->secretaria_id,
            'periodo_id'         => $request->periodo_id,
            'estado_reserva_id'  => $estadoPendente->id,
            'data'               => $request->data,
            'observacoes'        => $request->observacoes,
        ]);

        return redirect()
            ->route('reservas.index')
            ->with('success', 'Reserva criada com sucesso.');
    }

    /**
     * Mostrar os detalhes de uma reserva.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Mostrar o formulário de edição.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Atualizar uma reserva.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Cancelar uma reserva.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Histórico de reservas.
     */
    public function history()
    {
        //
    }

    /**
     * Consultar disponibilidade das secretárias.
     */
    public function availability()
    {
        //
    }
}