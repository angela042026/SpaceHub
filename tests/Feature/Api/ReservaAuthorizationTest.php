<?php

namespace Tests\Feature\Api;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservaAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Role $administradorRole;
    private Role $gestorRole;
    private Role $colaboradorRole;
    private Role $utilizadorRole;

    protected function setUp(): void
    {
        parent::setUp();

        /*
         * Executa os seeders registados no DatabaseSeeder:
         * roles, estados, períodos, estrutura e restantes dados necessários.
         */
        $this->seed();

        $this->administradorRole = Role::where('nome', 'Administrador')
            ->firstOrFail();

        $this->gestorRole = Role::where('nome', 'Gestor')
            ->firstOrFail();

        $this->colaboradorRole = Role::where('nome', 'Colaborador')
            ->firstOrFail();

        $this->utilizadorRole = Role::where('nome', 'Utilizador')
            ->firstOrFail();
    }

    public function test_guest_receives_401_on_reserva_routes(): void
    {
        $this->getJson('/api/reservas')
            ->assertUnauthorized();

        $this->postJson('/api/reservas', [])
            ->assertUnauthorized();

        $this->getJson('/api/reservas/disponibilidade')
            ->assertUnauthorized();
    }

    public function test_administrator_can_list_all_reservas(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($admin);

        $this->getJson('/api/reservas')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $reserva->id,
            ]);
    }

    public function test_user_lists_only_own_reservas(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $otherUser = $this->createUser($this->utilizadorRole);

        $ownReserva = $this->createReservaFor($user, 40);
        $otherReserva = $this->createReservaFor($otherUser, 41);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/reservas')
            ->assertOk();

        $response->assertJsonFragment([
            'id' => $ownReserva->id,
        ]);

        $response->assertJsonMissing([
            'id' => $otherReserva->id,
        ]);
    }

    public function test_all_roles_can_list_their_own_reservas(): void
    {
        foreach ([
            $this->gestorRole,
            $this->colaboradorRole,
            $this->utilizadorRole,
        ] as $index => $role) {
            $user = $this->createUser($role);

            $reserva = $this->createReservaFor(
                $user,
                50 + $index
            );

            Sanctum::actingAs($user);

            $this->getJson('/api/reservas')
                ->assertOk()
                ->assertJsonFragment([
                    'id' => $reserva->id,
                ]);
        }
    }

    public function test_user_can_view_own_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $reserva = $this->createReservaFor($user);

        Sanctum::actingAs($user);

        $this->getJson("/api/reservas/{$reserva->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $reserva->id);
    }

    public function test_user_cannot_view_other_users_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($user);

        $this->getJson("/api/reservas/{$reserva->id}")
            ->assertForbidden();
    }

    public function test_user_can_update_own_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $reserva = $this->createReservaFor($user);

        Sanctum::actingAs($user);

        $this->putJson("/api/reservas/{$reserva->id}", [
            'observacoes' => 'Reserva atualizada pelo proprietário.',
        ])
            ->assertOk()
            ->assertJsonPath(
                'data.observacoes',
                'Reserva atualizada pelo proprietário.'
            );

        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
            'observacoes' => 'Reserva atualizada pelo proprietário.',
        ]);
    }

    /**
     * O update() da API não regenerava reserva_dias — as linhas
     * antigas continuavam a "bloquear" a secretária original e o novo
     * intervalo ficava sem a proteção anti-concorrência desta tabela.
     */
    public function test_atualizar_reserva_via_api_sincroniza_reserva_dias(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $reserva = $this->createReservaFor($user);

        $secretariaNova = Secretaria::query()
            ->where('ativo', true)
            ->where('id', '!=', $reserva->secretaria_id)
            ->firstOrFail();

        // Simula o estado que a criação real deixaria: linhas de
        // reserva_dias já existentes para a secretária/data originais.
        ReservaDia::insert([
            [
                'reserva_id' => $reserva->id,
                'secretaria_id' => $reserva->secretaria_id,
                'user_id' => $user->id,
                'dia' => $reserva->data->format('Y-m-d'),
                'slot' => 'manha',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Sanctum::actingAs($user);

        $this->putJson("/api/reservas/{$reserva->id}", [
            'secretaria_id' => $secretariaNova->id,
            'periodo_id' => $reserva->periodo_id,
            'data' => $reserva->data->format('Y-m-d'),
        ])->assertOk();

        $this->assertSame(
            0,
            ReservaDia::where('secretaria_id', $reserva->secretaria_id)->count(),
            'As linhas antigas de reserva_dias deveriam ter sido removidas.'
        );

        $this->assertGreaterThan(
            0,
            ReservaDia::where('reserva_id', $reserva->id)
                ->where('secretaria_id', $secretariaNova->id)
                ->count(),
            'Deveriam existir novas linhas de reserva_dias para a secretária atualizada.'
        );
    }

    public function test_user_cannot_update_other_users_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($user);

        $this->putJson("/api/reservas/{$reserva->id}", [
            'observacoes' => 'Tentativa não autorizada.',
        ])->assertForbidden();

        $this->assertDatabaseMissing('reservas', [
            'id' => $reserva->id,
            'observacoes' => 'Tentativa não autorizada.',
        ]);
    }

    public function test_user_can_cancel_own_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $reserva = $this->createReservaFor($user);

        Sanctum::actingAs($user);

        $this->patchJson("/api/reservas/{$reserva->id}/cancelar")
            ->assertOk();

        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
        ]);

        $this->assertNotNull(
            $reserva->fresh()->cancelada_at
        );
    }

    public function test_user_cannot_cancel_other_users_reserva(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($user);

        $this->patchJson("/api/reservas/{$reserva->id}/cancelar")
            ->assertForbidden();

        $this->assertNull(
            $reserva->fresh()->cancelada_at
        );
    }

    public function test_administrator_can_view_any_reserva(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($admin);

        $this->getJson("/api/reservas/{$reserva->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $reserva->id);
    }

    public function test_administrator_can_update_any_reserva(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($admin);

        $this->putJson("/api/reservas/{$reserva->id}", [
            'observacoes' => 'Atualizada pelo administrador.',
        ])
            ->assertOk()
            ->assertJsonPath(
                'data.observacoes',
                'Atualizada pelo administrador.'
            );
    }

    public function test_administrator_can_cancel_any_reserva(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/reservas/{$reserva->id}/cancelar")
            ->assertOk();

        $this->assertNotNull(
            $reserva->fresh()->cancelada_at
        );
    }

    public function test_reserva_validation_returns_422(): void
    {
        $user = $this->createUser($this->utilizadorRole);

        Sanctum::actingAs($user);

        $this->postJson('/api/reservas', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'data',
                'periodo_id',
                'secretaria_id',
            ]);
    }

    public function test_user_cannot_assign_reserva_to_another_user(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        $otherUser = $this->createUser($this->utilizadorRole);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/reservas', [
            'user_id' => $otherUser->id,
            'data' => now()->addDays(70)->format('Y-m-d'),
            'periodo_id' => Periodo::query()->firstOrFail()->id,
            'secretaria_id' => Secretaria::query()->firstOrFail()->id,
            'observacoes' => 'O user_id enviado deve ser ignorado.',
        ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('reservas', [
            'id' => $response->json('data.id'),
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseMissing('reservas', [
            'id' => $response->json('data.id'),
            'user_id' => $otherUser->id,
        ]);
    }

    public function test_reserva_destroy_route_does_not_exist(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $owner = $this->createUser($this->utilizadorRole);

        $reserva = $this->createReservaFor($owner);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/reservas/{$reserva->id}")
            ->assertMethodNotAllowed();

        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
        ]);
    }

    private function createUser(Role $role): User
    {
        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => true,
        ]);
    }

    private function createReservaFor(
        User $user,
        int $daysFromNow = 30
    ): Reserva {
        $secretaria = Secretaria::query()
            ->where('ativo', true)
            ->firstOrFail();

        $periodo = Periodo::query()
            ->where('ativo', true)
            ->firstOrFail();

        $estadoPendente = EstadoReserva::query()
            ->where('codigo', 'pendente')
            ->firstOrFail();

        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => now()->addDays($daysFromNow)->format('Y-m-d'),
            'observacoes' => null,
            'check_in_at' => null,
            'cancelada_at' => null,
        ]);
    }
}