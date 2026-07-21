<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class EnviarMensagem implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $texto;
    public $opcoes;

    public function __construct($user, $texto, $opcoes = [])
    {
        $this->user = $user;
        $this->texto = $texto;
        $this->opcoes = $opcoes;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MensagemTeste';
    }
}
