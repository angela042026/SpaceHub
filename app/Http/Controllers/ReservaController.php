<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReservaController extends Controller
{
    // Listar as reservas do utilizador.
   
    public function index()
    {
        $reservas=Reserva::where('user_id', Auth::id()) // quando o utilizador esta autenticado
        ->with(['secretaria', 'periodo','estadoReserva'])
        ->orderBy('data','desc') //ordena da mais recente para a mais antiga
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
        //
    }

    /**
     * Guardar uma nova reserva.
     */
    public function store(Request $request)
    {
        //
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
