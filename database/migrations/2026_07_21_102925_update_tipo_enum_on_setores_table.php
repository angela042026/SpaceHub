<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
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
                'estacionamento'
            ) NOT NULL DEFAULT 'open_space'
        ");
    }

    public function down(): void
    {
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
    }
};