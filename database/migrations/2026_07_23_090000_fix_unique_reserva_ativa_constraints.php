<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * O índice único original (secretaria_id, data, periodo_id) não excluía
     * reservas canceladas/expiradas, pelo que, depois de uma reserva ser
     * cancelada, esse lugar/data/período ficava bloqueado para sempre.
     *
     * As colunas virtuais abaixo só têm valor quando a reserva está ativa
     * (cancelada_at IS NULL); o MySQL trata NULL como distinto em índices
     * únicos, por isso reservas canceladas deixam de contar para a
     * unicidade, ao mesmo tempo que continuam a impedir reservas ativas
     * em duplicado (proteção contra pedidos em simultâneo).
     */
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique('unique_reserva_secretaria_periodo');
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->unsignedBigInteger('secretaria_id_ativa')
                ->nullable()
                ->virtualAs('IF(cancelada_at IS NULL, secretaria_id, NULL)');

            $table->unsignedBigInteger('user_id_ativo')
                ->nullable()
                ->virtualAs('IF(cancelada_at IS NULL, user_id, NULL)');
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->unique(
                ['secretaria_id_ativa', 'data', 'periodo_id'],
                'unique_reserva_secretaria_periodo_ativa'
            );

            $table->unique(
                ['user_id_ativo', 'data', 'periodo_id'],
                'unique_reserva_utilizador_periodo_ativo'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique('unique_reserva_secretaria_periodo_ativa');
            $table->dropUnique('unique_reserva_utilizador_periodo_ativo');
            $table->dropColumn(['secretaria_id_ativa', 'user_id_ativo']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->unique(['secretaria_id', 'data', 'periodo_id'], 'unique_reserva_secretaria_periodo');
        });
    }
};
