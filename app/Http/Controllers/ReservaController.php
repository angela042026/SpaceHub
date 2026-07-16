<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservaController extends Controller
{
    /**
     * Listar as reservas do utilizador.
     */

    public function index()
    {
        return Inertia::render('Reservas/Index');
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
