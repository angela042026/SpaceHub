<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar a migration.
     */
    public function up(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->decimal('preco_meio_dia', 10, 2)
                ->nullable()
                ->after('capacidade');

            $table->decimal('preco_dia_inteiro', 10, 2)
                ->nullable()
                ->after('preco_meio_dia');
        });
    }

    /**
     * Reverter a migration.
     */
    public function down(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->dropColumn([
                'preco_meio_dia',
                'preco_dia_inteiro',
            ]);
        });
    }
};
