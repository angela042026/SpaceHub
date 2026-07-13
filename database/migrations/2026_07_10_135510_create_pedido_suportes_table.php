<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a criação da tabela de pedidos de suporte.
     */
    public function up(): void
    {
        Schema::create('pedido_suportes', function (Blueprint $table) {

            // Identificador único
            $table->id();

            // Utilizador que criou o pedido
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Assunto do pedido
            $table->string('assunto');

            // Descrição do problema
            $table->text('mensagem');

            // Estado do pedido
            // Pendente | Em análise | Resolvido
            $table->string('estado')->default('Pendente');

            // Datas de criação e atualização
            $table->timestamps();
        });
    }

    /**
     * Remove a tabela de pedidos de suporte.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedido_suportes');
    }
};
