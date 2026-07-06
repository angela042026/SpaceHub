<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secretarias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('setor_id')
                  ->constrained('setores')
                  ->cascadeOnDelete();

            $table->string('codigo', 20);

            $table->integer('planta_x')->nullable();
            $table->integer('planta_y')->nullable();
            $table->decimal('angulo', 5, 2)->default(0);

            $table->boolean('monitor')->default(false);
            $table->boolean('dock_usb')->default(false);
            $table->boolean('junto_janela')->default(false);
            $table->boolean('ergonomica')->default(false);

            $table->boolean('reservavel')->default(true);
            $table->boolean('ativo')->default(true);

            $table->text('descricao')->nullable();

            $table->unique(['setor_id', 'codigo']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secretarias');
    }
};