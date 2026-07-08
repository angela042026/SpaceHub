<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->integer('planta_x')->nullable()->after('codigo');
            $table->integer('planta_y')->nullable()->after('planta_x');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('setores', function (Blueprint $table) {
            $table->dropColumn(['planta_x', 'planta_y']);
        });
    }
};
