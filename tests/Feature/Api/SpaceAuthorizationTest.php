<?php

namespace Tests\Feature\Api;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpaceAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_guest_receives_401_on_space_routes(): void
    {
        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->getJson($definition['index'])
                ->assertUnauthorized();

            $this->getJson(
                "{$definition['index']}/{$model->getKey()}"
            )->assertUnauthorized();

            $this->patchJson(
                "{$definition['index']}/{$model->getKey()}/toggle-ativo"
            )->assertUnauthorized();
        }
    }

    public function test_all_active_roles_can_list_and_view_spaces(): void
    {
        foreach ($this->roleNames() as $roleName) {
            $user = $this->userWithRole($roleName);

            Sanctum::actingAs($user);

            foreach ($this->spaceDefinitions() as $definition) {
                $modelClass = $definition['model'];
                $model = $modelClass::query()->firstOrFail();

                $this->getJson($definition['index'])
                    ->assertOk();

                $this->getJson(
                    "{$definition['index']}/{$model->getKey()}"
                )->assertOk();
            }
        }
    }

    public function test_administrator_can_toggle_spaces(): void
    {
        $admin = $this->userWithRole('Administrador');

        Sanctum::actingAs($admin);

        $this->assertCanToggleAllSpaces();
    }

    public function test_gestor_can_toggle_spaces(): void
    {
        $gestor = $this->userWithRole('Gestor');

        Sanctum::actingAs($gestor);

        $this->assertCanToggleAllSpaces();
    }

    public function test_colaborador_cannot_toggle_spaces(): void
    {
        $colaborador = $this->userWithRole('Colaborador');

        Sanctum::actingAs($colaborador);

        $this->assertCannotToggleAllSpaces();
    }

    public function test_utilizador_cannot_toggle_spaces(): void
    {
        $utilizador = $this->userWithRole('Utilizador');

        Sanctum::actingAs($utilizador);

        $this->assertCannotToggleAllSpaces();
    }

    public function test_inactive_user_cannot_access_space_routes(): void
    {
        $user = $this->userWithRole('Gestor');

        $user->update([
            'ativo' => false,
        ]);

        Sanctum::actingAs($user);

        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->getJson($definition['index'])
                ->assertForbidden();

            $this->patchJson(
                "{$definition['index']}/{$model->getKey()}/toggle-ativo"
            )->assertForbidden();
        }
    }

    private function assertCanToggleAllSpaces(): void
    {
        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $estadoInicial = (bool) $model->ativo;

            $this->patchJson(
                "{$definition['index']}/{$model->getKey()}/toggle-ativo"
            )->assertOk();

            $this->assertDatabaseHas($model->getTable(), [
                'id' => $model->getKey(),
                'ativo' => ! $estadoInicial,
            ]);
        }
    }

    private function assertCannotToggleAllSpaces(): void
    {
        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $estadoInicial = (bool) $model->ativo;

            $this->patchJson(
                "{$definition['index']}/{$model->getKey()}/toggle-ativo"
            )->assertForbidden();

            $this->assertDatabaseHas($model->getTable(), [
                'id' => $model->getKey(),
                'ativo' => $estadoInicial,
            ]);
        }
    }

    private function userWithRole(string $role): User
    {
        return User::query()
            ->whereHas('role', function ($query) use ($role): void {
                $query->where('nome', $role);
            })
            ->firstOrFail();
    }

    private function roleNames(): array
    {
        return [
            'Administrador',
            'Gestor',
            'Colaborador',
            'Utilizador',
        ];
    }

    private function spaceDefinitions(): array
    {
        return [
            [
                'model' => Edificio::class,
                'index' => '/api/edificios',
            ],
            [
                'model' => Piso::class,
                'index' => '/api/pisos',
            ],
            [
                'model' => Setor::class,
                'index' => '/api/setores',
            ],
            [
                'model' => Secretaria::class,
                'index' => '/api/secretarias',
            ],
        ];
    }
}