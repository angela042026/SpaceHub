<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('secretarias', function (Blueprint $table) {
            $table->uuid('qr_token')->nullable()->unique()->after('codigo');
        });

        // Backfill: garante que toda a secretária já existente fica com um QR válido.
        DB::table('secretarias')->whereNull('qr_token')->get(['id'])->each(function ($secretaria) {
            DB::table('secretarias')
                ->where('id', $secretaria->id)
                ->update(['qr_token' => (string) Str::uuid()]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('secretarias', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });
    }
};
