<?php

namespace Tests\Feature\Api;

use App\Models\Avaliacao;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

/**
 * AvaliacaoPolicy resolve o bypass do Administrador inteiramente no
 * hook before() — ao contrário de ReservaPolicy/UserPolicy, os métodos
 * de habilidade (viewAny/moderar) não repetem essa verificação. Por
 * isso os testes têm de passar pelo Gate (que dispara o before()) em
 * vez de instanciar a policy e chamar os métodos diretamente.
 */
class AvaliacaoPolicyTest extends TestCase
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

        $this->administradorRole = Role::where('nome', 'Administrador')->firstOrFail();
        $this->gestorRole = Role::where('nome', 'Gestor')->firstOrFail();
        $this->colaboradorRole = Role::where('nome', 'Colaborador')->firstOrFail();
        $this->utilizadorRole = Role::where('nome', 'Utilizador')->firstOrFail();
    }

    public function test_administrator_can_moderate_without_being_gestor(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $avaliacao = new Avaliacao;

        $this->assertTrue(Gate::forUser($admin)->allows('viewAny', Avaliacao::class));
        $this->assertTrue(Gate::forUser($admin)->allows('moderar', $avaliacao));
    }

    public function test_gestor_can_view_any_and_moderate(): void
    {
        $gestor = $this->createUser($this->gestorRole);
        $avaliacao = new Avaliacao;

        $this->assertTrue(Gate::forUser($gestor)->allows('viewAny', Avaliacao::class));
        $this->assertTrue(Gate::forUser($gestor)->allows('moderar', $avaliacao));
    }

    public function test_non_gestor_roles_cannot_view_any_or_moderate(): void
    {
        foreach ([$this->colaboradorRole, $this->utilizadorRole] as $role) {
            $user = $this->createUser($role);
            $avaliacao = new Avaliacao;

            $this->assertFalse(Gate::forUser($user)->allows('viewAny', Avaliacao::class));
            $this->assertFalse(Gate::forUser($user)->allows('moderar', $avaliacao));
        }
    }

    public function test_inactive_gestor_has_no_avaliacao_permissions(): void
    {
        $gestor = $this->createUser($this->gestorRole, ativo: false);
        $avaliacao = new Avaliacao;

        $this->assertFalse(Gate::forUser($gestor)->allows('viewAny', Avaliacao::class));
        $this->assertFalse(Gate::forUser($gestor)->allows('moderar', $avaliacao));
    }

    private function createUser(Role $role, bool $ativo = true): User
    {
        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => $ativo,
        ]);
    }
}
