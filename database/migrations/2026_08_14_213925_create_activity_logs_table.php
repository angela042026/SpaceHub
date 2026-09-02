<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Preserva o nome/email mesmo que o utilizador seja
            // eliminado (o "actor_id" fica null via nullOnDelete()) e
            // representam o sistema ("Sistema") nas ações automáticas.
            $table->string('actor_name')->nullable();
            $table->string('actor_email')->nullable();

            $table->string('category');
            $table->string('action');
            $table->text('description');

            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();

            $table->json('metadata')->nullable();

            $table->string('result')->default('success');
            $table->string('ip_address')->nullable();

            $table->timestamps();

            $table->index('created_at');
            $table->index('category');
            $table->index('action');
            $table->index(['category', 'created_at']);
            $table->index(['actor_id', 'created_at']);
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
