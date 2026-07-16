<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Lista os utilizadores com pesquisa, filtros,
     * ordenação e paginação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        $query = User::query()->with('role');

        /*
        |--------------------------------------------------------------------------
        | Pesquisa
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        if ($request->filled('role_id')) {
            $query->where(
                'role_id',
                $request->integer('role_id')
            );
        }

        if ($request->has('ativo')) {
            $query->where(
                'ativo',
                $request->boolean('ativo')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ordenação segura
        |--------------------------------------------------------------------------
        */

        $allowedSortFields = [
            'id',
            'name',
            'email',
            'role_id',
            'ativo',
            'created_at',
            'updated_at',
        ];

        $sortBy = (string) $request->input('sort_by', 'name');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'name';
        }

        $sortDirection = strtolower(
            (string) $request->input('sort_direction', 'asc')
        );

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        /*
        |--------------------------------------------------------------------------
        | Paginação
        |--------------------------------------------------------------------------
        */

        $perPage = $request->integer('per_page', 15);
        $perPage = max(1, min($perPage, 100));

        $users = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

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
            'ativo' => true,
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