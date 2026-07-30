<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReservaExpiradaNotification extends Notification
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
            'tipo' => 'reserva_expirada',
            'titulo' => 'Reserva expirada',
            'mensagem' => "A tua reserva para o dia {$this->reserva->data->format('d/m/Y')} expirou por falta de check-in.",
            'reserva_id' => $this->reserva->id,
        ];
    }
}
