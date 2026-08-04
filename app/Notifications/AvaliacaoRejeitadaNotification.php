<?php

namespace App\Notifications;

use App\Models\Avaliacao;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AvaliacaoRejeitadaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Avaliacao $avaliacao) {}

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dados = $this->toArray($notifiable);

        return (new MailMessage)
            ->subject($dados['titulo'])
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line($dados['mensagem'])
            ->action('Ver as minhas reservas', route('reservas.index'))
            ->line('Obrigado por utilizares o SpaceHub.');
    }

    public function toArray($notifiable): array
    {
        return [
            'tipo' => 'avaliacao_rejeitada',
            'titulo' => 'Avaliação rejeitada',
            'mensagem' => 'A tua avaliação não foi aprovada para publicação.',
            'reserva_id' => $this->avaliacao->reserva_id,
        ];
    }
}
