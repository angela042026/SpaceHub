<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fecha a lacuna de concorrência em reservas multi-dia com datas de
 * início diferentes: a constraint única em `reservas` só cobre
 * colisões com a mesma `data` de início (ver
 * 2026_07_23_090000_fix_unique_reserva_ativa_constraints.php), por
 * isso duas reservas com intervalos sobrepostos mas datas de início
 * diferentes podiam ambas ser inseridas sob concorrência real.
 *
 * `reserva_dias` representa o período como um slot atómico por dia
 * ("manha"/"tarde", com "Dia inteiro" a gerar as duas linhas por dia) —
 * uma linha por dia+slot ocupado, com unicidade real por secretária e
 * por utilizador. Não substitui a tabela `reservas` (que continua a
 * ser o registo histórico), serve só como trava de escrita.
 *
 * As consultas de disponibilidade existentes (ReservaDisponibilidadeService)
 * não foram alteradas — continuam a decidir o que aparece livre no
 * ecrã. Por isso o backfill abaixo cobre TODOS os dias do calendário
 * no intervalo [data, data_fim] de cada reserva ativa, incluindo fins
 * de semana dentro do intervalo, para que esta tabela nunca discorde
 * do que a disponibilidade já mostra como ocupado.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva_dias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reserva_id')
                ->constrained('reservas')
                ->cascadeOnDelete();

            $table->foreignId('secretaria_id')
                ->constrained('secretarias')
                ->restrictOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->date('dia');
            $table->enum('slot', ['manha', 'tarde']);

            $table->timestamps();

            $table->unique(
                ['secretaria_id', 'dia', 'slot'],
                'unique_reserva_dia_secretaria_slot'
            );

            $table->unique(
                ['user_id', 'dia', 'slot'],
                'unique_reserva_dia_utilizador_slot'
            );
        });

        $this->popularComReservasAtivas();
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva_dias');
    }

    /**
     * Sem isto, a constraint nova só protegeria reservas criadas DEPOIS
     * desta migration — qualquer reserva ativa já existente ficaria de
     * fora, e uma reserva nova podia colidir com uma antiga sem a BD
     * dar por isso.
     */
    private function popularComReservasAtivas(): void
    {
        $reservasAtivas = DB::table('reservas')
            ->join('periodos', 'reservas.periodo_id', '=', 'periodos.id')
            ->whereNull('reservas.cancelada_at')
            ->select([
                'reservas.id as reserva_id',
                'reservas.secretaria_id',
                'reservas.user_id',
                'reservas.data',
                'reservas.data_fim',
                'periodos.nome as periodo_nome',
            ])
            ->get();

        $agora = now();
        $linhas = [];

        foreach ($reservasAtivas as $reserva) {
            $slots = match ($reserva->periodo_nome) {
                'Manhã' => ['manha'],
                'Tarde' => ['tarde'],
                'Dia inteiro' => ['manha', 'tarde'],
                default => ['manha', 'tarde'],
            };

            $dia = Carbon::parse($reserva->data);
            $dataFim = Carbon::parse($reserva->data_fim ?? $reserva->data);

            while ($dia->lte($dataFim)) {
                foreach ($slots as $slot) {
                    $linhas[] = [
                        'reserva_id' => $reserva->reserva_id,
                        'secretaria_id' => $reserva->secretaria_id,
                        'user_id' => $reserva->user_id,
                        'dia' => $dia->toDateString(),
                        'slot' => $slot,
                        'created_at' => $agora,
                        'updated_at' => $agora,
                    ];
                }

                $dia->addDay();
            }
        }

        foreach (array_chunk($linhas, 500) as $lote) {
            DB::table('reserva_dias')->insert($lote);
        }
    }
};
