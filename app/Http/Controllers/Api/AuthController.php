<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $dados = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $role = Role::where('nome', 'Utilizador')->firstOrFail();

        $user = User::create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'role_id' => $role->id,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Utilizador registado com sucesso.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
    public function login(Request $request)
{
    $dados = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    $user = User::where('email', $dados['email'])->first();

    if (!$user || !Hash::check($dados['password'], $user->password)) {
        return response()->json([
            'message' => 'Credenciais inválidas.',
        ], 401);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'message' => 'Login efetuado com sucesso.',
        'user' => $user,
        'token' => $token,
    ]);
}
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logout efetuado com sucesso.',
    ]);
}
public function me(Request $request)
{
    return response()->json([
        'user' => $request->user()
    ]);
}
}