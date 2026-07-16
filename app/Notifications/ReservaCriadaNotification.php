<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReservaCriadaNotification extends Notification
{
    use Queueable;

    public function __construct(private $reserva) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'tipo' => 'reserva_criada',
            'titulo' => 'Reserva criada com sucesso!',
            'mensagem' => "A tua reserva para a secretária {$this->reserva->secretaria->codigo} no dia {$this->reserva->data} foi confirmada.",
            'reserva_id' => $this->reserva->id,
        ];
    }
}
