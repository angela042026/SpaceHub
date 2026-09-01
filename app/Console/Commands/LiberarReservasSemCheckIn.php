<?php

namespace App\Console\Commands;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Services\ActivityLogger;
use App\Services\DashboardMetricsService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * CHECKIN-JANELA: liberta, dia a dia, as reservas confirmadas que
 * fiquem sem check-in 30 minutos (config('reservas.tolerancia_checkin_minutos'))
 * depois do início do período — a secretária fica de novo reservável
 * nesse dia específico e a ocorrência é registada como "não
 * compareceu". Numa reserva de vários dias (semanal/mensal/anual), só
 * o dia em causa é libertado; os restantes continuam ativos e o
 * pagamento é mantido, sem reembolso. Só quando o dia libertado é o
 * último do intervalo [data, data_fim] é que a reserva em si passa a
 * "não compareceu" — enquanto restarem dias por vir, mantém-se
 * "confirmada".
 */
class LiberarReservasSemCheckIn extends Command
{
    /**
     * Nome e assinatura do comando Artisan.
     *
     * @var string
     */
    protected $signature = 'reservas:liberar-nao-comparecimentos';

    /**
     * Descrição do comando.
     *
     * @var string
     */
    protected $description = 'Liberta, dia a dia, as reservas confirmadas sem check-in dentro da tolerância configurada';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        $estadoConfirmadaId = EstadoReserva::idPorCodigo('confirmada');
        $estadoNaoCompareceuId = EstadoReserva::idPorCodigo('nao_compareceu');

        if (! $estadoConfirmadaId || ! $estadoNaoCompareceuId) {
            $this->error('Estados de reserva "confirmada" ou "nao_compareceu" não encontrados. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        $hoje = Carbon::today();
        $tolerancia = (int) config('reservas.tolerancia_checkin_minutos');

        $candidatas = Reserva::with(['periodo', 'user', 'secretaria', 'diasOcupados'])
            ->where('estado_reserva_id', $estadoConfirmadaId)
            ->whereNull('check_in_at')
            ->whereNull('cancelada_at')
            ->whereDate('data', '<=', $hoje)
            ->get()
            ->filter(fn (Reserva $reserva) => $reserva->periodo !== null);

        $diasLibertados = 0;

        foreach ($candidatas as $reserva) {
            $diasParaLibertar = $this->diasParaLibertar($reserva, $hoje, $tolerancia);

            if ($diasParaLibertar->isEmpty()) {
                continue;
            }

            try {
                DB::transaction(function () use (
                    $reserva,
                    $diasParaLibertar,
                    $estadoConfirmadaId,
                    $estadoNaoCompareceuId,
                    $hoje,
                    &$diasLibertados
                ) {
                    $reservaBloqueada = Reserva::whereKey($reserva->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    // Reconfirma, já dentro do lock, que continua
                    // confirmada e sem check-in — pode ter mudado entre a
                    // consulta inicial e este momento.
                    if (
                        $reservaBloqueada->estado_reserva_id !== $estadoConfirmadaId
                        || $reservaBloqueada->cancelada_at !== null
                        || $reservaBloqueada->check_in_at !== null
                    ) {
                        return;
                    }

                    foreach ($diasParaLibertar as $dia) {
                        // Apaga (não só marca) a linha do dia: além de
                        // libertar a disponibilidade mostrada
                        // (ReservaDisponibilidadeService/MapaOcupacaoService),
                        // isto liberta também o índice único de
                        // reserva_dias — sem isto, uma nova reserva para
                        // este mesmo dia+secretária colidia sempre com a
                        // linha antiga, mesmo já "libertada".
                        ReservaDia::where('reserva_id', $reservaBloqueada->id)
                            ->whereDate('dia', $dia->toDateString())
                            ->delete();

                        ActivityLogger::log(
                            null,
                            'reserva_nao_compareceu',
                            sprintf(
                                '%s · %s (dia %s)',
                                $reserva->user?->name ?? '-',
                                $reserva->secretaria?->codigo ?? '-',
                                $dia->format('d/m/Y')
                            ),
                            $reservaBloqueada,
                            ['dia' => $dia->toDateString()]
                        );

                        $diasLibertados++;
                    }

                    // Só quando já não restam dias por vir é que a reserva
                    // em si passa a "não compareceu" — se ainda há dias
                    // futuros dentro do intervalo, mantém-se "confirmada"
                    // (ver docblock da classe).
                    $dataFimReserva = ($reservaBloqueada->data_fim ?? $reservaBloqueada->data)
                        ->copy()
                        ->startOfDay();

                    if ($hoje->gte($dataFimReserva)) {
                        $reservaBloqueada->update([
                            'estado_reserva_id' => $estadoNaoCompareceuId,
                        ]);
                    }
                });
            } catch (\Throwable $e) {
                $this->error("Falha ao libertar dia(s) da reserva #{$reserva->id}: {$e->getMessage()}");
            }
        }

        if ($diasLibertados > 0) {
            broadcast(new MapaAtualizado);
            DashboardMetricsService::limparCacheDoDia();
        }

        $this->info("{$diasLibertados} dia(s) libertado(s) por falta de check-in.");

        return self::SUCCESS;
    }

    /**
     * Dias de $reserva, entre [data, hoje], que ainda têm linha em
     * reserva_dias (dias já libertados não têm mais nenhuma) e cuja
     * tolerância de check-in a partir do início do período já passou.
     */
    private function diasParaLibertar(Reserva $reserva, Carbon $hoje, int $tolerancia): Collection
    {
        $diasComReservaDia = $reserva->diasOcupados
            ->pluck('dia')
            ->map(fn (Carbon $dia) => $dia->toDateString())
            ->unique();

        $dataFim = ($reserva->data_fim ?? $reserva->data)->copy()->startOfDay();
        $limiteVarrimento = $hoje->lt($dataFim) ? $hoje : $dataFim;

        $dias = collect();
        $dia = $reserva->data->copy()->startOfDay();

        while ($dia->lte($limiteVarrimento)) {
            if ($diasComReservaDia->contains($dia->toDateString())) {
                $limite = Carbon::parse(
                    "{$dia->toDateString()} {$reserva->periodo->hora_inicio->format('H:i')}"
                )->addMinutes($tolerancia);

                if (now()->greaterThanOrEqualTo($limite)) {
                    $dias->push($dia->copy());
                }
            }

            $dia->addDay();
        }

        return $dias;
    }
}
