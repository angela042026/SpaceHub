<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nullable com fallback para PT quando vazias — não obriga a
     * traduzir tudo de imediato nem altera o texto em português já
     * guardado.
     */
    public function up(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->string('pergunta_en')->nullable()->after('pergunta');
            $table->text('resposta_en')->nullable()->after('resposta');
        });
    }

    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropColumn(['pergunta_en', 'resposta_en']);
        });
    }
};
