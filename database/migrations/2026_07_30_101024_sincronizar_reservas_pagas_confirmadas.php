<?php

use App\Models\EstadoReserva;
use App\Models\Reserva;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Atualiza todas as reservas que já têm um pagamento pago
     * para o estado "confirmada".
     */
    public function up(): void
    {
        $estadoConfirmada = EstadoReserva::query()
            ->where('codigo', 'confirmada')
            ->first();

        if (! $estadoConfirmada) {
            return;
        }

        Reserva::query()
            ->whereHas('pagamento', function ($query) {
                $query->where('estado', 'pago');
            })
            ->where('estado_reserva_id', '!=', $estadoConfirmada->id)
            ->update([
                'estado_reserva_id' => $estadoConfirmada->id,
            ]);
    }

    /**
     * Esta alteração de dados não é revertida automaticamente,
     * porque não é possível saber quais reservas estavam pendentes
     * antes da sincronização.
     */
    public function down(): void
    {
        //
    }
};
