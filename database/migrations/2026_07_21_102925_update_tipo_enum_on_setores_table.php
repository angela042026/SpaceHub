<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // "ALTER ... MODIFY COLUMN ... ENUM" é sintaxe exclusiva do MySQL.
        // Noutros drivers (ex.: SQLite em memória, usado nos testes) não
        // existe ENUM nativo nem suporte a MODIFY COLUMN, por isso a
        // constraint é recriada de forma portável pelo Schema Builder.
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
                    'outro'
                ) NOT NULL DEFAULT 'open_space'
            ");

            return;
        }

        Schema::table('setores', function (Blueprint $table) {
            $table->string('tipo', 50)->default('open_space')->change();
        });
    }

    public function down(): void
    {
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
                    'outro'
                ) NOT NULL DEFAULT 'outro'
            ");

            return;
        }

        Schema::table('setores', function (Blueprint $table) {
            $table->string('tipo', 50)->default('outro')->change();
        });
    }
};
