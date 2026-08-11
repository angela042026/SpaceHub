<?php

namespace App\Console\Commands;

use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Services\DashboardMetricsService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MarcarReservasConcluidas extends Command
{
    /**
     * Nome e assinatura do comando Artisan.
     *
     * @var string
     */
    protected $signature = 'reservas:marcar-concluidas';

    /**
     * Descrição do comando.
     *
     * @var string
     */
    protected $description = 'Marca como concluídas as reservas confirmadas cuja data (ou data_fim, para reservas de vários dias) já passou';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');
        $estadoConcluidaId = EstadoReserva::idPorCodigo('concluida');

        if (! $estadoConfirmadaId || ! $estadoConcluidaId) {
            $this->error('Estados de reserva "confirmada" ou "concluida" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        $hoje = Carbon::today();

        // Reservas confirmadas cujo último dia (data_fim, ou a própria
        // data quando é só de um dia) já passou por completo.
        $candidatas = Reserva::query()
            ->where('estado_reserva_id', $estadoConfirmadaId)
            ->whereNull('cancelada_at')
            ->whereDate(DB::raw('COALESCE(data_fim, data)'), '<', $hoje)
            ->get();

        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva confirmada por concluir.');

            return self::SUCCESS;
        }

        $concluidas = 0;

        foreach ($candidatas as $reserva) {
            try {
                DB::transaction(function () use ($reserva, $estadoConfirmadaId, $estadoConcluidaId, &$concluidas) {
                    $reservaBloqueada = Reserva::whereKey($reserva->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    // Reconfirma, já dentro do lock, que continua
                    // confirmada e não foi cancelada entretanto.
                    if (
                        $reservaBloqueada->estado_reserva_id !== $estadoConfirmadaId
                        || $reservaBloqueada->cancelada_at !== null
                    ) {
                        return;
                    }

                    $reservaBloqueada->update([
                        'estado_reserva_id' => $estadoConcluidaId,
                    ]);

                    $concluidas++;
                });
            } catch (\Throwable $e) {
                $this->error("Falha ao concluir reserva #{$reserva->id}: {$e->getMessage()}");
            }
        }

        if ($concluidas > 0) {
            DashboardMetricsService::limparCacheDoDia();
        }

        $this->info("{$concluidas} reserva(s) marcada(s) como concluída(s).");

        return self::SUCCESS;
    }
}
