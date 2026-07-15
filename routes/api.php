<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EdificioController;
use App\Http\Controllers\Api\PisoController;
use App\Http\Controllers\Api\SetorController;
use App\Http\Controllers\Api\SecretariaController;
use App\Http\Controllers\Api\ReservaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::middleware(['auth:sanctum', 'role:Administrador'])->group(function () {
    Route::get('/admin/teste', function () {
        return response()->json([
            'message' => 'Acesso permitido ao administrador.',
        ]);
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}/toggle-ativo', [UserController::class, 'toggleAtivo']);

    Route::get('/edificios', [EdificioController::class, 'index']);
    Route::get('/edificios/{edificio}', [EdificioController::class, 'show']);
    Route::post('/edificios', [EdificioController::class, 'store']);
    Route::put('/edificios/{edificio}', [EdificioController::class, 'update']);
    Route::patch('/edificios/{edificio}/toggle-ativo', [EdificioController::class, 'toggleAtivo']);

    Route::get('/pisos', [PisoController::class, 'index']);
    Route::get('/pisos/{piso}', [PisoController::class, 'show']);
    Route::post('/pisos', [PisoController::class, 'store']);
    Route::put('/pisos/{piso}', [PisoController::class, 'update']);
    Route::patch('/pisos/{piso}/toggle-ativo', [PisoController::class, 'toggleAtivo']);

    Route::get('/setores', [SetorController::class, 'index']);
    Route::get('/setores/{setor}', [SetorController::class, 'show']);
    Route::post('/setores', [SetorController::class, 'store']);
    Route::put('/setores/{setor}', [SetorController::class, 'update']);
    Route::patch('/setores/{setor}/toggle-ativo', [SetorController::class, 'toggleAtivo']);

    Route::get('/secretarias', [SecretariaController::class, 'index']);
    Route::get('/secretarias/{secretaria}', [SecretariaController::class, 'show']);
    Route::post('/secretarias', [SecretariaController::class, 'store']);
    Route::put('/secretarias/{secretaria}', [SecretariaController::class, 'update']);
    Route::patch('/secretarias/{secretaria}/toggle-ativo', [SecretariaController::class, 'toggleAtivo']);

    Route::get('/reservas/disponibilidade', [ReservaController::class, 'disponibilidade']);
    Route::patch('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
    Route::apiResource('reservas', ReservaController::class)->except(['destroy'])->names('api.reservas');
});