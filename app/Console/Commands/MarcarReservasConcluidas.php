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
    protected $description = 'Marca como concluídas (ou não compareceu) as reservas confirmadas cuja data/período já terminou';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');
        $estadoConcluidaId = EstadoReserva::idPorCodigo('concluida');
        $estadoNaoCompareceuId = EstadoReserva::idPorCodigo('nao_compareceu');

        if (! $estadoConfirmadaId || ! $estadoConcluidaId || ! $estadoNaoCompareceuId) {
            $this->error('Estados de reserva "confirmada", "concluida" ou "nao_compareceu" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        $hoje = Carbon::today();

        // Candidatas: reservas confirmadas cujo último dia (data_fim, ou a
        // própria data quando é só de um dia) já é hoje ou anterior — o
        // filtro fino por hora (para reservas de hoje) é feito a seguir,
        // em PHP, porque precisa da hora_fim do período.
        $candidatas = Reserva::with('periodo')
            ->where('estado_reserva_id', $estadoConfirmadaId)
            ->whereNull('cancelada_at')
            ->whereDate(DB::raw('COALESCE(data_fim, data)'), '<=', $hoje)
            ->get()
            ->filter(function (Reserva $reserva) use ($hoje) {
                $dataFimReserva = ($reserva->data_fim ?? $reserva->data)->copy()->startOfDay();

                // Dias inteiramente passados já podem ser concluídos, sem
                // olhar à hora.
                if ($dataFimReserva->lt($hoje)) {
                    return true;
                }

                // Ainda hoje: só conclui depois de o período terminar.
                if (! $reserva->periodo) {
                    return false;
                }

                $limite = Carbon::parse(
                    "{$dataFimReserva->format('Y-m-d')} {$reserva->periodo->hora_fim->format('H:i')}"
                );

                return now()->greaterThanOrEqualTo($limite);
            });

        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva confirmada por concluir.');

            return self::SUCCESS;
        }

        $concluidas = 0;
        $naoCompareceu = 0;

        foreach ($candidatas as $reserva) {
            try {
                DB::transaction(function () use (
                    $reserva,
                    $estadoConfirmadaId,
                    $estadoConcluidaId,
                    $estadoNaoCompareceuId,
                    &$concluidas,
                    &$naoCompareceu
                ) {
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

                    // A utilização só é considerada real quando houve
                    // check-in — sem ele, a secretária ficou por ocupar.
                    $fezCheckIn = $reservaBloqueada->check_in_at !== null;

                    $reservaBloqueada->update([
                        'estado_reserva_id' => $fezCheckIn
                            ? $estadoConcluidaId
                            : $estadoNaoCompareceuId,
                    ]);

                    if ($fezCheckIn) {
                        $concluidas++;
                    } else {
                        $naoCompareceu++;
                    }
                });
            } catch (\Throwable $e) {
                $this->error("Falha ao concluir reserva #{$reserva->id}: {$e->getMessage()}");
            }
        }

        if ($concluidas > 0 || $naoCompareceu > 0) {
            DashboardMetricsService::limparCacheDoDia();
        }

        $this->info("{$concluidas} reserva(s) marcada(s) como concluída(s), {$naoCompareceu} como não compareceu.");

        return self::SUCCESS;
    }
}
