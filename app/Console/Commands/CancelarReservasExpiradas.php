<?php

namespace App\Console\Commands;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Notifications\ReservaExpiradaNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CancelarReservasExpiradas extends Command
{
    /**
     * Nome e assinatura do comando Artisan.
     *
     * @var string
     */
    protected $signature = 'reservas:cancelar-expiradas';

    /**
     * Descrição do comando.
     *
     * @var string
     */
    protected $description = 'Marca como expiradas as reservas pendentes sem check-in 30 minutos após o início do período';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        // Obtém os estados "Pendente" e "Expirada"
        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->first();
        $estadoExpirada = EstadoReserva::where('codigo', 'expirada')->first();

        // Verifica se os estados existem na base de dados
        if (! $estadoPendente || ! $estadoExpirada) {
            $this->error('Estados de reserva "pendente" ou "expirada" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        // Procura todas as reservas pendentes, sem check-in e ainda não canceladas
        $candidatas = Reserva::with(['periodo', 'user'])
            ->where('estado_reserva_id', $estadoPendente->id)
            ->whereNull('check_in_at')
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', Carbon::today())
            ->get()
            ->filter(function (Reserva $reserva) {

                // Ignora reservas que não tenham um período associado
                if (! $reserva->periodo) {
                    return false;
                }

                // Obtém a data da reserva
                $data = $reserva->data->format('Y-m-d');

                // Calcula a hora limite para realização do check-in
                $limite = Carbon::parse(
                    "{$data} {$reserva->periodo->hora_inicio->format('H:i')}"
                )->addMinutes(30);

                // Verifica se já passaram 30 minutos desde o início do período
                return now()->greaterThanOrEqualTo($limite);
            });

        // Caso não existam reservas para expirar
        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva expirada encontrada.');

            return self::SUCCESS;
        }

        // Atualiza todas as reservas encontradas para o estado "Expirada"
        // e regista a data/hora do cancelamento automático
        Reserva::whereIn('id', $candidatas->pluck('id'))
            ->update([
                'estado_reserva_id' => $estadoExpirada->id,
                'cancelada_at' => now(),
            ]);

        // Avisa cada utilizador de que a sua reserva expirou
        foreach ($candidatas as $reserva) {
            $reserva->user?->notify(new ReservaExpiradaNotification($reserva));
        }

        // Atualiza o mapa em tempo real para todos os utilizadores
        broadcast(new MapaAtualizado());

        // Apresenta no terminal o número de reservas expiradas
        $this->info("{$candidatas->count()} reserva(s) marcada(s) como expirada(s).");

        return self::SUCCESS;
    }
}