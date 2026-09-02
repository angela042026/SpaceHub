<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * MySQL:
         *
         * 1. Permitir temporariamente os valores antigos e os novos.
         * 2. Converter os valores antigos.
         * 3. Restringir a coluna ao novo ENUM.
         */
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                ALTER TABLE setores
                MODIFY COLUMN tipo ENUM(
                    'coworking',
                    'reuniao',
                    'rececao',
                    'cafetaria',
                    'lounge',
                    'estacionamento',
                    'concentracao',
                    'phone_booth',
                    'wc',
                    'tecnico',
                    'outro',
                    'open_space',
                    'escritorio',
                    'escritorio_executivo',
                    'sala_reunioes',
                    'sala_criativa',
                    'copa',
                    'sala_espera'
                ) NOT NULL DEFAULT 'open_space'
            ");

            DB::table('setores')
                ->where('tipo', 'coworking')
                ->update(['tipo' => 'open_space']);

            DB::table('setores')
                ->where('tipo', 'reuniao')
                ->update(['tipo' => 'sala_reunioes']);

            DB::table('setores')
                ->where('tipo', 'cafetaria')
                ->update(['tipo' => 'copa']);

            DB::table('setores')
                ->where('tipo', 'concentracao')
                ->update(['tipo' => 'outro']);

            DB::statement("
                ALTER TABLE setores
                MODIFY COLUMN tipo ENUM(
                    'open_space',
                    'escritorio',
                    'escritorio_executivo',
                    'sala_reunioes',
                    'sala_criativa',
                    'phone_booth',
                    'rececao',
                    'copa',
                    'lounge',
                    'sala_espera',
                    'wc',
                    'estacionamento',
                    'tecnico',
                    'outro'
                ) NOT NULL DEFAULT 'open_space'
            ");

            return;
        }

        /*
         * SQLite e outros drivers:
         * não existe ENUM nativo nem MODIFY COLUMN.
         */
        Schema::table('setores', function (Blueprint $table) {
            $table->string('tipo', 50)
                ->default('open_space')
                ->change();
        });
    }

    public function down(): void
    {
        /*
         * Processo inverso:
         *
         * 1. Permitir temporariamente valores novos e antigos.
         * 2. Converter os novos para os antigos.
         * 3. Restaurar o ENUM antigo.
         */
        if (DB::getDriverName() === 'mysql') {
            DB::statement("
                ALTER TABLE setores
                MODIFY COLUMN tipo ENUM(
                    'open_space',
                    'escritorio',
                    'escritorio_executivo',
                    'sala_reunioes',
                    'sala_criativa',
                    'phone_booth',
                    'rececao',
                    'copa',
                    'lounge',
                    'sala_espera',
                    'wc',
                    'estacionamento',
                    'tecnico',
                    'outro',
                    'coworking',
                    'reuniao',
                    'cafetaria',
                    'concentracao'
                ) NOT NULL DEFAULT 'outro'
            ");

            DB::table('setores')
                ->where('tipo', 'open_space')
                ->update(['tipo' => 'coworking']);

            DB::table('setores')
                ->where('tipo', 'sala_reunioes')
                ->update(['tipo' => 'reuniao']);

            DB::table('setores')
                ->where('tipo', 'copa')
                ->update(['tipo' => 'cafetaria']);

            DB::table('setores')
                ->whereIn('tipo', [
                    'escritorio',
                    'escritorio_executivo',
                    'sala_criativa',
                    'sala_espera',
                ])
                ->update(['tipo' => 'concentracao']);

            DB::statement("
                ALTER TABLE setores
                MODIFY COLUMN tipo ENUM(
                    'coworking',
                    'reuniao',
                    'rececao',
                    'cafetaria',
                    'lounge',
                    'estacionamento',
                    'concentracao',
                    'phone_booth',
                    'wc',
                    'tecnico',
                    'outro'
                ) NOT NULL DEFAULT 'outro'
            ");

            return;
        }

        Schema::table('setores', function (Blueprint $table) {
            $table->string('tipo', 50)
                ->default('outro')
                ->change();
        });
    }
};
