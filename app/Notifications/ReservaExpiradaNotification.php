<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReservaExpiradaNotification extends Notification implements ShouldQueue
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
            'titulo' => __('Reserva expirada'),
            'mensagem' => __('A tua reserva para o dia :data expirou por falta de check-in.', [
                'data' => $this->reserva->data->format('d/m/Y'),
            ]),
            'reserva_id' => $this->reserva->id,
        ];
    }
}
