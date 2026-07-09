<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reserva;
use App\Models\EstadoReserva;
use Carbon\Carbon;

class CancelarReservasSemCheckIn extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cancelar-reservas-sem-check-in';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancela automaticamente as reservas sem check-in após 30 minutos.';




    /**
     * Executa o comando de cancelamento automático das reservas sem check-in.
     */
    public function handle()
    {
        // Obtém o estado "Expirada"
        $estadoExpirada = EstadoReserva::where('codigo', 'expirada')->firstOrFail();

        // Obtém todas as reservas pendentes que ainda não realizaram check-in e que ainda não foram canceladas.
        $reservas = Reserva::whereHas('estadoReserva', function ($query) {
            $query->where('codigo', 'pendente');
        })
            ->whereNull('check_in_at')
            ->whereNull('cancelada_at')
            ->with('periodo')
            ->get();

        // Percorre todas as reservas encontradas
        foreach ($reservas as $reserva) {

            // Obtém a data da reserva
            $dataReserva = Carbon::parse($reserva->data);

            // Obtém a hora de início do período
            $horaInicio = Carbon::parse($reserva->periodo->hora_inicio);

            // Junta a data da reserva com a hora de início do período
            $inicioPeriodo = Carbon::parse($dataReserva->format('Y-m-d') . ' ' . $horaInicio->format('H:i:s'));

            // Define o limite de check-in (30 minutos após o início do período)
            $horaLimite = $inicioPeriodo->copy()->addMinutes(30);

            // Verifica se o tempo limite já foi ultrapassado
            if (now()->greaterThanOrEqualTo($horaLimite)) {

                // Atualiza o estado da reserva para "Expirada"
                $reserva->update(['estado_reserva_id' => $estadoExpirada->id,'cancelada_at' => now(), ]);

                // Apresenta uma mensagem no terminal
                $this->info('Reserva #' . $reserva->id . ' cancelada automaticamente.');
            }
        }
    }
}
