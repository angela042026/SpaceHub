<?php

namespace Tests\Feature\Reservas;

use App\Models\Pagamento;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Cancelar uma reserva tem de passar sempre pelo PagamentoService, nos
 * dois caminhos. O serviço faz duas coisas que o controller da API não
 * fazia:
 *
 *  - põe um pagamento pendente em cancelado, em vez de o deixar
 *    pendente para sempre (a reserva fica com cancelada_at, por isso o
 *    comando de expiração também já não lhe toca);
 *  - recusa cancelar uma reserva já paga, enquanto o reembolso não
 *    estiver implementado.
 */
class ReservaCancelamentoPagamentoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_cancelar_pela_api_cancela_o_pagamento_pendente(): void
    {
        $user = $this->criarUtilizador();
        $reserva = $this->criarReservaComPagamento($user);

        Sanctum::actingAs($user);

        $this->patchJson("/api/reservas/{$reserva->id}/cancelar")
            ->assertSuccessful();

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'estado' => 'cancelado',
        ]);
    }

    public function test_cancelar_pelo_site_cancela_o_pagamento_pendente(): void
    {
        $user = $this->criarUtilizador();
        $reserva = $this->criarReservaComPagamento($user);

        $this->actingAs($user)
            ->patch(route('reservas.cancelar', $reserva->id))
            ->assertRedirect(route('reservas.index'));

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'estado' => 'cancelado',
        ]);
    }

    /**
     * A regra do reembolso vinha só do fluxo web. Pela API era possível
     * cancelar uma reserva já paga sem deixar rasto do dinheiro.
     */
    public function test_api_recusa_cancelar_reserva_ja_paga(): void
    {
        $user = $this->criarUtilizador();
        $reserva = $this->criarReservaComPagamento($user, 'pago');

        Sanctum::actingAs($user);

        $this->patchJson("/api/reservas/{$reserva->id}/cancelar")
            ->assertUnprocessable();

        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
            'cancelada_at' => null,
        ]);

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'estado' => 'pago',
        ]);
    }

    private function criarUtilizador(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    /**
     * Cria a reserva pelo fluxo normal (que já gera o pagamento) e, se
     * preciso, força o estado do pagamento.
     */
    private function criarReservaComPagamento(
        User $user,
        string $estadoPagamento = 'pendente'
    ): Reserva {
        $secretaria = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->firstOrFail();

        $this->actingAs($user)->post('/reservas', [
            'data' => Carbon::today()->addDays(150)->next(Carbon::MONDAY)
                ->toDateString(),
            'periodo_id' => Periodo::where('nome', 'Manhã')->firstOrFail()->id,
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'diaria',
        ]);

        $reserva = Reserva::where('user_id', $user->id)
            ->latest('id')
            ->firstOrFail();

        if ($estadoPagamento !== 'pendente') {
            Pagamento::where('reserva_id', $reserva->id)
                ->firstOrFail()
                ->update(['estado' => $estadoPagamento]);
        }

        return $reserva;
    }
}
