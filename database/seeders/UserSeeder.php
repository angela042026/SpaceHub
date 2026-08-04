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
        // Contas de demonstração com password conhecida — nunca correr
        // fora de local/testing, para não criar um admin com password
        // pública num ambiente real.
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $admin = Role::where('nome', 'Administrador')->firstOrFail();
        $gestor = Role::where('nome', 'Gestor')->firstOrFail();
        $colaborador = Role::where('nome', 'Colaborador')->firstOrFail();
        $utilizador = Role::where('nome', 'Utilizador')->firstOrFail();

        User::firstOrCreate(
            ['email' => 'admin@spacehub.pt'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password123'),
                'role_id' => $admin->id,
                'ativo' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'gestor@spacehub.pt'],
            [
                'name' => 'Gestor',
                'password' => Hash::make('password123'),
                'role_id' => $gestor->id,
                'ativo' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'colaborador@spacehub.pt'],
            [
                'name' => 'Colaborador',
                'password' => Hash::make('password123'),
                'role_id' => $colaborador->id,
                'ativo' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'utilizador@spacehub.pt'],
            [
                'name' => 'Utilizador',
                'password' => Hash::make('password123'),
                'role_id' => $utilizador->id,
                'ativo' => true,
            ]
        );
    }
}
