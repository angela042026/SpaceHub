<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->string('tipo_duracao', 20)
                ->default('diaria')
                ->after('data');

            $table->date('data_fim')
                ->nullable()
                ->after('tipo_duracao');

            $table->index(
                ['data', 'data_fim'],
                'reservas_intervalo_datas_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex('reservas_intervalo_datas_index');

            $table->dropColumn([
                'tipo_duracao',
                'data_fim',
            ]);
        });
    }
};