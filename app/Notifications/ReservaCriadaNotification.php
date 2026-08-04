<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReservaCriadaNotification extends Notification implements ShouldQueue
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
            'mensagem' => "A tua reserva para a secretária {$this->reserva->secretaria->codigo} no dia {$this->reserva->data->format('d/m/Y')} ({$this->duracaoLabel()}) foi confirmada.",
            'reserva_id' => $this->reserva->id,
        ];
    }

    private function duracaoLabel(): string
    {
        return match ($this->reserva->tipo_duracao) {
            'semanal' => 'Semanal',
            'mensal' => 'Mensal',
            'anual' => 'Anual',
            default => $this->reserva->periodo?->nome ?? 'Diária',
        };
    }
}
