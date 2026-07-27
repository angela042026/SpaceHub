<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SuporteRespondidoNotification extends Notification
{
    use Queueable;

    public function __construct(private $pedido) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'tipo' => 'suporte_respondido',
            'titulo' => 'Pedido de Suporte Resolvido',
            'mensagem' => "O teu pedido de suporte sobre o assunto \"{$this->pedido->assunto}\" foi respondido: \"{$this->pedido->resposta}\"",
            'pedido_id' => $this->pedido->id,
        ];
    }
}
