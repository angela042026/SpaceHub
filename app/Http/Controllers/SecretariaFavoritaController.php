<?php

namespace App\Http\Controllers;

use App\Models\Secretaria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Estrela de "secretária favorita" clicada pelo utilizador em Minhas
 * Reservas — marca/desmarca a secretária (não a reserva em si), para
 * que a preferência valha em qualquer reserva futura da mesma mesa.
 * Ver User::secretariasFavoritas() e
 * DashboardController::obterAtividadePessoal().
 */
class SecretariaFavoritaController extends Controller
{
    public function toggle(Secretaria $secretaria): RedirectResponse
    {
        $favoritas = Auth::user()->secretariasFavoritas();

        if ($favoritas->where('secretaria_id', $secretaria->id)->exists()) {
            $favoritas->detach($secretaria->id);
        } else {
            $favoritas->attach($secretaria->id);
        }

        return back();
    }
}
