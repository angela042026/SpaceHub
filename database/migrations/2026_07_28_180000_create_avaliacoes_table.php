<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avaliacoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reserva_id')
                ->unique()
                ->constrained('reservas')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('nota');

            $table->text('comentario');

            $table->enum('estado', [
                'pendente',
                'aprovada',
                'rejeitada',
            ])->default('pendente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avaliacoes');
    }
};
