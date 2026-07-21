<?php

namespace Tests\Feature\Api;

use App\Models\Reserva;
use App\Models\Role;
use App\Models\User;
use App\Policies\ReservaPolicy;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservaPolicyTest extends TestCase
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

    public function test_all_roles_can_list_and_create_reservas(): void
    {
        $policy = new ReservaPolicy();

        foreach ($this->roles() as $role) {
            $user = $this->createUser($role);

            $this->assertTrue($policy->viewAny($user));
            $this->assertTrue($policy->create($user));
        }
    }

    public function test_administrator_can_manage_any_reserva(): void
    {
        $policy = new ReservaPolicy();

        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = new Reserva([
            'user_id' => $owner->id,
        ]);

        $this->assertTrue($policy->view($admin, $reserva));
        $this->assertTrue($policy->update($admin, $reserva));
        $this->assertTrue($policy->cancelar($admin, $reserva));
    }

    public function test_user_can_manage_own_reserva(): void
    {
        $policy = new ReservaPolicy();

        foreach ([
            $this->gestorRole,
            $this->colaboradorRole,
            $this->utilizadorRole,
        ] as $role) {
            $user = $this->createUser($role);

            $reserva = new Reserva([
                'user_id' => $user->id,
            ]);

            $this->assertTrue($policy->view($user, $reserva));
            $this->assertTrue($policy->update($user, $reserva));
            $this->assertTrue($policy->cancelar($user, $reserva));
        }
    }

    public function test_user_cannot_manage_another_users_reserva(): void
    {
        $policy = new ReservaPolicy();

        $owner = $this->createUser($this->utilizadorRole);

        foreach ([
            $this->gestorRole,
            $this->colaboradorRole,
            $this->utilizadorRole,
        ] as $role) {
            $user = $this->createUser($role);

            $reserva = new Reserva([
                'user_id' => $owner->id,
            ]);

            $this->assertFalse($policy->view($user, $reserva));
            $this->assertFalse($policy->update($user, $reserva));
            $this->assertFalse($policy->cancelar($user, $reserva));
        }
    }

    public function test_reservas_cannot_be_deleted_directly(): void
    {
        $policy = new ReservaPolicy();

        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = new Reserva([
            'user_id' => $owner->id,
        ]);

        $this->assertFalse($policy->delete($admin, $reserva));
    }

    /**
     * @return array<int, Role>
     */
    private function roles(): array
    {
        return [
            $this->administradorRole,
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