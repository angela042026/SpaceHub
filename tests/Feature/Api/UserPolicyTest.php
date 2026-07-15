<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use App\Policies\UserPolicy;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPolicyTest extends TestCase
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

    public function test_administrator_has_user_management_permissions(): void
    {
        $policy = new UserPolicy();

        $admin = $this->createUser($this->administradorRole);
        $target = $this->createUser($this->utilizadorRole);

        $this->assertTrue($policy->viewAny($admin));
        $this->assertTrue($policy->view($admin, $target));
        $this->assertTrue($policy->create($admin));
        $this->assertTrue($policy->update($admin, $target));
        $this->assertTrue($policy->toggleAtivo($admin, $target));
    }

    public function test_non_administrator_roles_have_no_user_management_permissions(): void
    {
        $policy = new UserPolicy();
        $target = $this->createUser($this->utilizadorRole);

        foreach ($this->nonAdministratorRoles() as $role) {
            $user = $this->createUser($role);

            $this->assertFalse($policy->viewAny($user));
            $this->assertFalse($policy->view($user, $target));
            $this->assertFalse($policy->view($user, $user));
            $this->assertFalse($policy->create($user));
            $this->assertFalse($policy->update($user, $target));
            $this->assertFalse($policy->update($user, $user));
            $this->assertFalse($policy->toggleAtivo($user, $target));
        }
    }

    public function test_administrator_cannot_toggle_own_account(): void
    {
        $admin = $this->createUser($this->administradorRole);

        $this->assertFalse(
            (new UserPolicy())->toggleAtivo($admin, $admin)
        );
    }

    public function test_users_can_never_be_deleted(): void
    {
        $policy = new UserPolicy();
        $target = $this->createUser($this->utilizadorRole);

        foreach ([
            $this->administradorRole,
            ...$this->nonAdministratorRoles(),
        ] as $role) {
            $user = $this->createUser($role);

            $this->assertFalse(
                $policy->delete($user, $target)
            );
        }
    }

    /**
     * @return array<int, Role>
     */
    private function nonAdministratorRoles(): array
    {
        return [
            $this->gestorRole,
            $this->colaboradorRole,
            $this->utilizadorRole,
        ];
    }

    private function createUser(Role $role): User
    {
        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => true,
        ]);
    }
}