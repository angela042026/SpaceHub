<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nullable com fallback para PT quando vazio — não obriga a traduzir
     * todos os setores de imediato nem altera o nome em português já
     * guardado. Mesmo padrão de database/migrations/..._add_translations_to_faqs_table.php.
     */
    public function up(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->string('nome_en')->nullable()->after('nome');
        });
    }

    public function down(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->dropColumn('nome_en');
        });
    }
};
