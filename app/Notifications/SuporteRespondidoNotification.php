<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SuporteRespondidoNotification extends Notification implements ShouldQueue
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
            'titulo' => __('Pedido de Suporte Resolvido'),
            'mensagem' => __('O teu pedido de suporte sobre o assunto ":assunto" foi respondido: ":resposta"', [
                'assunto' => $this->pedido->assunto,
                'resposta' => $this->pedido->resposta,
            ]),
            'pedido_id' => $this->pedido->id,
        ];
    }
}
