<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar a migration.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE pagamentos ALTER COLUMN metodo_pagamento DROP NOT NULL');

            return;
        }

        Schema::table('pagamentos', function (Blueprint $table) {
            $table->enum('metodo_pagamento', [
                'cartao',
                'mbway',
                'transferencia',
            ])->nullable()->change();
        });
    }

    /**
     * Reverter a migration.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE pagamentos ALTER COLUMN metodo_pagamento SET NOT NULL');

            return;
        }

        Schema::table('pagamentos', function (Blueprint $table) {
            $table->enum('metodo_pagamento', [
                'cartao',
                'mbway',
                'transferencia',
            ])->nullable(false)->change();
        });
    }
};
