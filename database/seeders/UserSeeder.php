<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::where('nome', 'Administrador')->firstOrFail();
        $gestor = Role::where('nome', 'Gestor')->firstOrFail();
        $colaborador = Role::where('nome', 'Colaborador')->firstOrFail();
        $utilizador = Role::where('nome', 'Utilizador')->firstOrFail();

        User::create([
            'name' => 'Administrador',
            'email' => 'admin@spacehub.pt',
            'password' => Hash::make('password123'),
            'role_id' => $admin->id,
            'ativo' => true,
        ]);

        User::create([
            'name' => 'Gestor',
            'email' => 'gestor@spacehub.pt',
            'password' => Hash::make('password123'),
            'role_id' => $gestor->id,
            'ativo' => true,
        ]);

        User::create([
            'name' => 'Colaborador',
            'email' => 'colaborador@spacehub.pt',
            'password' => Hash::make('password123'),
            'role_id' => $colaborador->id,
            'ativo' => true,
        ]);

        User::create([
            'name' => 'Utilizador',
            'email' => 'utilizador@spacehub.pt',
            'password' => Hash::make('password123'),
            'role_id' => $utilizador->id,
            'ativo' => true,
        ]);
    }
}