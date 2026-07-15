<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Role $administradorRole;
    private Role $gestorRole;
    private Role $colaboradorRole;
    private Role $utilizadorRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $this->administradorRole = Role::where('nome', 'Administrador')
            ->firstOrFail();

        $this->gestorRole = Role::where('nome', 'Gestor')
            ->firstOrFail();

        $this->colaboradorRole = Role::where('nome', 'Colaborador')
            ->firstOrFail();

        $this->utilizadorRole = Role::where('nome', 'Utilizador')
            ->firstOrFail();
    }

    public function test_guest_receives_401_on_user_routes(): void
    {
        $target = $this->createUser($this->utilizadorRole);

        $this->getJson('/api/users')->assertUnauthorized();
        $this->postJson('/api/users', [])->assertUnauthorized();
        $this->getJson("/api/users/{$target->id}")->assertUnauthorized();
        $this->putJson("/api/users/{$target->id}", [])->assertUnauthorized();
        $this->patchJson("/api/users/{$target->id}/toggle-ativo")
            ->assertUnauthorized();
    }

    public function test_administrator_can_manage_users(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $target = $this->createUser($this->utilizadorRole);

        Sanctum::actingAs($admin);

        $this->getJson('/api/users')
            ->assertOk();

        $this->getJson("/api/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $target->id);

        $this->postJson('/api/users', [
            'name' => 'Novo Utilizador',
            'email' => 'novo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'ativo' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.email', 'novo@example.com');

        $this->putJson("/api/users/{$target->id}", [
            'name' => 'Nome Atualizado',
            'email' => $target->email,
            'role_id' => $target->role_id,
            'ativo' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nome Atualizado');

        $this->patchJson("/api/users/{$target->id}/toggle-ativo")
            ->assertOk()
            ->assertJsonPath('data.ativo', false);
    }

    public function test_gestor_cannot_manage_users(): void
    {
        $this->assertRoleCannotManageUsers($this->gestorRole);
    }

    public function test_colaborador_cannot_manage_users(): void
    {
        $this->assertRoleCannotManageUsers($this->colaboradorRole);
    }

    public function test_utilizador_cannot_manage_users(): void
    {
        $this->assertRoleCannotManageUsers($this->utilizadorRole);
    }

    public function test_administrator_cannot_toggle_own_account(): void
    {
        $admin = $this->createUser($this->administradorRole);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/users/{$admin->id}/toggle-ativo")
            ->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'ativo' => true,
        ]);
    }

    public function test_user_creation_validation_returns_422(): void
    {
        $admin = $this->createUser($this->administradorRole);

        Sanctum::actingAs($admin);

        $this->postJson('/api/users', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'email',
                'password',
                'role_id',
            ]);
    }

    public function test_user_destroy_route_does_not_exist(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $target = $this->createUser($this->utilizadorRole);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/users/{$target->id}")
            ->assertMethodNotAllowed();

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
        ]);
    }

    private function assertRoleCannotManageUsers(Role $role): void
    {
        $user = $this->createUser($role);
        $target = $this->createUser($this->utilizadorRole);

        Sanctum::actingAs($user);

        $this->getJson('/api/users')->assertForbidden();

        $this->postJson('/api/users', [
            'name' => 'Bloqueado',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'ativo' => true,
        ])->assertForbidden();

        $this->getJson("/api/users/{$target->id}")
            ->assertForbidden();

        $this->putJson("/api/users/{$target->id}", [
            'name' => 'Tentativa',
            'email' => $target->email,
            'role_id' => $target->role_id,
            'ativo' => true,
        ])->assertForbidden();

        $this->patchJson("/api/users/{$target->id}/toggle-ativo")
            ->assertForbidden();
    }

    private function createUser(Role $role): User
    {
        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => true,
            'password' => Hash::make('password123'),
        ]);
    }
}