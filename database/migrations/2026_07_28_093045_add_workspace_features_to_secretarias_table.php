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
        Schema::table('secretarias', function (Blueprint $table) {

            $table->boolean('hdmi')->default(false)->after('dock_usb');
            $table->boolean('luz_natural')->default(false)->after('junto_janela');
            $table->boolean('zona_silenciosa')->default(false)->after('ergonomica');
            $table->boolean('proximo_copa')->default(false)->after('zona_silenciosa');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('secretarias', function (Blueprint $table) {

            $table->dropColumn([
                'hdmi',
                'luz_natural',
                'zona_silenciosa',
                'proximo_copa',
            ]);

        });
    }
};
