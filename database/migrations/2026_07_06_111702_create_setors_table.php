<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('setores', function (Blueprint $table) {
            $table->id();

            $table->foreignId('piso_id')
                ->constrained('pisos')
                ->cascadeOnDelete();

            $table->string('nome', 100);
            $table->string('codigo', 20);

            $table->enum('tipo', [
                'open_space',
                'escritorio',
                'escritorio_executivo',
                'sala_reunioes',
                'sala_criativa',
                'sala_espera',
                'rececao',
                'copa',
                'lounge',
                'phone_booth',
                'wc',
                'estacionamento',
                'tecnico',
                'outro',
            ])->default('outro');

            $table->boolean('reservavel')->default(false);
            $table->integer('capacidade')->nullable();

            $table->text('descricao')->nullable();
            $table->boolean('ativo')->default(true);

            $table->unique(['piso_id', 'codigo']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('setores');
    }
};
