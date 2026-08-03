<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StatisticsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function userWithRole(string $nome): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', $nome)->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    public function test_administrator_and_gestor_can_access_statistics(): void
    {
        foreach (['Administrador', 'Gestor'] as $nome) {
            $user = $this->userWithRole($nome);

            $this->actingAs($user)
                ->get(route('admin.statistics.index'))
                ->assertOk();
        }
    }

    public function test_colaborador_and_utilizador_cannot_access_statistics(): void
    {
        foreach (['Colaborador', 'Utilizador'] as $nome) {
            $user = $this->userWithRole($nome);

            $this->actingAs($user)
                ->get(route('admin.statistics.index'))
                ->assertForbidden();
        }
    }

    public function test_periodo_valido_e_devolvido_como_recebido(): void
    {
        $admin = $this->userWithRole('Administrador');

        $response = $this->actingAs($admin)->get(
            route('admin.statistics.index', ['periodo' => 'semana'])
        );

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Statistics/Index')
            ->where('periodo', 'semana'));
    }

    public function test_periodo_invalido_cai_para_geral(): void
    {
        $admin = $this->userWithRole('Administrador');

        $response = $this->actingAs($admin)->get(
            route('admin.statistics.index', ['periodo' => 'valor-inventado'])
        );

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Statistics/Index')
            ->where('periodo', 'geral'));
    }
}
