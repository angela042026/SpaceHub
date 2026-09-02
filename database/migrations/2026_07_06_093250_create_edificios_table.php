<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edificios', function (Blueprint $table) {
            $table->id();

            $table->string('nome', 100);
            $table->string('codigo', 20)->unique();

            $table->string('morada');
            $table->string('codigo_postal', 20)->nullable();
            $table->string('cidade', 100);
            $table->string('pais', 100)->default('Portugal');

            $table->string('telefone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('imagem')->nullable();

            $table->time('hora_abertura')->default('08:00:00');
            $table->time('hora_fecho')->default('20:00:00');

            $table->boolean('ativo')->default(true);
            $table->text('descricao')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edificios');
    }
};
