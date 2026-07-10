<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocalidadeController;
use App\Http\Controllers\PisoController;
use App\Http\Controllers\SetorController;
use App\Http\Controllers\SecretariaController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');



});

Route::resource('localidades', LocalidadeController::class);
Route::resource('pisos', PisoController::class);
Route::resource('setores', SetorController::class);
Route::resource('secretarias', SecretariaController::class);

require __DIR__ . '/auth.php';




// TESTE DE CHAT
Route::get('/teste-chat', function () {return view('tests.chat'); });
