<?php

namespace App\Console\Commands;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Notifications\ReservaExpiradaNotification;
use App\Services\ActivityLogger;
use App\Services\DashboardMetricsService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

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
    protected $description = 'Marca como expiradas as reservas pendentes sem check-in dentro da tolerância configurada (reservas.tolerancia_checkin_minutos)';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        // Obtém os estados "Pendente" e "Expirada" (cacheados — ver
        // EstadoReserva::idPorCodigo())
        $estadoPendenteId = EstadoReserva::idPorCodigo('pendente');
        $estadoExpiradaId = EstadoReserva::idPorCodigo('expirada');

        // Verifica se os estados existem na base de dados
        if (! $estadoPendenteId || ! $estadoExpiradaId) {
            $this->error('Estados de reserva "pendente" ou "expirada" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        // Procura todas as reservas pendentes, sem check-in e ainda não canceladas
        $candidatas = Reserva::with(['periodo', 'user'])
            ->where('estado_reserva_id', $estadoPendenteId)
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
                )->addMinutes(config('reservas.tolerancia_checkin_minutos'));

                // Verifica se já passou a tolerância desde o início do período
                return now()->greaterThanOrEqualTo($limite);
            });

        // Caso não existam reservas para expirar
        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva expirada encontrada.');

            return self::SUCCESS;
        }

        $expiradas = 0;

        // Cada candidata é processada na sua própria transação com
        // lockForUpdate() + reconfirmação depois do lock — o mesmo
        // padrão já usado em CancelarReservasPagamentoPendente. Sem
        // isto, duas execuções sobrepostas do comando podiam marcar a
        // mesma reserva como expirada e notificar o utilizador duas
        // vezes.
        foreach ($candidatas as $reserva) {
            try {
                DB::transaction(function () use (
                    $reserva,
                    $estadoExpiradaId,
                    &$expiradas
                ) {
                    $reservaBloqueada = Reserva::whereKey($reserva->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if (
                        $reservaBloqueada->cancelada_at !== null
                        || $reservaBloqueada->check_in_at !== null
                    ) {
                        return;
                    }

                    $reservaBloqueada->update([
                        'estado_reserva_id' => $estadoExpiradaId,
                        'cancelada_at' => now(),
                    ]);

                    ReservaDia::where('reserva_id', $reservaBloqueada->id)->delete();

                    $reserva->user?->notify(
                        new ReservaExpiradaNotification($reserva)
                    );

                    $reservaBloqueada->loadMissing('secretaria');

                    ActivityLogger::log(
                        null,
                        'reserva_cancelada',
                        sprintf(
                            '%s · %s (sem check-in dentro do prazo)',
                            $reserva->user?->name ?? '-',
                            $reservaBloqueada->secretaria?->codigo ?? '-'
                        ),
                        $reservaBloqueada
                    );

                    $expiradas++;
                });
            } catch (\Throwable $e) {
                $this->error("Falha ao expirar reserva #{$reserva->id}: {$e->getMessage()}");
            }
        }

        if ($expiradas > 0) {
            // Atualiza o mapa em tempo real para todos os utilizadores
            broadcast(new MapaAtualizado);
            DashboardMetricsService::limparCacheDoDia();
        }

        // Apresenta no terminal o número de reservas expiradas
        $this->info("{$expiradas} reserva(s) marcada(s) como expirada(s).");

        return self::SUCCESS;
    }
}
