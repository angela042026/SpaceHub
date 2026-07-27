<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->decimal('preco_semanal', 10, 2)
                ->nullable()
                ->after('preco_dia_inteiro');

            $table->decimal('preco_mensal', 10, 2)
                ->nullable()
                ->after('preco_semanal');

            $table->decimal('preco_anual', 10, 2)
                ->nullable()
                ->after('preco_mensal');
        });
    }

    public function down(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->dropColumn([
                'preco_semanal',
                'preco_mensal',
                'preco_anual',
            ]);
        });
    }
};