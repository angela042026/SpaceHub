<?php

use App\Events\EnviarMensagem;
use App\Http\Controllers\Admin\EdificioController as AdminEdificioController;
use App\Http\Controllers\Admin\PisoController as AdminPisoController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ReservaController as AdminReservaController;
use App\Http\Controllers\Admin\SecretariaController as AdminSecretariaController;
use App\Http\Controllers\Admin\SetorController as AdminSetorController;
use App\Http\Controllers\Admin\StatisticsController as AdminStatisticsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\GoogleAuthController;
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
use App\Http\Controllers\PagamentoController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// ==========================
// Páginas legais (públicas)
// ==========================
Route::get('/termos-utilizacao', function () {
    return Inertia::render('Legal/Terms');
})->name('legal.terms');

Route::get('/politica-privacidade', function () {
    return Inertia::render('Legal/Privacy');
})->name('legal.privacy');

Route::get('/politica-cookies', function () {
    return Inertia::render('Legal/Cookies');
})->name('legal.cookies');

/*
|--------------------------------------------------------------------------
| Autenticação com Google
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])
        ->name('google.redirect');

    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
        ->name('google.callback');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'active'])
    ->name('dashboard');

Route::middleware(['auth', 'active'])->group(function () {
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
    // Pagamentos
    // ==========================
    Route::get('/pagamentos', [PagamentoController::class, 'index'])
        ->name('pagamentos.index');

    Route::get('/pagamentos/{pagamento}', [PagamentoController::class, 'show'])
        ->name('pagamentos.show');

    Route::get('/pagamentos/{pagamento}/pagar', [PagamentoController::class, 'pagar'])
        ->name('pagamentos.pagar');

  Route::patch(
    '/pagamentos/{pagamento}/confirmar',
    [PagamentoController::class, 'confirmar']
)->name('pagamentos.confirmar');

    Route::get(
        '/pagamentos/{pagamento}/comprovativo',
        [PagamentoController::class, 'comprovativo']
    )->name('pagamentos.comprovativo');


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

    Route::post('/reservas/dia-inteiro', [ReservaController::class, 'storeDiaInteiro'])
        ->name('reservas.storeDiaInteiro');

    Route::get('/reservas/historico', [ReservaController::class, 'history'])
        ->name('reservas.history');

    Route::get('/reservas/disponibilidade', [ReservaController::class, 'availability'])
        ->name('reservas.availability');

    Route::get('/reservas/lugares-por-setor', [ReservaController::class, 'lugaresPorSetor'])
        ->name('reservas.lugaresPorSetor');

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

    Route::post('/chat/enviar', [ChatController::class, 'enviarMensagem'])
        ->name('chat.enviar');
});

// ==========================
// Administração
// ==========================
Route::middleware(['auth', 'active', 'role:Administrador'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/utilizadores', [AdminUserController::class, 'index'])
            ->name('users.index');

        Route::get('/utilizadores/criar', [AdminUserController::class, 'create'])
            ->name('users.create');

        Route::post('/utilizadores', [AdminUserController::class, 'store'])
            ->name('users.store');

        Route::get('/utilizadores/{user}/editar', [AdminUserController::class, 'edit'])
            ->name('users.edit');

        Route::put('/utilizadores/{user}', [AdminUserController::class, 'update'])
            ->name('users.update');

        Route::patch('/utilizadores/{user}/toggle-ativo', [AdminUserController::class, 'toggleAtivo'])
            ->name('users.toggleAtivo');

        Route::get('/reservas', [AdminReservaController::class, 'index'])
            ->name('reservas.index');

        Route::get('/reservas/{reserva}/editar', [AdminReservaController::class, 'edit'])
            ->name('reservas.edit');

        Route::put('/reservas/{reserva}', [AdminReservaController::class, 'update'])
            ->name('reservas.update');

        Route::patch('/reservas/{reserva}/cancelar', [AdminReservaController::class, 'cancelar'])
            ->name('reservas.cancelar');
    });

// Gestão de espaços: acessível a Administrador e Gestor (ver *Policy::before()).
Route::middleware(['auth', 'active', 'role:Administrador,Gestor'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/edificios', [AdminEdificioController::class, 'index'])
            ->name('edificios.index');

        Route::get('/edificios/criar', [AdminEdificioController::class, 'create'])
            ->name('edificios.create');

        Route::post('/edificios', [AdminEdificioController::class, 'store'])
            ->name('edificios.store');

        Route::get('/edificios/{edificio}/editar', [AdminEdificioController::class, 'edit'])
            ->name('edificios.edit');

        Route::put('/edificios/{edificio}', [AdminEdificioController::class, 'update'])
            ->name('edificios.update');

        Route::patch('/edificios/{edificio}/toggle-ativo', [AdminEdificioController::class, 'toggleAtivo'])
            ->name('edificios.toggleAtivo');

        Route::get('/pisos', [AdminPisoController::class, 'index'])
            ->name('pisos.index');

        Route::get('/pisos/criar', [AdminPisoController::class, 'create'])
            ->name('pisos.create');

        Route::post('/pisos', [AdminPisoController::class, 'store'])
            ->name('pisos.store');

        Route::get('/pisos/{piso}/editar', [AdminPisoController::class, 'edit'])
            ->name('pisos.edit');

        Route::put('/pisos/{piso}', [AdminPisoController::class, 'update'])
            ->name('pisos.update');

        Route::patch('/pisos/{piso}/toggle-ativo', [AdminPisoController::class, 'toggleAtivo'])
            ->name('pisos.toggleAtivo');

        Route::get('/setores', [AdminSetorController::class, 'index'])
            ->name('setores.index');

        Route::get('/setores/criar', [AdminSetorController::class, 'create'])
            ->name('setores.create');

        Route::post('/setores', [AdminSetorController::class, 'store'])
            ->name('setores.store');

        Route::get('/setores/{setor}/editar', [AdminSetorController::class, 'edit'])
            ->name('setores.edit');

        Route::put('/setores/{setor}', [AdminSetorController::class, 'update'])
            ->name('setores.update');

        Route::patch('/setores/{setor}/toggle-ativo', [AdminSetorController::class, 'toggleAtivo'])
            ->name('setores.toggleAtivo');

        Route::get('/secretarias', [AdminSecretariaController::class, 'index'])
            ->name('secretarias.index');

        Route::get('/secretarias/criar', [AdminSecretariaController::class, 'create'])
            ->name('secretarias.create');

        Route::post('/secretarias', [AdminSecretariaController::class, 'store'])
            ->name('secretarias.store');

        Route::get('/secretarias/{secretaria}/editar', [AdminSecretariaController::class, 'edit'])
            ->name('secretarias.edit');

        Route::put('/secretarias/{secretaria}', [AdminSecretariaController::class, 'update'])
            ->name('secretarias.update');

        Route::patch('/secretarias/{secretaria}/toggle-ativo', [AdminSecretariaController::class, 'toggleAtivo'])
            ->name('secretarias.toggleAtivo');

        Route::get('/estatisticas', [AdminStatisticsController::class, 'index'])
            ->name('statistics.index');

        Route::get('/relatorios', [AdminReportController::class, 'index'])
            ->name('reports.index');

        Route::get('/relatorios/reservas', [AdminReportController::class, 'reservas'])
            ->name('reports.reservas');

        Route::get('/relatorios/utilizadores', [AdminReportController::class, 'utilizadores'])
            ->name('reports.utilizadores');

        Route::get('/relatorios/suporte', [AdminReportController::class, 'suporte'])
            ->name('reports.suporte');
    });

require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| Rotas do Sistema de Chat e WebSockets
|--------------------------------------------------------------------------
*/

// Envio de mensagens seguro (lê o utilizador da sessão e aciona o Bot)
Route::post('/chat/enviar', [ChatController::class, 'enviarMensagem'])
    ->name('chat.enviar')
    ->middleware('auth'); // Garante que só utilizadores autenticados usam o chat real