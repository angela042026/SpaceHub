<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Desfaz a migração 2026_08_08_000000 (já apagada) — "fotografia_url" não
 * devia nunca ter sido uma coluna: é um accessor calculado a partir da
 * coluna "fotografia" (ver User::fotografiaUrl()). A coluna crua ficava a
 * ser ignorada em silêncio porque o accessor tem sempre prioridade na
 * leitura, mascarando o problema.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('fotografia_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('fotografia_url')->nullable()->after('email');
        });
    }
};
