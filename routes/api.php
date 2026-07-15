<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EdificioController;
use App\Http\Controllers\Api\PisoController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\SecretariaController;
use App\Http\Controllers\Api\SetorController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas públicas
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Rotas privadas comuns
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'active',
])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    /*
    |--------------------------------------------------------------------------
    | Reservas
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reservas/disponibilidade',
        [ReservaController::class, 'disponibilidade']
    );

    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::get('/reservas/{reserva}', [ReservaController::class, 'show']);
    Route::put('/reservas/{reserva}', [ReservaController::class, 'update']);

    Route::patch(
        '/reservas/{reserva}/cancelar',
        [ReservaController::class, 'cancelar']
    );

    /*
    |--------------------------------------------------------------------------
    | Edifícios
    |--------------------------------------------------------------------------
    */

    Route::get('/edificios', [EdificioController::class, 'index']);
    Route::post('/edificios', [EdificioController::class, 'store']);
    Route::get('/edificios/{edificio}', [EdificioController::class, 'show']);
    Route::put('/edificios/{edificio}', [EdificioController::class, 'update']);

    Route::patch(
        '/edificios/{edificio}/toggle-ativo',
        [EdificioController::class, 'toggleAtivo']
    );

    /*
    |--------------------------------------------------------------------------
    | Pisos
    |--------------------------------------------------------------------------
    */

    Route::get('/pisos', [PisoController::class, 'index']);
    Route::post('/pisos', [PisoController::class, 'store']);
    Route::get('/pisos/{piso}', [PisoController::class, 'show']);
    Route::put('/pisos/{piso}', [PisoController::class, 'update']);

    Route::patch(
        '/pisos/{piso}/toggle-ativo',
        [PisoController::class, 'toggleAtivo']
    );

    /*
    |--------------------------------------------------------------------------
    | Setores
    |--------------------------------------------------------------------------
    */

    Route::get('/setores', [SetorController::class, 'index']);
    Route::post('/setores', [SetorController::class, 'store']);
    Route::get('/setores/{setor}', [SetorController::class, 'show']);
    Route::put('/setores/{setor}', [SetorController::class, 'update']);

    Route::patch(
        '/setores/{setor}/toggle-ativo',
        [SetorController::class, 'toggleAtivo']
    );

    /*
    |--------------------------------------------------------------------------
    | Secretárias
    |--------------------------------------------------------------------------
    */

    Route::get('/secretarias', [SecretariaController::class, 'index']);
    Route::post('/secretarias', [SecretariaController::class, 'store']);

    Route::get(
        '/secretarias/{secretaria}',
        [SecretariaController::class, 'show']
    );

    Route::put(
        '/secretarias/{secretaria}',
        [SecretariaController::class, 'update']
    );

    Route::patch(
        '/secretarias/{secretaria}/toggle-ativo',
        [SecretariaController::class, 'toggleAtivo']
    );
});

/*
|--------------------------------------------------------------------------
| Rotas exclusivas do Administrador
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'active',
    'role:Administrador',
])->group(function (): void {
    Route::get('/admin/teste', function () {
        return response()->json([
            'message' => 'Acesso permitido ao administrador.',
        ]);
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);

    Route::patch(
        '/users/{user}/toggle-ativo',
        [UserController::class, 'toggleAtivo']
    );
});