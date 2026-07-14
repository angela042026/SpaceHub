<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reservas/Index');
    }


    public function create(): Response
    {
        return Inertia::render('Reservas/Create');
    }


    // A criação é efetuada através de API.
    public function store(Request $request)
    {
        //
    }

    //Não utilizado nesta fase.
    //O módulo não possui uma página de detalhe da reserva.
    public function show(string $id)
    {
        //
    }


    /**
     * Mostrar o formulário de edição.
     * Futuramente será utilizado Route Model Binding.
     */
    public function edit(string $id): Response
    {
        return Inertia::render('Reservas/Edit', [
            'id' => $id,
        ]);
    }


    // A atualização é efetuada através da API.
     
    public function update(Request $request, string $id)
    {
        //
    }


    // Não existe eliminação física de reservas.
    //O cancelamento é efetuado através da API.
    public function destroy(string $id)
    {
        //
    }

    public function history(): Response
    {
        return Inertia::render('Reservas/History');
    }


    public function availability(): Response
    {
        return Inertia::render('Reservas/Availability');
    }
}
