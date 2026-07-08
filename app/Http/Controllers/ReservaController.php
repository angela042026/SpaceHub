<?php

namespace App\Http\Controllers;

use App\Models\EstadoReserva;
use App\Models\Reserva;
use Illuminate\Http\RedirectResponse;

class ReservaController extends Controller
{
    /**
     * Cancela uma reserva do próprio utilizador autenticado.
     */
    public function cancelar(Reserva $reserva): RedirectResponse
    {
        if ($reserva->user_id !== auth()->id()) {
            abort(403, 'Esta reserva não te pertence.');
        }

        if ($reserva->check_in_at !== null) {
            return back()->withErrors(['reserva' => 'Não é possível cancelar uma reserva com check-in já efetuado.']);
        }

        $estadoCancelada = EstadoReserva::where('codigo', 'cancelada')->first();

        $reserva->update([
            'estado_reserva_id' => optional($estadoCancelada)->id ?? $reserva->estado_reserva_id,
            'cancelada_at' => now(),
        ]);

        return back()->with('success', 'Reserva cancelada com sucesso.');
    }
}
