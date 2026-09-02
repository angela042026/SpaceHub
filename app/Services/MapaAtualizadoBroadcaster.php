<?php

namespace App\Services;

use App\Events\MapaAtualizado;
use Illuminate\Broadcasting\BroadcastException;

class MapaAtualizadoBroadcaster
{
    /**
     * Atualiza os clientes em tempo real sem comprometer a operação principal
     * quando o servidor de broadcasting estiver indisponível.
     */
    public static function broadcast(): void
    {
        try {
            broadcast(new MapaAtualizado);
        } catch (BroadcastException $exception) {
            report($exception);
        }
    }
}
