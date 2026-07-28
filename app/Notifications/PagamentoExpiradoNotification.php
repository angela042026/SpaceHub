<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PagamentoExpiradoNotification extends Notification
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
            'titulo' => 'Reserva cancelada por falta de pagamento',
            'mensagem' => "O pagamento da tua reserva para a secretária {$this->reserva->secretaria->codigo} no dia {$this->reserva->data->format('d/m/Y')} não foi concluído a tempo e a reserva foi cancelada.",
            'reserva_id' => $this->reserva->id,
        ];
    }
}
