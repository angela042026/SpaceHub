<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Preferência de idioma do utilizador — necessária porque as
     * Notifications correm numa fila (QUEUE_CONNECTION=database) ou são
     * despoletadas por comandos agendados, e nesses contextos não há
     * sessão HTTP de onde ler o idioma escolhido (ver SetLocale). Sem
     * isto, notificações e emails saíam sempre em `app.locale` (pt),
     * mesmo para um utilizador que tenha escolhido inglês.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('locale', 2)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('locale');
        });
    }
};
