<?php

use App\Http\Controllers\CheckInController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SecretariaQrCodeController;
use App\Http\Controllers\SetorMapaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReservaController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
    Route::get('/checkin/camera', [CheckInController::class, 'camera'])
        ->name('checkin.camera');
    Route::get('/checkin/scan/{qrToken}', [CheckInController::class, 'scan'])
        ->name('checkin.scan');
    Route::post('/checkin/confirm/{reserva}', [CheckInController::class, 'confirm'])
        ->name('checkin.confirm');
    Route::get('/secretarias/qrcodes', [SecretariaQrCodeController::class, 'index'])
        ->name('secretarias.qrcodes');
    Route::get('/secretarias/{secretaria}/qrcode', [SecretariaQrCodeController::class, 'show'])
        ->name('secretarias.qrcode');
    Route::get('/setores/mapa', [SetorMapaController::class, 'edit'])
        ->name('setores.mapa.edit');
    Route::patch('/setores/{setor}/posicao', [SetorMapaController::class, 'atualizarPosicao'])
        ->name('setores.posicao.update');

    // ==========================
    // Sistema de Reservas
    // ==========================
    Route::get('/reservas', [ReservaController::class, 'index'])->name('reservas.index');
    Route::get('/reservas/criar', [ReservaController::class, 'create'])->name('reservas.create');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store');
    Route::get('/reservas/historico', [ReservaController::class, 'history'])->name('reservas.history');
    Route::get('/reservas/disponibilidade', [ReservaController::class, 'availability'])->name('reservas.availability');
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy'])->name('reservas.destroy');
});

require __DIR__.'/auth.php';