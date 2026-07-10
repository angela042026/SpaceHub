<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\FaqController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    // ==========================
    // Perfil do Utilizador
    // ==========================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ==========================
    // Sistema de Reservas
    // ==========================
    // Listar as reservas do utilizador
    Route::get('/reservas', [ReservaController::class, 'index'])->name('reservas.index');
    // Mostrar formulário para criar uma reserva
    Route::get('/reservas/create', [ReservaController::class, 'create'])->name('reservas.create');
    // Guardar uma nova reserva
    Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store');
    // Consultar histórico de reservas
    Route::get('/reservas/history', [ReservaController::class, 'history'])->name('reservas.history');
        // // Consultar disponibilidade das secretárias
    Route::get('/reservas/availability', [ReservaController::class, 'availability'])->name('reservas.availability');
      // Cancelar uma reserva
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('reservas.destroy');
    });


    // ==========================
    // Gestão FAQs
    // ==========================
    Route::get('/ajuda', [FaqController::class, 'index']) ->name('faqs.index');



require __DIR__.'/auth.php';
