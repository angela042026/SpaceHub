<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pisos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('edificio_id')
      ->constrained('edificios')
      ->cascadeOnDelete();
      
            $table->string('nome', 100);
            $table->integer('numero')->nullable();
            $table->boolean('ativo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pisos');
    }
};