<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_suportes', function (Blueprint $table) {
            // Resposta escrita pelo admin/gestor ao resolver o pedido.
            $table->text('resposta')->nullable()->after('mensagem');
        });
    }

    public function down(): void
    {
        Schema::table('pedido_suportes', function (Blueprint $table) {
            $table->dropColumn('resposta');
        });
    }
};
