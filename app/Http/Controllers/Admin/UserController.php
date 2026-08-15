<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    /**
     * Lista os utilizadores com pesquisa, filtros, ordenação e paginação.
     */
    public function index(Request $request): Response
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
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
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

        $sortDirection = strtolower((string) $request->input('sort_direction', 'asc'));

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        $users = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users)->response()->getData(true),
            'roles' => Role::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only([
                'search',
                'role_id',
                'ativo',
                'sort_by',
                'sort_direction',
            ]),
        ]);
    }

    /**
     * Mostra o formulário de criação de um utilizador.
     */
    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    /**
     * Cria um utilizador.
     */
    public function store(StoreUserRequest $request): RedirectResponse
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
            $novoUtilizador = User::create([
                'name' => $dados['name'],
                'email' => $dados['email'],
                'password' => Hash::make($dados['password']),
                'role_id' => $dados['role_id'],
                'ativo' => $dados['ativo'] ?? true,
                'fotografia' => $dados['fotografia'] ?? null,
            ]);
        } catch (Throwable $exception) {
            if ($fotografiaGuardada !== null) {
                Storage::disk('public')->delete($fotografiaGuardada);
            }

            throw $exception;
        }

        ActivityLogger::log(
            Auth::user(),
            'utilizador_criado',
            "{$novoUtilizador->name} · {$novoUtilizador->email}",
            $novoUtilizador
        );

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Utilizador criado com sucesso.');
    }

    /**
     * Mostra o formulário de edição de um utilizador.
     */
    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        $user->load('role');

        return Inertia::render('Admin/Users/Edit', [
            // ->resolve() em vez de passar o Resource diretamente: o Inertia
            // trata qualquer Responsable chamando ->toResponse()->getData(true),
            // e o JsonResource embrulha sempre em {"data": {...}} (via
            // JsonResource::$wrap = 'data'). Sem isto, o React recebia
            // user.data.name em vez de user.name e o formulário ficava vazio.
            'user' => (new UserResource($user))->resolve(),
            'roles' => Role::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    /**
     * Atualiza um utilizador.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $dados = $request->validated();
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

        ActivityLogger::log(
            Auth::user(),
            'utilizador_atualizado',
            "{$user->name} · {$user->email}",
            $user
        );

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Utilizador atualizado com sucesso.');
    }

    /**
     * Ativa ou desativa um utilizador.
     */
    public function toggleAtivo(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $user);

        if ($user->ativo && $user->id === $request->user()->id) {
            return redirect()
                ->back()
                ->with('error', 'Não pode desativar a sua própria conta.');
        }

        $user->ativo = ! $user->ativo;
        $user->save();

        ActivityLogger::log(
            Auth::user(),
            $user->ativo ? 'utilizador_ativado' : 'utilizador_desativado',
            "{$user->name} · {$user->email}",
            $user
        );

        return redirect()
            ->back()
            ->with('success', $user->ativo
                ? 'Utilizador ativado.'
                : 'Utilizador desativado.');
    }
}
