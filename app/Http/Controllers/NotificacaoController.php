<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificacaoController extends Controller
{
    /** Marca todas as notificações por ler do utilizador autenticado como lidas. */
    public function marcarLidas(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
