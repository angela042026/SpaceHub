<?php

namespace Tests\Feature\Api;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class SpacePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_administrator_has_all_space_permissions(): void
    {
        $admin = $this->userWithRole('Administrador');

        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->assertTrue(
                Gate::forUser($admin)->allows('viewAny', $modelClass)
            );

            $this->assertTrue(
                Gate::forUser($admin)->allows('view', $model)
            );

            $this->assertTrue(
                Gate::forUser($admin)->allows('create', $modelClass)
            );

            $this->assertTrue(
                Gate::forUser($admin)->allows('update', $model)
            );

            $this->assertTrue(
                Gate::forUser($admin)->allows('toggleAtivo', $model)
            );
        }
    }

    public function test_gestor_can_manage_spaces(): void
    {
        $gestor = $this->userWithRole('Gestor');

        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->assertTrue(
                Gate::forUser($gestor)->allows('viewAny', $modelClass)
            );

            $this->assertTrue(
                Gate::forUser($gestor)->allows('view', $model)
            );

            $this->assertTrue(
                Gate::forUser($gestor)->allows('create', $modelClass)
            );

            $this->assertTrue(
                Gate::forUser($gestor)->allows('update', $model)
            );

            $this->assertTrue(
                Gate::forUser($gestor)->allows('toggleAtivo', $model)
            );
        }
    }

    public function test_colaborador_can_only_view_spaces(): void
    {
        $colaborador = $this->userWithRole('Colaborador');

        $this->assertReadOnlyPermissions($colaborador);
    }

    public function test_utilizador_can_only_view_spaces(): void
    {
        $utilizador = $this->userWithRole('Utilizador');

        $this->assertReadOnlyPermissions($utilizador);
    }

    public function test_inactive_user_has_no_space_permissions(): void
    {
        $user = $this->userWithRole('Gestor');

        $user->update([
            'ativo' => false,
        ]);

        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->assertFalse(
                Gate::forUser($user)->allows('viewAny', $modelClass)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('view', $model)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('create', $modelClass)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('update', $model)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('toggleAtivo', $model)
            );
        }
    }

    private function assertReadOnlyPermissions(User $user): void
    {
        foreach ($this->spaceDefinitions() as $definition) {
            $modelClass = $definition['model'];
            $model = $modelClass::query()->firstOrFail();

            $this->assertTrue(
                Gate::forUser($user)->allows('viewAny', $modelClass)
            );

            $this->assertTrue(
                Gate::forUser($user)->allows('view', $model)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('create', $modelClass)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('update', $model)
            );

            $this->assertFalse(
                Gate::forUser($user)->allows('toggleAtivo', $model)
            );
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

    private function spaceDefinitions(): array
    {
        return [
            ['model' => Edificio::class],
            ['model' => Piso::class],
            ['model' => Setor::class],
            ['model' => Secretaria::class],
        ];
    }
}