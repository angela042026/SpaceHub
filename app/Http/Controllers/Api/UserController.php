<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;


class UserController extends Controller
{
    /**
     * Lista todos os utilizadores.
     */
    public function index()
    {
        $users = User::with('role')
            ->orderBy('name')
            ->get();

        return UserResource::collection($users);
    }
    public function show(User $user)
{
    $user->load('role');

    return new UserResource($user);
}
public function store(StoreUserRequest $request)
{
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
public function update(UpdateUserRequest $request, User $user)
{
    $dados = $request->validated();

    $user->fill([
        'name' => $dados['name'] ?? $user->name,
        'email' => $dados['email'] ?? $user->email,
        'role_id' => $dados['role_id'] ?? $user->role_id,
        'ativo' => $dados['ativo'] ?? $user->ativo,
    ]);

    if (!empty($dados['password'])) {
        $user->password = Hash::make($dados['password']);
    }

    $user->save();

    $user->load('role');

    return new UserResource($user);
}
public function toggleAtivo(User $user)
{
    $user->ativo = !$user->ativo;
    $user->save();

    $user->load('role');

    return new UserResource($user);
}
}