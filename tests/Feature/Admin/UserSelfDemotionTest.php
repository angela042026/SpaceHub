<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * UserPolicy::update() só verificava isAdministrador(), nunca se o
 * alvo era o próprio ator — um Administrador conseguia mudar a
 * própria role pelo CRUD administrativo e perder acesso à área
 * administrativa sem aviso, sem outro Administrador para reverter.
 */
class UserSelfDemotionTest extends TestCase
{
    use RefreshDatabase;

    private function criarUtilizadorComRole(string $nome): User
    {
        $role = Role::firstOrCreate(
            ['nome' => $nome],
            ['descricao' => $nome]
        );

        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => true,
        ]);
    }

    public function test_administrador_nao_consegue_retirar_a_propria_role(): void
    {
        $admin = $this->criarUtilizadorComRole('Administrador');
        $roleUtilizador = Role::where('nome', 'Utilizador')->firstOrFail();

        $response = $this->actingAs($admin)->put(
            route('admin.users.update', $admin),
            [
                'name' => $admin->name,
                'email' => $admin->email,
                'role_id' => $roleUtilizador->id,
            ]
        );

        $response->assertSessionHasErrors('role_id');
        $this->assertSame('Administrador', $admin->fresh()->role->nome);
    }

    public function test_administrador_consegue_alterar_a_role_de_outro_administrador(): void
    {
        $admin = $this->criarUtilizadorComRole('Administrador');
        $outroAdmin = $this->criarUtilizadorComRole('Administrador');
        $roleUtilizador = Role::where('nome', 'Utilizador')->firstOrFail();

        $response = $this->actingAs($admin)->put(
            route('admin.users.update', $outroAdmin),
            [
                'name' => $outroAdmin->name,
                'email' => $outroAdmin->email,
                'role_id' => $roleUtilizador->id,
            ]
        );

        $response->assertRedirect(route('admin.users.index'));
        $this->assertSame('Utilizador', $outroAdmin->fresh()->role->nome);
    }

    public function test_administrador_consegue_atualizar_outros_campos_de_si_proprio(): void
    {
        $admin = $this->criarUtilizadorComRole('Administrador');

        $response = $this->actingAs($admin)->put(
            route('admin.users.update', $admin),
            [
                'name' => 'Nome Atualizado',
                'email' => $admin->email,
            ]
        );

        $response->assertRedirect(route('admin.users.index'));
        $this->assertSame('Nome Atualizado', $admin->fresh()->name);
    }
}
