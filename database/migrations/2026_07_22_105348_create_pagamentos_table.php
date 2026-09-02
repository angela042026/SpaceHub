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
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reserva_id')
                ->unique()
                ->constrained('reservas')
                ->cascadeOnDelete();

            $table->decimal('valor', 10, 2);

            $table->enum('metodo_pagamento', [
                'cartao',
                'mbway',
                'transferencia',
            ])->nullable();
            $table->enum('estado', [
                'pendente',
                'pago',
                'recusado',
                'reembolsado',
                'cancelado',
            ])->default('pendente');

            $table->string('referencia')
                ->unique();

            $table->timestamp('data_pagamento')
                ->nullable();

            $table->text('observacoes')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverter a migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
