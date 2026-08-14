<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar a migration.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('google_calendar_access_token')->nullable();
            $table->text('google_calendar_refresh_token')->nullable();
            $table->timestamp('google_calendar_token_expira_em')->nullable();
        });
    }

    /**
     * Reverter a migration.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_calendar_access_token',
                'google_calendar_refresh_token',
                'google_calendar_token_expira_em',
            ]);
        });
    }
};
