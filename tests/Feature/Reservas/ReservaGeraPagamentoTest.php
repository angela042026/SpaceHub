<?php

namespace Tests\Feature\Reservas;

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
 * Toda a reserva criada tem de ficar com um pagamento pendente
 * associado: é o que a torna pagável e o que permite ao comando
 * pagamentos:cancelar-pendentes-expirados libertar o lugar mais tarde
 * (esse comando filtra por whereHas('pagamento')).
 *
 * O teste corre os dois caminhos de criação — site e API — porque foi
 * exatamente aqui que divergiram: a API criava a reserva com
 * Reserva::create() em vez do ReservaCriacaoService, e ficava sem
 * pagamento, sem data_fim e sem tipo_duracao.
 */
class ReservaGeraPagamentoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_reserva_criada_pelo_site_gera_pagamento_pendente(): void
    {
        $user = $this->criarUtilizador();

        $this->actingAs($user)
            ->post('/reservas', [
                'data' => $this->dataLivre(),
                'periodo_id' => $this->periodoManha()->id,
                'secretaria_id' => $this->secretariaReservavel()->id,
                'tipo_duracao' => 'diaria',
            ])
            ->assertRedirect(route('reservas.index'));

        $reserva = $this->ultimaReservaDe($user);

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'estado' => 'pendente',
        ]);
    }

    public function test_reserva_criada_pela_api_gera_pagamento_pendente(): void
    {
        $user = $this->criarUtilizador();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/reservas', [
            'data' => $this->dataLivre(),
            'periodo_id' => $this->periodoManha()->id,
            'secretaria_id' => $this->secretariaReservavel()->id,
        ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $response->json('data.id'),
            'estado' => 'pendente',
        ]);
    }

    /**
     * A API não recebe estes campos do cliente, mas o serviço tem de os
     * preencher — o cálculo de disponibilidade em intervalos depende
     * deles.
     *
     * A verificação é feita pelo modelo, e não com assertDatabaseHas: os
     * testes correm em SQLite, que não tem tipo DATE e guarda a data com
     * as horas ("2026-11-30 00:00:00"), enquanto o MySQL de produção
     * trunca para "2026-11-30". Ler pelo cast dá o mesmo nos dois.
     */
    public function test_reserva_criada_pela_api_fica_com_intervalo_preenchido(): void
    {
        $user = $this->criarUtilizador();

        Sanctum::actingAs($user);

        $data = $this->dataLivre();

        $response = $this->postJson('/api/reservas', [
            'data' => $data,
            'periodo_id' => $this->periodoManha()->id,
            'secretaria_id' => $this->secretariaReservavel()->id,
        ]);

        $response->assertSuccessful();

        $reserva = Reserva::findOrFail($response->json('data.id'));

        $this->assertSame('diaria', $reserva->tipo_duracao);
        $this->assertNotNull(
            $reserva->data_fim,
            'A reserva ficou sem data_fim — o serviço de criação não foi usado.'
        );
        $this->assertSame($data, $reserva->data_fim->toDateString());
    }

    /**
     * O valor do pagamento vem do preço do setor, não de um valor fixo:
     * confirma que a API passou mesmo pelo PagamentoService.
     */
    public function test_pagamento_da_api_usa_o_preco_de_meio_dia_do_setor(): void
    {
        $user = $this->criarUtilizador();
        $secretaria = $this->secretariaReservavel();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/reservas', [
            'data' => $this->dataLivre(),
            'periodo_id' => $this->periodoManha()->id,
            'secretaria_id' => $secretaria->id,
        ]);

        $response->assertSuccessful();

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $response->json('data.id'),
            'valor' => number_format(
                (float) $secretaria->setor->preco_meio_dia,
                2,
                '.',
                ''
            ),
        ]);
    }

    private function criarUtilizador(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    private function periodoManha(): Periodo
    {
        return Periodo::where('nome', 'Manhã')->firstOrFail();
    }

    private function secretariaReservavel(): Secretaria
    {
        return Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->whereHas('setor', function ($query): void {
                $query->where('reservavel', true)
                    ->whereNotNull('preco_meio_dia');
            })
            ->with('setor')
            ->firstOrFail();
    }

    /**
     * Uma segunda-feira suficientemente distante para não colidir com as
     * reservas criadas pelos seeders.
     */
    private function dataLivre(): string
    {
        return Carbon::today()
            ->addDays(120)
            ->next(Carbon::MONDAY)
            ->toDateString();
    }

    private function ultimaReservaDe(User $user): Reserva
    {
        return Reserva::where('user_id', $user->id)
            ->latest('id')
            ->firstOrFail();
    }
}
