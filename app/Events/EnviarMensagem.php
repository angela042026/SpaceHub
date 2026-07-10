<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class EnviarMensagem implements ShouldBroadcastNow

{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $texto;

    public function __construct($user, $texto)
    {
        $this->user = $user;
        $this->texto = $texto;
    }

    public function broadcastOn(): array
    {
        // Define o canal público chamado 'chat'
        return [
            new Channel('chat'),
        ];
    }

    public function broadcastAs(): string
    {
        // Define o nome exato do evento que o Echo vai ouvir
        return 'MensagemTeste';
    }
}
