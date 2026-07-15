<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

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

    if (! $user || ! Hash::check($dados['password'], $user->password)) {
        return response()->json([
            'message' => 'Credenciais inválidas.',
        ], 401);
    }

    if (! $user->ativo) {
        return response()->json([
            'message' => 'A conta encontra-se desativada.',
        ], 403);
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

public function forgotPassword(Request $request)
{
    $dados = $request->validate([
        'email' => ['required', 'email'],
    ]);

    $status = Password::sendResetLink([
        'email' => $dados['email'],
    ]);

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Link de recuperação enviado com sucesso.',
        ]);
    }

    return response()->json([
        'message' => 'Não foi possível enviar o link de recuperação.',
    ], 400);
}
public function resetPassword(Request $request)
{
    $dados = $request->validate([
        'token' => ['required'],
        'email' => ['required', 'email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $status = Password::reset(
        $dados,
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->setRememberToken(Str::random(60));

            $user->save();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json([
            'message' => 'Password alterada com sucesso.',
        ]);
    }

    return response()->json([
        'message' => 'Não foi possível alterar a password.',
    ], 400);
}

}