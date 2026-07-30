<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Histórico de reservas passadas do utilizador autenticado.
 *
 * Controller de ação única: é uma listagem própria, paginada e só de
 * leitura, sem relação com o CRUD de reservas do ReservaController.
 */
class ReservaHistoricoController extends Controller
{
    public function __invoke()
    {
        $reservas = Reserva::where('user_id', Auth::id())
            ->whereDate('data', '<', now()->toDateString())
            ->with([
                'secretaria.setor',
                'periodo',
                'estadoReserva',
            ])
            ->orderBy('data', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Reservas/History', [
            'reservas' => $reservas,
        ]);
    }
}
