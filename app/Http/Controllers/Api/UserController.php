<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Lista todos os utilizadores.
     */
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        $users = User::with('role')
            ->orderBy('name')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * Apresenta um utilizador.
     */
    public function show(User $user): UserResource
    {
        Gate::authorize('view', $user);

        $user->load('role');

        return new UserResource($user);
    }

    /**
     * Cria um utilizador.
     */
    public function store(StoreUserRequest $request): UserResource
    {
        Gate::authorize('create', User::class);

        $dados = $request->validated();

        $user = User::create([
            'name' => $dados['name'],
            'email' => $dados['email'],
            'password' => Hash::make($dados['password']),
            'role_id' => $dados['role_id'],
            'ativo' => $dados['ativo'] ?? true,
        ]);

        $user->load('role');

        return new UserResource($user);
    }

    /**
     * Atualiza um utilizador.
     */
    public function update(
        UpdateUserRequest $request,
        User $user
    ): UserResource {
        Gate::authorize('update', $user);

        $dados = $request->validated();

        $user->fill([
            'name' => $dados['name'] ?? $user->name,
            'email' => $dados['email'] ?? $user->email,
            'role_id' => $dados['role_id'] ?? $user->role_id,
            'ativo' => $dados['ativo'] ?? $user->ativo,
        ]);

        if (! empty($dados['password'])) {
            $user->password = Hash::make($dados['password']);
        }

        $user->save();
        $user->load('role');

        return new UserResource($user);
    }

    /**
     * Ativa ou desativa um utilizador.
     */
    public function toggleAtivo(User $user): UserResource
    {
        Gate::authorize('toggleAtivo', $user);

        $user->ativo = ! $user->ativo;
        $user->save();

        $user->load('role');

        return new UserResource($user);
    }
}