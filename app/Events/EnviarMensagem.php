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
    public $opcoes; // Preservamos o teu ficheiro e injetamos as opções aqui!

    public function __construct($user, $texto, $opcoes = [])
    {
        $this->user = $user;
        $this->texto = $texto;
        $this->opcoes = $opcoes;
    }

    public function broadcastOn(): array
    {
        // Mantém o teu canal público original chamado 'chat'
        return [
            new Channel('chat'),
        ];
    }

    public function broadcastAs(): string
    {
        // Mantém o nome exato que o teu Echo já está a ouvir no React
        return 'MensagemTeste';
    }
}
