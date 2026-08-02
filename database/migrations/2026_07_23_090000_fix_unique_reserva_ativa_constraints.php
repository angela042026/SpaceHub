<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * O índice único original (secretaria_id, data, periodo_id)
     * também estava a ser utilizado pelo MySQL para suportar
     * a chave estrangeira de secretaria_id.
     */
    public function up(): void
    {
        // 1. Tratamento da FK e Remoção do Índice Único Antigo
        Schema::table('reservas', function (Blueprint $table) {
            // Remove a FK temporariamente para o MySQL libertar o índice antigo
            $table->dropForeign(['secretaria_id']);

            // Remove o índice único original
            $table->dropUnique('unique_reserva_secretaria_periodo');

            // Voltar a criar a Foreign Key
            $table->foreign('secretaria_id')
                ->references('id')
                ->on('secretarias')
                ->onDelete('cascade');

            // Cria um índice normal explicito para suporte à FK
            $table->index('secretaria_id', 'reservas_secretaria_id_index');
        });

        // 2. Preparação das Colunas Virtuais de Acordo com o Driver
        $driver = DB::connection()->getDriverName();

        $expressaoSecretaria = $driver === 'sqlite'
            ? 'CASE WHEN cancelada_at IS NULL THEN secretaria_id ELSE NULL END'
            : 'IF(cancelada_at IS NULL, secretaria_id, NULL)';

        $expressaoUtilizador = $driver === 'sqlite'
            ? 'CASE WHEN cancelada_at IS NULL THEN user_id ELSE NULL END'
            : 'IF(cancelada_at IS NULL, user_id, NULL)';

        // 3. Adicionar Colunas Virtuais e Novos Índices Únicos Parciais
        Schema::table('reservas', function (Blueprint $table) use ($expressaoSecretaria, $expressaoUtilizador) {
            $table->unsignedBigInteger('secretaria_id_ativa')
                ->nullable()
                ->virtualAs($expressaoSecretaria);

            $table->unsignedBigInteger('user_id_ativo')
                ->nullable()
                ->virtualAs($expressaoUtilizador);

            // Impede reservas ativas duplicadas por secretaria
            $table->unique(
                ['secretaria_id_ativa', 'data', 'periodo_id'],
                'unique_reserva_secretaria_periodo_ativa'
            );

            // Impede reservas ativas duplicadas pelo mesmo utilizador
            $table->unique(
                ['user_id_ativo', 'data', 'periodo_id'],
                'unique_reserva_utilizador_periodo_ativo'
            );
        });
    }

    public function down(): void
    {
        // 1. Remover Índices Únicos e Colunas Virtuais
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique('unique_reserva_secretaria_periodo_ativa');
            $table->dropUnique('unique_reserva_utilizador_periodo_ativo');
            $table->dropColumn(['secretaria_id_ativa', 'user_id_ativo']);
        });

        // 2. Restaurar Estado Original do Índice Único e da FK
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex('reservas_secretaria_id_index');

            $table->unique(
                ['secretaria_id', 'data', 'periodo_id'],
                'unique_reserva_secretaria_periodo'
            );
        });
    }
};
