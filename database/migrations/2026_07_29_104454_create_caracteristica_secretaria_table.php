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
        Schema::create('caracteristica_secretaria', function (Blueprint $table) {
            $table->id();

            $table->foreignId('secretaria_id')
                ->constrained('secretarias')
                ->cascadeOnDelete();

            $table->foreignId('caracteristica_id')
                ->constrained('caracteristicas')
                ->cascadeOnDelete();

            $table->unique(['secretaria_id', 'caracteristica_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caracteristica_secretaria');
    }
};
