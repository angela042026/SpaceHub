<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $dados = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $user = User::create([
        'name' => $dados['name'],
        'email' => $dados['email'],
        'password' => Hash::make($dados['password']),
        'role_id' => 4,
    ]);

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'message' => 'Utilizador registado com sucesso.',
        'user' => $user,
        'token' => $token,
    ], 201);
}
}