<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adicionar PayPal aos métodos de pagamento permitidos.
     */
    public function up(): void
    {
        /*
         * Nos testes é utilizada uma base de dados SQLite em memória.
         * O SQLite não suporta ALTER TABLE ... MODIFY COLUMN.
         *
         * No SQLite, o enum é tratado como texto, pelo que não é
         * necessário alterar a coluna para aceitar PayPal.
         */
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE pagamentos
            MODIFY COLUMN metodo_pagamento
            ENUM(
                'cartao',
                'mbway',
                'transferencia',
                'paypal'
            )
            NULL
        ");
    }

    /**
     * Remover PayPal dos métodos de pagamento permitidos.
     */
    public function down(): void
    {
        /*
         * Evita erro ao reverter a migration caso já existam
         * pagamentos registados com o método PayPal.
         */
        DB::table('pagamentos')
            ->where('metodo_pagamento', 'paypal')
            ->update([
                'metodo_pagamento' => null,
            ]);

        /*
         * O SQLite não suporta MODIFY COLUMN.
         */
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE pagamentos
            MODIFY COLUMN metodo_pagamento
            ENUM(
                'cartao',
                'mbway',
                'transferencia'
            )
            NULL
        ");
    }
};
