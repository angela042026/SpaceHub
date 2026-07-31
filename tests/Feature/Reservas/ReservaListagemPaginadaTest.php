<?php

namespace Tests\Feature\Reservas;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * A listagem "As Minhas Reservas" tem de vir paginada: antes enviava
 * todas as reservas do utilizador de uma vez para o Inertia, e crescia
 * sem travão.
 *
 * O terceiro teste é o que interessa guardar: sem o withQueryString()
 * os filtros desaparecem ao mudar de página, e isso passa despercebido
 * porque a primeira página continua a parecer certa.
 */
class ReservaListagemPaginadaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Tem de acompanhar o paginate() do ReservaController::index.
     */
    private const POR_PAGINA = 9;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_a_primeira_pagina_traz_apenas_o_limite(): void
    {
        $user = $this->criarUtilizador();

        $this->criarReservas($user, self::POR_PAGINA + 1);

        $this->actingAs($user)
            ->get(route('reservas.index'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Reservas/Index')
                    ->has('reservas.data', self::POR_PAGINA)
                    ->where('reservas.total', self::POR_PAGINA + 1)
                    ->where('reservas.current_page', 1)
                    ->where('reservas.last_page', 2)
            );
    }

    public function test_a_segunda_pagina_traz_as_restantes(): void
    {
        $user = $this->criarUtilizador();

        $this->criarReservas($user, self::POR_PAGINA + 1);

        $this->actingAs($user)
            ->get(route('reservas.index', ['page' => 2]))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->has('reservas.data', 1)
                    ->where('reservas.current_page', 2)
            );
    }

    public function test_os_filtros_sobrevivem_a_mudanca_de_pagina(): void
    {
        $user = $this->criarUtilizador();

        $this->criarReservas($user, self::POR_PAGINA + 1);

        $this->actingAs($user)
            ->get(route('reservas.index', ['estado' => 'pendente']))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->where('reservas.total', self::POR_PAGINA + 1)
                    ->where(
                        'reservas.next_page_url',
                        fn (?string $url) => $url !== null
                            && str_contains($url, 'estado=pendente')
                    )
            );
    }

    private function criarUtilizador(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    /**
     * Reservas em dias diferentes, para não esbarrar no índice único de
     * reservas ativas (utilizador + data + período). As datas ficam
     * longe o suficiente para não colidirem com as dos seeders.
     */
    private function criarReservas(User $user, int $quantidade): void
    {
        $secretaria = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->firstOrFail();

        $periodo = Periodo::where('nome', 'Manhã')->firstOrFail();

        $estadoPendente = EstadoReserva::where('codigo', 'pendente')
            ->firstOrFail();

        for ($i = 0; $i < $quantidade; $i++) {
            $data = Carbon::today()
                ->addDays(200 + $i)
                ->toDateString();

            Reserva::create([
                'user_id' => $user->id,
                'secretaria_id' => $secretaria->id,
                'periodo_id' => $periodo->id,
                'estado_reserva_id' => $estadoPendente->id,
                'data' => $data,
                'data_fim' => $data,
                'tipo_duracao' => 'diaria',
            ]);
        }
    }
}
