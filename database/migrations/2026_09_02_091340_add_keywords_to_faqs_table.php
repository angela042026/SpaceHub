<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            // Adiciona as colunas de keywords para ambos os idiomas
            $table->text('keywords_pt')->nullable()->after('resposta');
            $table->text('keywords_en')->nullable()->after('keywords_pt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropColumn(['keywords_pt', 'keywords_en']);
        });
    }
};
