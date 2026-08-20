<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReservaCanceladaNotification extends Notification implements ShouldQueue
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
            'tipo' => 'reserva_cancelada',
            'titulo' => __('Reserva cancelada'),
            'mensagem' => __('A tua reserva para o dia :data foi cancelada com sucesso.', [
                'data' => $this->reserva->data->format('d/m/Y'),
            ]),
            'reserva_id' => $this->reserva->id,
        ];
    }
}
