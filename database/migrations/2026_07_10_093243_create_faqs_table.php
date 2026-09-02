<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a criação da tabela de FAQs.
     */
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {

            // Identificador único da FAQ
            $table->id();

            // Categoria da FAQ
            // Ex.: Reservas, Conta, Espaços, Funcionamento
            $table->string('categoria');

            // Pergunta apresentada ao utilizador
            $table->string('pergunta');

            // Resposta da FAQ
            $table->text('resposta');

            // Ordem de apresentação
            $table->integer('ordem')->default(0);

            // Define se a FAQ está ativa
            $table->boolean('ativo')->default(true);

            // Datas de criação e atualização
            $table->timestamps();

        });
    }

    /**
     * Remove a tabela de FAQs.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
