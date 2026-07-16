<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adiciona o caminho da fotografia do utilizador.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table
                ->string('fotografia')
                ->nullable()
                ->after('email');
        });
    }

    /**
     * Remove o campo de fotografia.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('fotografia');
        });
    }
};