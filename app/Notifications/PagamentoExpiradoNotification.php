<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PagamentoExpiradoNotification extends Notification implements ShouldQueue
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
            'tipo' => 'pagamento_expirado',
            'titulo' => __('Reserva cancelada por falta de pagamento'),
            'mensagem' => __('O pagamento da tua reserva para a secretária :secretaria no dia :data não foi concluído a tempo e a reserva foi cancelada.', [
                'secretaria' => $this->reserva->secretaria->codigo,
                'data' => $this->reserva->data->format('d/m/Y'),
            ]),
            'reserva_id' => $this->reserva->id,
        ];
    }
}
