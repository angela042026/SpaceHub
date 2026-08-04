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
            'titulo' => 'Reserva cancelada',
            'mensagem' => "A tua reserva para o dia {$this->reserva->data->format('d/m/Y')} foi cancelada com sucesso.",
            'reserva_id' => $this->reserva->id,
        ];
    }
}
