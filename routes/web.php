<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatController; // O nosso controlador do chat
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Events\EnviarMensagem;

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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| RECURSOS DO PROJETO COWORK (COMENTADOS TEMPORARIAMENTE)
|--------------------------------------------------------------------------
| Desativámos estas rotas porque os controladores correspondentes foram
| alterados na branch main e estavam a bloquear a inicialização da página.
*/
// Route::resource('localidades', LocalidadeController::class);
// Route::resource('pisos', PisoController::class);
// Route::resource('setores', SetorController::class);
// Route::resource('secretarias', SecretariaController::class);

require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| ROTAS DO SISTEMA DE CHAT & WEBSOCKETS (SPACEHUB)
|--------------------------------------------------------------------------
*/

// Rota de teste para disparo manual de eventos
Route::get('/disparar-evento', function () {
    broadcast(new EnviarMensagem('Sistema SpaceHub', 'WebSockets nativos a funcionar! 🚀'));
    return 'Evento nativo enviado com sucesso!';
});

// Processamento do Chat Bot (Delegado ao teu Controlador Inteligente)
Route::post('/simular-chat', [ChatController::class, 'simularResposta']);

// Renderização da página de testes do Chat (React)
Route::get('/teste-chat', function () {
    return Inertia::render('TesteChat');
});
