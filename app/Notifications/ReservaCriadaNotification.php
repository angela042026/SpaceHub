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
            'titulo' => __('Reserva criada com sucesso!'),
            'mensagem' => __('A tua reserva para a secretária :secretaria no dia :data (:duracao) foi confirmada.', [
                'secretaria' => $this->reserva->secretaria->codigo,
                'data' => $this->reserva->data->format('d/m/Y'),
                'duracao' => $this->duracaoLabel(),
            ]),
            'reserva_id' => $this->reserva->id,
        ];
    }

    private function duracaoLabel(): string
    {
        return match ($this->reserva->tipo_duracao) {
            'semanal' => __('Semanal'),
            'mensal' => __('Mensal'),
            'anual' => __('Anual'),
            default => $this->reserva->periodo?->nome ?? __('Diária'),
        };
    }
}
