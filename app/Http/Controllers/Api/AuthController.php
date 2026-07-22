<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Regista um novo utilizador comum.
     */
    public function register(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $role = Role::query()
            ->where('nome', 'Utilizador')
            ->firstOrFail();

        $user = User::create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'role_id' => $role->id,
            'ativo' => true,
        ]);

        $user->load('role');

        $token = $user
            ->createToken('api-token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Utilizador registado com sucesso.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Autentica um utilizador.
     */
    public function login(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('Login Android Email:', ['email' => $request->email]);
    \Illuminate\Support\Facades\Log::info('Login Android Pass:', ['pass' => $request->password]);
    
        $dados = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);

        $user = User::query()
            ->where('email', $dados['email'])
            ->first();

        if (
            $user === null
            || ! Hash::check($dados['password'], $user->password)
        ) {
            return response()->json([
                'message' => 'Credenciais inválidas.',
            ], 401);
        }

        if (! $user->ativo) {
            return response()->json([
                'message' => 'A conta encontra-se desativada.',
            ], 403);
        }

        $user->load('role');

        $token = $user
            ->createToken('api-token')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login efetuado com sucesso.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Termina a sessão associada ao token atual.
     */
    public function logout(Request $request): JsonResponse
    {
        $request
            ->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Logout efetuado com sucesso.',
        ]);
    }

    /**
     * Devolve o utilizador autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('role');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Envia o link de recuperação da password.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
            ],
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

    /**
     * Altera a password através de um token de recuperação.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'token' => [
                'required',
                'string',
            ],

            'email' => [
                'required',
                'string',
                'email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $status = Password::reset(
            $dados,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ]);

                $user->save();

                /*
                 * Os tokens antigos deixam de ser válidos depois
                 * da alteração da password.
                 */
                $user->tokens()->delete();
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
