<?php

namespace Tests\Feature\Api;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCrudIndexTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->admin = User::query()
            ->where('email', 'admin@spacehub.pt')
            ->firstOrFail();

        Sanctum::actingAs($this->admin);
    }

    public function test_users_support_search_filters_sorting_and_pagination(): void
    {
        $token = 'Pesquisa-' . Str::lower(Str::random(8));

        $role = Role::query()
            ->where('nome', 'Utilizador')
            ->firstOrFail();

        User::create([
            'name' => "{$token} Alfa",
            'email' => Str::lower(Str::random(8)) . '@spacehub.test',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
            'ativo' => false,
        ]);

        User::create([
            'name' => "{$token} Beta",
            'email' => Str::lower(Str::random(8)) . '@spacehub.test',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
            'ativo' => false,
        ]);

        User::create([
            'name' => "{$token} Gama",
            'email' => Str::lower(Str::random(8)) . '@spacehub.test',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
            'ativo' => true,
        ]);

        $response = $this->getJson('/api/users?' . http_build_query([
            'search' => $token,
            'role_id' => $role->id,
            'ativo' => false,
            'sort_by' => 'name',
            'sort_direction' => 'desc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', "{$token} Beta")
            ->assertJsonPath('data.0.ativo', false)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 2);
    }

    public function test_edificios_support_search_filters_sorting_and_pagination(): void
    {
        $token = 'Edificio-' . Str::lower(Str::random(8));

        $this->createEdificio([
            'nome' => "{$token} Alfa",
            'codigo' => Str::upper(Str::random(8)),
            'cidade' => 'Lisboa',
            'pais' => 'Portugal',
            'ativo' => true,
        ]);

        $this->createEdificio([
            'nome' => "{$token} Beta",
            'codigo' => Str::upper(Str::random(8)),
            'cidade' => 'Lisboa',
            'pais' => 'Portugal',
            'ativo' => true,
        ]);

        $this->createEdificio([
            'nome' => "{$token} Gama",
            'codigo' => Str::upper(Str::random(8)),
            'cidade' => 'Porto',
            'pais' => 'Portugal',
            'ativo' => true,
        ]);

        $response = $this->getJson('/api/edificios?' . http_build_query([
            'search' => $token,
            'cidade' => 'Lisboa',
            'pais' => 'Portugal',
            'ativo' => true,
            'sort_by' => 'nome',
            'sort_direction' => 'desc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nome', "{$token} Beta")
            ->assertJsonPath('data.0.cidade', 'Lisboa')
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 2);
    }

    public function test_pisos_support_search_filters_sorting_and_pagination(): void
    {
        $token = 'Piso-' . Str::lower(Str::random(8));

        $edificio = $this->createEdificio([
            'nome' => "Edifício {$token}",
            'codigo' => Str::upper(Str::random(8)),
        ]);

        $this->createPiso($edificio, [
            'nome' => "{$token} Um",
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 1,
            'ativo' => true,
        ]);

        $this->createPiso($edificio, [
            'nome' => "{$token} Dois",
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 2,
            'ativo' => true,
        ]);

        $this->createPiso($edificio, [
            'nome' => "{$token} Três",
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 3,
            'ativo' => false,
        ]);

        $response = $this->getJson('/api/pisos?' . http_build_query([
            'search' => $token,
            'edificio_id' => $edificio->id,
            'ativo' => true,
            'sort_by' => 'numero',
            'sort_direction' => 'desc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.numero', 2)
            ->assertJsonPath('data.0.ativo', true)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 2);
    }

    public function test_setores_support_search_filters_sorting_and_pagination(): void
    {
        $token = 'Setor-' . Str::lower(Str::random(8));

        $edificio = $this->createEdificio([
            'nome' => "Edifício {$token}",
            'codigo' => Str::upper(Str::random(8)),
        ]);

        $piso = $this->createPiso($edificio, [
            'nome' => "Piso {$token}",
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 10,
        ]);

        $this->createSetor($piso, [
            'nome' => "{$token} Pequeno",
            'codigo' => Str::upper(Str::random(6)),
            'tipo' => 'coworking',
            'capacidade' => 5,
            'reservavel' => true,
            'ativo' => true,
        ]);

        $this->createSetor($piso, [
            'nome' => "{$token} Grande",
            'codigo' => Str::upper(Str::random(6)),
            'tipo' => 'coworking',
            'capacidade' => 20,
            'reservavel' => true,
            'ativo' => true,
        ]);

        $this->createSetor($piso, [
            'nome' => "{$token} Inativo",
            'codigo' => Str::upper(Str::random(6)),
            'tipo' => 'reuniao',
            'capacidade' => 50,
            'reservavel' => false,
            'ativo' => false,
        ]);

        $response = $this->getJson('/api/setores?' . http_build_query([
            'search' => $token,
            'piso_id' => $piso->id,
            'tipo' => 'coworking',
            'reservavel' => true,
            'ativo' => true,
            'sort_by' => 'capacidade',
            'sort_direction' => 'desc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nome', "{$token} Grande")
            ->assertJsonPath('data.0.capacidade', 20)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 2);
    }

    public function test_secretarias_support_search_filters_sorting_and_pagination(): void
    {
        $token = 'SEC-' . Str::upper(Str::random(6));

        $edificio = $this->createEdificio([
            'nome' => "Edifício {$token}",
            'codigo' => Str::upper(Str::random(8)),
        ]);

        $piso = $this->createPiso($edificio, [
            'nome' => "Piso {$token}",
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 20,
        ]);

        $setor = $this->createSetor($piso, [
            'nome' => "Setor {$token}",
            'codigo' => Str::upper(Str::random(6)),
        ]);

        Secretaria::create([
            'setor_id' => $setor->id,
            'codigo' => "{$token}-01",
            'monitor' => true,
            'dock_usb' => true,
            'junto_janela' => false,
            'ergonomica' => true,
            'reservavel' => true,
            'ativo' => true,
            'descricao' => "Secretária {$token} número um",
        ]);

        Secretaria::create([
            'setor_id' => $setor->id,
            'codigo' => "{$token}-02",
            'monitor' => true,
            'dock_usb' => true,
            'junto_janela' => false,
            'ergonomica' => true,
            'reservavel' => true,
            'ativo' => true,
            'descricao' => "Secretária {$token} número dois",
        ]);

        Secretaria::create([
            'setor_id' => $setor->id,
            'codigo' => "{$token}-03",
            'monitor' => false,
            'dock_usb' => false,
            'junto_janela' => true,
            'ergonomica' => false,
            'reservavel' => false,
            'ativo' => false,
            'descricao' => "Secretária {$token} número três",
        ]);

        $response = $this->getJson('/api/secretarias?' . http_build_query([
            'search' => $token,
            'setor_id' => $setor->id,
            'monitor' => true,
            'dock_usb' => true,
            'ergonomica' => true,
            'reservavel' => true,
            'ativo' => true,
            'sort_by' => 'codigo',
            'sort_direction' => 'desc',
            'per_page' => 1,
        ]));

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.codigo', "{$token}-02")
            ->assertJsonPath('data.0.monitor', true)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 2);
    }

    private function createEdificio(array $attributes = []): Edificio
    {
        return Edificio::create(array_merge([
            'nome' => 'Edifício de teste',
            'codigo' => Str::upper(Str::random(8)),
            'morada' => 'Rua de Teste, 1',
            'codigo_postal' => '1000-001',
            'cidade' => 'Lisboa',
            'pais' => 'Portugal',
            'telefone' => '210000000',
            'email' => Str::lower(Str::random(8)) . '@edificio.test',
            'hora_abertura' => '08:00',
            'hora_fecho' => '20:00',
            'ativo' => true,
            'descricao' => 'Edifício criado durante os testes.',
        ], $attributes));
    }

    private function createPiso(
        Edificio $edificio,
        array $attributes = []
    ): Piso {
        return Piso::create(array_merge([
            'edificio_id' => $edificio->id,
            'nome' => 'Piso de teste',
            'codigo' => Str::upper(Str::random(6)),
            'numero' => 1,
            'descricao' => 'Piso criado durante os testes.',
            'ativo' => true,
        ], $attributes));
    }

    private function createSetor(
        Piso $piso,
        array $attributes = []
    ): Setor {
        return Setor::create(array_merge([
            'piso_id' => $piso->id,
            'nome' => 'Setor de teste',
            'codigo' => Str::upper(Str::random(6)),
            'tipo' => 'coworking',
            'reservavel' => true,
            'capacidade' => 10,
            'descricao' => 'Setor criado durante os testes.',
            'ativo' => true,
        ], $attributes));
    }
}