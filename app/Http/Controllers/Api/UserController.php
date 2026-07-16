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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

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

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

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
        $fotografiaGuardada = null;

        if ($request->hasFile('fotografia')) {
            $fotografiaGuardada = $request
                ->file('fotografia')
                ->store('utilizadores/fotografias', 'public');

            $dados['fotografia'] = $fotografiaGuardada;
        }

        try {
            $user = User::create([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'password' => Hash::make($dados['password']),
                'role_id' => $dados['role_id'],
                'ativo' => true,
                'fotografia' => $dados['fotografia'] ?? null,
            ]);
        } catch (Throwable $exception) {
            if ($fotografiaGuardada !== null) {
                Storage::disk('public')->delete($fotografiaGuardada);
            }

            throw $exception;
        }

        Log::info('Utilizador criado.', [
            'ator_id' => $request->user()->id,
            'utilizador_id' => $user->id,
            'role_id' => $user->role_id,
            'ativo' => $user->ativo,
            'tem_fotografia' => $user->fotografia !== null,
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

        $roleAnterior = $user->role_id;
        $fotografiaAntiga = $user->fotografia;
        $novaFotografia = null;

        if ($request->hasFile('fotografia')) {
            $novaFotografia = $request
                ->file('fotografia')
                ->store('utilizadores/fotografias', 'public');

            $dados['fotografia'] = $novaFotografia;
        }

        $user->fill([
            'name' => $dados['name'] ?? $user->name,
            'email' => $dados['email'] ?? $user->email,
            'role_id' => $dados['role_id'] ?? $user->role_id,
            'fotografia' => $dados['fotografia'] ?? $user->fotografia,
        ]);

        if (! empty($dados['password'])) {
            $user->password = Hash::make($dados['password']);
        }

        $camposAlterados = array_keys($user->getDirty());

        try {
            $user->save();
        } catch (Throwable $exception) {
            if ($novaFotografia !== null) {
                Storage::disk('public')->delete($novaFotografia);
            }

            throw $exception;
        }

        if (
            $novaFotografia !== null
            && $fotografiaAntiga !== null
            && $fotografiaAntiga !== $novaFotografia
        ) {
            Storage::disk('public')->delete($fotografiaAntiga);
        }

        if ($camposAlterados !== []) {
            Log::info('Utilizador atualizado.', [
                'ator_id' => $request->user()->id,
                'utilizador_id' => $user->id,
                'campos_alterados' => $camposAlterados,
            ]);
        }

        if ($roleAnterior !== $user->role_id) {
            Log::notice('Papel do utilizador alterado.', [
                'ator_id' => $request->user()->id,
                'utilizador_id' => $user->id,
                'role_anterior_id' => $roleAnterior,
                'role_nova_id' => $user->role_id,
            ]);
        }

        if ($novaFotografia !== null) {
            Log::info('Fotografia do utilizador alterada.', [
                'ator_id' => $request->user()->id,
                'utilizador_id' => $user->id,
                'tinha_fotografia_anterior' => $fotografiaAntiga !== null,
            ]);
        }

        $user->load('role');

        return new UserResource($user);
    }

    /**
     * Ativa ou desativa um utilizador.
     */
    public function toggleAtivo(User $user): UserResource
    {
        Gate::authorize('toggleAtivo', $user);

        $estadoAnterior = (bool) $user->ativo;

        $user->ativo = ! $user->ativo;
        $user->save();

        Log::notice('Estado do utilizador alterado.', [
            'ator_id' => request()->user()->id,
            'utilizador_id' => $user->id,
            'ativo_anterior' => $estadoAnterior,
            'ativo_atual' => (bool) $user->ativo,
        ]);

        $user->load('role');

        return new UserResource($user);
    }
}