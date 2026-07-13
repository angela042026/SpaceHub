<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\PedidoSuporteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () { return Inertia::render('Dashboard');})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    // ==========================
    // Perfil do Utilizador
    // ==========================
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    // ==========================
    // Sistema de Reservas
    // ==========================
    // Listar reservas
    Route::get('/reservas', [ReservaController::class, 'index'])
        ->name('reservas.index');

    // Nova reserva
    Route::get('/reservas/create', [ReservaController::class, 'create'])
        ->name('reservas.create');

    // Guardar reserva
    Route::post('/reservas', [ReservaController::class, 'store'])
        ->name('reservas.store');

    // Histórico
    Route::get('/reservas/history', [ReservaController::class, 'history'])
        ->name('reservas.history');

    // Disponibilidade
    Route::get('/reservas/availability', [ReservaController::class, 'availability'])
        ->name('reservas.availability');

    // Cancelar reserva
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])
        ->name('reservas.destroy');

    // ==========================
    // Help Center (FAQs)
    // ==========================
    Route::get('/ajuda', [FaqController::class, 'index'])
        ->name('faqs.index');

    // ==========================
    // Suporte
    // ==========================

    // Formulário de contacto
    Route::get('/suporte', [PedidoSuporteController::class, 'create'])
        ->name('support.create');

    // Guardar pedido
    Route::post('/suporte', [PedidoSuporteController::class, 'store'])
        ->name('support.store');

    // Lista de pedidos
    Route::get('/suporte/pedidos', [PedidoSuporteController::class, 'index'])
        ->name('support.index');

    // Ver pedido
    Route::get('/suporte/pedidos/{id}', [PedidoSuporteController::class, 'show'])
        ->name('support.show');

    // Marcar como resolvido
    Route::patch('/suporte/pedidos/{id}', [PedidoSuporteController::class, 'update'])
        ->name('support.update');

});

require __DIR__.'/auth.php';