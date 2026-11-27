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
     *
     * Antes de remover esse índice único, criamos um índice normal
     * para secretaria_id, mantendo a foreign key válida.
     *
     * As colunas virtuais apenas possuem valor quando a reserva
     * está ativa, ou seja, quando cancelada_at é NULL.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        /*
         * Cria primeiro um índice normal para suportar
         * a foreign key de secretaria_id.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->index(
                'secretaria_id',
                'reservas_secretaria_id_index'
            );
        });

        /*
         * O PostgreSQL resolve esta regra de forma nativa com índices
         * únicos parciais, sem precisar das colunas virtuais do MySQL.
         */
        if ($driver === 'pgsql') {
            DB::statement('CREATE UNIQUE INDEX unique_reserva_secretaria_periodo_ativa ON reservas (secretaria_id, data, periodo_id) WHERE cancelada_at IS NULL');
            DB::statement('CREATE UNIQUE INDEX unique_reserva_utilizador_periodo_ativo ON reservas (user_id, data, periodo_id) WHERE cancelada_at IS NULL');

            return;
        }

        /*
         * Agora o índice único antigo pode ser removido.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique(
                'unique_reserva_secretaria_periodo'
            );
        });

        /*
         * O MySQL aceita a função IF().
         * O SQLite, utilizado nos testes, utiliza CASE WHEN.
         */
        $expressaoSecretaria = $driver === 'sqlite'
            ? 'CASE WHEN cancelada_at IS NULL THEN secretaria_id ELSE NULL END'
            : 'IF(cancelada_at IS NULL, secretaria_id, NULL)';

        $expressaoUtilizador = $driver === 'sqlite'
            ? 'CASE WHEN cancelada_at IS NULL THEN user_id ELSE NULL END'
            : 'IF(cancelada_at IS NULL, user_id, NULL)';

        /*
         * Colunas virtuais usadas apenas para reservas ativas.
         */
        Schema::table('reservas', function (Blueprint $table) use (
            $expressaoSecretaria,
            $expressaoUtilizador
        ) {
            $table->unsignedBigInteger('secretaria_id_ativa')
                ->nullable()
                ->virtualAs($expressaoSecretaria);

            $table->unsignedBigInteger('user_id_ativo')
                ->nullable()
                ->virtualAs($expressaoUtilizador);
        });

        /*
         * Impede reservas ativas duplicadas.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->unique(
                [
                    'secretaria_id_ativa',
                    'data',
                    'periodo_id',
                ],
                'unique_reserva_secretaria_periodo_ativa'
            );

            $table->unique(
                [
                    'user_id_ativo',
                    'data',
                    'periodo_id',
                ],
                'unique_reserva_utilizador_periodo_ativo'
            );
        });
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS unique_reserva_secretaria_periodo_ativa');
            DB::statement('DROP INDEX IF EXISTS unique_reserva_utilizador_periodo_ativo');

            Schema::table('reservas', function (Blueprint $table) {
                $table->unique(
                    ['secretaria_id', 'data', 'periodo_id'],
                    'unique_reserva_secretaria_periodo'
                );

                $table->dropIndex('reservas_secretaria_id_index');
            });

            return;
        }

        /*
         * Remove os novos índices únicos.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropUnique(
                'unique_reserva_secretaria_periodo_ativa'
            );

            $table->dropUnique(
                'unique_reserva_utilizador_periodo_ativo'
            );
        });

        /*
         * Remove as colunas virtuais.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn([
                'secretaria_id_ativa',
                'user_id_ativo',
            ]);
        });

        /*
         * Recria o índice único original.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->unique(
                [
                    'secretaria_id',
                    'data',
                    'periodo_id',
                ],
                'unique_reserva_secretaria_periodo'
            );
        });

        /*
         * O índice normal já não é necessário porque o índice
         * único original voltou a suportar a foreign key.
         */
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(
                'reservas_secretaria_id_index'
            );
        });
    }
};
