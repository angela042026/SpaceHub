<?php

namespace App\Console\Commands;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CancelarReservasExpiradas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservas:cancelar-expiradas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marca como expiradas as reservas pendentes sem check-in 30 minutos depois do início do período';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $estadoPendente = EstadoReserva::where('codigo', 'pendente')->first();
        $estadoExpirada = EstadoReserva::where('codigo', 'expirada')->first();

        if (! $estadoPendente || ! $estadoExpirada) {
            $this->error('Estados de reserva "pendente"/"expirada" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        $candidatas = Reserva::with('periodo')
            ->where('estado_reserva_id', $estadoPendente->id)
            ->whereNull('check_in_at')
            ->whereDate('data', '<=', Carbon::today())
            ->get()
            ->filter(function (Reserva $reserva) {
                if (! $reserva->periodo) {
                    return false;
                }

                $data = $reserva->data->format('Y-m-d');
                $limite = Carbon::parse("{$data} {$reserva->periodo->hora_inicio->format('H:i')}")->addMinutes(30);

                return now()->greaterThan($limite);
            });

        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva expirada encontrada.');

            return self::SUCCESS;
        }

        Reserva::whereIn('id', $candidatas->pluck('id'))
            ->update(['estado_reserva_id' => $estadoExpirada->id]);

        broadcast(new MapaAtualizado());

        $this->info("{$candidatas->count()} reserva(s) marcada(s) como expirada(s).");

        return self::SUCCESS;
    }
}
