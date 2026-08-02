<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class PaymentRequiredNotification extends Notification
{
    use Queueable;

    public function __construct(public Reserva $reserva) {}

    // Guardar na BD para histórico e broadcast (Reverb) para tempo real
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    // Dados guardados na coluna 'data' da tabela 'notifications'
    public function toArray(object $notifiable): array
    {
        return [
            'reserva_id' => $this->reserva->id,
            'titulo' => 'Pagamento Pendente',
            'mensagem' => "A tua reserva #{$this->reserva->id} aguarda pagamento.",
            'action_url' => route('reservas.index'),
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
