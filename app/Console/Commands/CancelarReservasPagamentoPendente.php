<?php

namespace App\Console\Commands;

use App\Events\MapaAtualizado;
use App\Models\EstadoReserva;
use App\Models\Pagamento;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Notifications\PagamentoExpiradoNotification;
use App\Services\DashboardMetricsService;
use App\Services\PagamentoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelarReservasPagamentoPendente extends Command
{
    /**
     * Nome e assinatura do comando Artisan.
     *
     * @var string
     */
    protected $signature = 'pagamentos:cancelar-pendentes-expirados';

    /**
     * Descrição do comando.
     *
     * @var string
     */
    protected $description = 'Cancela reservas cujo pagamento continua pendente 30 minutos após a criação';

    public function __construct(private readonly PagamentoService $pagamentoService)
    {
        parent::__construct();
    }

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        $estadoCanceladaId = EstadoReserva::idPorCodigo('cancelada');

        if (! $estadoCanceladaId) {
            $this->error('Estado de reserva "cancelada" não encontrado. Corre o EstadoReservaSeeder.');

            return self::FAILURE;
        }

        $limite = now()->subMinutes(30);

        // Reservas ainda não canceladas cujo pagamento continua pendente
        // há mais de 30 minutos.
        $candidatas = Reserva::query()
            ->whereNull('cancelada_at')
            ->whereHas('pagamento', function ($query) use ($limite) {
                $query
                    ->where('estado', 'pendente')
                    ->where('created_at', '<=', $limite);
            })
            ->with(['user', 'secretaria', 'periodo'])
            ->get();

        if ($candidatas->isEmpty()) {
            $this->info('Nenhuma reserva com pagamento pendente expirado.');

            return self::SUCCESS;
        }

        $canceladas = 0;

        foreach ($candidatas as $reserva) {
            try {
                DB::transaction(function () use ($reserva, $estadoCanceladaId, $limite, &$canceladas) {
                    $reservaBloqueada = Reserva::whereKey($reserva->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($reservaBloqueada->cancelada_at !== null) {
                        return;
                    }

                    $pagamento = Pagamento::where('reserva_id', $reservaBloqueada->id)
                        ->lockForUpdate()
                        ->first();

                    // Confirma, já dentro do lock, que o pagamento continua
                    // pendente e expirado (evita cancelar um pagamento que
                    // acabou de ser concluído entretanto).
                    if (
                        $pagamento === null
                        || $pagamento->estado !== 'pendente'
                        || $pagamento->created_at->gt($limite)
                    ) {
                        return;
                    }

                    $this->pagamentoService->cancelarParaReserva($reservaBloqueada);

                    $reservaBloqueada->update([
                        'estado_reserva_id' => $estadoCanceladaId,
                        'cancelada_at' => now(),
                    ]);

                    ReservaDia::where('reserva_id', $reservaBloqueada->id)->delete();

                    $reserva->user?->notify(
                        new PagamentoExpiradoNotification($reserva)
                    );

                    $canceladas++;
                });
            } catch (\Throwable $e) {
                $this->error("Falha ao cancelar reserva #{$reserva->id}: {$e->getMessage()}");
            }
        }

        if ($canceladas > 0) {
            broadcast(new MapaAtualizado());
            DashboardMetricsService::limparCacheDoDia();
        }

        $this->info("{$canceladas} reserva(s) cancelada(s) por pagamento pendente expirado.");

        return self::SUCCESS;
    }
}
