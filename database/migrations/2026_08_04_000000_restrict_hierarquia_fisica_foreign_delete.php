<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * O user_id de reservas já foi protegido com restrictOnDelete() (ver
 * 2026_08_02_000001). A mesma lacuna existia acima na cadeia física —
 * edifício → piso → setor → secretaria → reserva — toda em
 * cascadeOnDelete(): apagar um edifício arrastava pisos, setores,
 * secretárias, reservas e, por cascata a partir destas, pagamentos e
 * avaliações.
 *
 * Hoje não existe nenhuma rota/UI para apagar fisicamente estas
 * entidades (só toggleAtivo()), por isso isto é defesa em profundidade,
 * não a correção de um caminho já explorável: se alguém adicionar um
 * destroy() no futuro sem se lembrar disto, a BD recusa em vez de
 * apagar dados financeiros em silêncio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pisos', function (Blueprint $table) {
            $table->dropForeign(['edificio_id']);
        });

        Schema::table('pisos', function (Blueprint $table) {
            $table->foreign('edificio_id')
                ->references('id')->on('edificios')
                ->restrictOnDelete();
        });

        Schema::table('setores', function (Blueprint $table) {
            $table->dropForeign(['piso_id']);
        });

        Schema::table('setores', function (Blueprint $table) {
            $table->foreign('piso_id')
                ->references('id')->on('pisos')
                ->restrictOnDelete();
        });

        Schema::table('secretarias', function (Blueprint $table) {
            $table->dropForeign(['setor_id']);
        });

        Schema::table('secretarias', function (Blueprint $table) {
            $table->foreign('setor_id')
                ->references('id')->on('setores')
                ->restrictOnDelete();
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['secretaria_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->foreign('secretaria_id')
                ->references('id')->on('secretarias')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['secretaria_id']);
        });

        Schema::table('reservas', function (Blueprint $table) {
            $table->foreign('secretaria_id')
                ->references('id')->on('secretarias')
                ->cascadeOnDelete();
        });

        Schema::table('secretarias', function (Blueprint $table) {
            $table->dropForeign(['setor_id']);
        });

        Schema::table('secretarias', function (Blueprint $table) {
            $table->foreign('setor_id')
                ->references('id')->on('setores')
                ->cascadeOnDelete();
        });

        Schema::table('setores', function (Blueprint $table) {
            $table->dropForeign(['piso_id']);
        });

        Schema::table('setores', function (Blueprint $table) {
            $table->foreign('piso_id')
                ->references('id')->on('pisos')
                ->cascadeOnDelete();
        });

        Schema::table('pisos', function (Blueprint $table) {
            $table->dropForeign(['edificio_id']);
        });

        Schema::table('pisos', function (Blueprint $table) {
            $table->foreign('edificio_id')
                ->references('id')->on('edificios')
                ->cascadeOnDelete();
        });
    }
};
