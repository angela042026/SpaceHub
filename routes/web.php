<?php

use App\Http\Controllers\CheckInController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\SecretariaQrCodeController;
use App\Http\Controllers\SetorMapaController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;

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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/checkin/camera', [CheckInController::class, 'camera'])->name('checkin.camera');
    Route::get('/checkin/scan/{qrToken}', [CheckInController::class, 'scan'])->name('checkin.scan');
    Route::post('/checkin/confirm/{reserva}', [CheckInController::class, 'confirm'])->name('checkin.confirm');

    Route::post('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar'])->name('reservas.cancelar');

    Route::get('/secretarias/qrcodes', [SecretariaQrCodeController::class, 'index'])->name('secretarias.qrcodes');
    Route::get('/secretarias/{secretaria}/qrcode', [SecretariaQrCodeController::class, 'show'])->name('secretarias.qrcode');

    Route::get('/setores/mapa', [SetorMapaController::class, 'edit'])->name('setores.mapa.edit');
    Route::patch('/setores/{setor}/posicao', [SetorMapaController::class, 'atualizarPosicao'])->name('setores.posicao.update');
});

require __DIR__.'/auth.php';
