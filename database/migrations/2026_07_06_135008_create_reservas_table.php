<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('secretaria_id')
                  ->constrained('secretarias')
                  ->cascadeOnDelete();

            $table->foreignId('periodo_id')
                  ->constrained('periodos')
                  ->cascadeOnDelete();

            $table->foreignId('estado_reserva_id')
                  ->constrained('estado_reservas')
                  ->restrictOnDelete();

            $table->date('data');

            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('cancelada_at')->nullable();

            $table->text('observacoes')->nullable();

            $table->timestamps();

            $table->unique(['secretaria_id', 'data', 'periodo_id'], 'unique_reserva_secretaria_periodo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};