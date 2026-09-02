<?php

namespace Tests\Feature\Api;

use App\Models\Pagamento;
use App\Models\Reserva;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * PagamentoPolicy resolve o bypass do Administrador inteiramente no
 * hook before(); view()/confirmar() dependem de uma consulta real à
 * relação reserva->user_id, por isso aqui é preciso persistir
 * reserva+pagamento em vez de instanciar modelos soltos em memória.
 */
class PagamentoPolicyTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    private Role $administradorRole;

    private Role $utilizadorRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $this->administradorRole = Role::where('nome', 'Administrador')->firstOrFail();
        $this->utilizadorRole = Role::where('nome', 'Utilizador')->firstOrFail();
    }

    private function criarPagamento(User $dono, string $estado = 'pendente'): Pagamento
    {
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => now()->addDay()->format('Y-m-d'),
            'data_fim' => now()->addDay()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        return Pagamento::create([
            'reserva_id' => $reserva->id,
            'valor' => 8.00,
            'estado' => $estado,
            'referencia' => 'REF-'.Str::upper(Str::random(8)),
        ]);
    }

    public function test_administrator_can_view_and_confirm_any_pagamento(): void
    {
        $admin = $this->createUser($this->administradorRole);
        $dono = $this->createUser($this->utilizadorRole);

        // Um pagamento já pago, de outra pessoa: mesmo assim o admin
        // consegue view/confirmar, porque before() ignora as regras
        // normais de dono/estado para o Administrador.
        $pagamento = $this->criarPagamento($dono, 'pago');

        $this->assertTrue(Gate::forUser($admin)->allows('view', $pagamento));
        $this->assertTrue(Gate::forUser($admin)->allows('confirmar', $pagamento));
    }

    public function test_owner_can_view_and_confirm_own_pending_pagamento(): void
    {
        $dono = $this->createUser($this->utilizadorRole);

        $pagamento = $this->criarPagamento($dono, 'pendente');

        $this->assertTrue(Gate::forUser($dono)->allows('viewAny', Pagamento::class));
        $this->assertTrue(Gate::forUser($dono)->allows('view', $pagamento));
        $this->assertTrue(Gate::forUser($dono)->allows('confirmar', $pagamento));
    }

    public function test_user_cannot_view_or_confirm_others_pagamento(): void
    {
        $dono = $this->createUser($this->utilizadorRole);
        $outro = $this->createUser($this->utilizadorRole);

        $pagamento = $this->criarPagamento($dono, 'pendente');

        $this->assertFalse(Gate::forUser($outro)->allows('view', $pagamento));
        $this->assertFalse(Gate::forUser($outro)->allows('confirmar', $pagamento));
    }

    public function test_owner_cannot_confirm_pagamento_already_paid(): void
    {
        $dono = $this->createUser($this->utilizadorRole);

        $pagamento = $this->criarPagamento($dono, 'pago');

        // Continua a poder consultar (view não olha ao estado)...
        $this->assertTrue(Gate::forUser($dono)->allows('view', $pagamento));

        // ...mas não pode voltar a confirmar um pagamento já concluído.
        $this->assertFalse(Gate::forUser($dono)->allows('confirmar', $pagamento));
    }

    public function test_api_rejeita_filtros_de_pagamento_invalidos(): void
    {
        $user = $this->createUser($this->utilizadorRole);
        Sanctum::actingAs($user);

        $this->getJson('/api/pagamentos?estado=inexistente&per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['estado', 'per_page']);
    }

    private function createUser(Role $role): User
    {
        return User::factory()->create([
            'role_id' => $role->id,
            'ativo' => true,
        ]);
    }
}
