<?php

use App\Events\EnviarMensagem;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\MapaController;
use App\Http\Controllers\PedidoSuporteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\SecretariaQrCodeController;
use App\Http\Controllers\SetorMapaController;
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

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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
    // Check-in
    // ==========================
    Route::get('/checkin/camera', [CheckInController::class, 'camera'])
        ->name('checkin.camera');

    Route::get('/checkin/scan/{qrToken}', [CheckInController::class, 'scan'])
        ->name('checkin.scan');

    Route::post('/checkin/confirm/{reserva}', [CheckInController::class, 'confirm'])
        ->name('checkin.confirm');

    // ==========================
    // QR Codes das Secretárias
    // ==========================
    Route::get('/secretarias/qrcodes', [SecretariaQrCodeController::class, 'index'])
        ->name('secretarias.qrcodes');

    Route::get('/secretarias/{secretaria}/qrcode', [SecretariaQrCodeController::class, 'show'])
        ->name('secretarias.qrcode');

    // ==========================
    // Mapa do Escritório
    // ==========================
    Route::get('/mapa', [MapaController::class, 'index'])
        ->name('mapa.index');

    // ==========================
    // Mapa dos Setores
    // ==========================
    Route::get('/setores/mapa', [SetorMapaController::class, 'edit'])
        ->name('setores.mapa.edit');

    Route::patch('/setores/{setor}/posicao', [SetorMapaController::class, 'atualizarPosicao'])
        ->name('setores.posicao.update');

    // ==========================
    // Sistema de Reservas
    // ==========================
    Route::get('/reservas', [ReservaController::class, 'index'])
        ->name('reservas.index');

    Route::get('/reservas/criar', [ReservaController::class, 'create'])
        ->name('reservas.create');

    Route::post('/reservas', [ReservaController::class, 'store'])
        ->name('reservas.store');

    Route::get('/reservas/historico', [ReservaController::class, 'history'])
        ->name('reservas.history');

    Route::get('/reservas/disponibilidade', [ReservaController::class, 'availability'])
        ->name('reservas.availability');

    Route::patch(
        '/reservas/{reserva}/cancelar',
        [ReservaController::class, 'cancelar']
    )->name('reservas.cancelar');

    Route::get('/reservas/{reserva}/editar', [ReservaController::class, 'edit'])
        ->name('reservas.edit');

    Route::put('/reservas/{reserva}', [ReservaController::class, 'update'])
        ->name('reservas.update');

    // ==========================
    // Help Center
    // ==========================
    Route::get('/ajuda', [FaqController::class, 'index'])
        ->name('faqs.index');

    // ==========================
    // Suporte
    // ==========================
    Route::get('/suporte', [PedidoSuporteController::class, 'create'])
        ->name('support.create');

    Route::post('/suporte', [PedidoSuporteController::class, 'store'])
        ->name('support.store');

    Route::get('/suporte/pedidos', [PedidoSuporteController::class, 'index'])
        ->name('support.index');

    Route::get('/suporte/pedidos/{id}', [PedidoSuporteController::class, 'show'])
        ->name('support.show');

    Route::patch('/suporte/pedidos/{id}', [PedidoSuporteController::class, 'update'])
        ->name('support.update');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Rotas do Sistema de Chat e WebSockets
|--------------------------------------------------------------------------
*/

// Rota de teste para disparo manual de eventos
Route::get('/disparar-evento', function () {
    broadcast(new EnviarMensagem(
        'Sistema SpaceHub',
        'WebSockets nativos a funcionar! 🚀'
    ));

    return 'Evento nativo enviado com sucesso!';
});

// Processamento do Chat Bot
Route::post('/simular-chat', [ChatController::class, 'simularResposta']);

// Página de testes do Chat
Route::get('/teste-chat', function () {
    return Inertia::render('TesteChat');
});