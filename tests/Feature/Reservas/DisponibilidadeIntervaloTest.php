<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;
use App\Services\ReservaCriacaoService;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Uma reserva de vários dias é uma única linha, com data no primeiro dia
 * e data_fim no último. As consultas de disponibilidade procuravam só
 * por whereDate('data', $data), pelo que o lugar aparecia livre a partir
 * do segundo dia — mas a criação, que compara intervalos, recusava-o.
 *
 * O utilizador escolhia um lugar apresentado como livre e só descobria o
 * contrário ao submeter.
 */
class DisponibilidadeIntervaloTest extends TestCase
{
    use RefreshDatabase;

    private Secretaria $secretaria;
    private string $segunda;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->secretaria = Secretaria::query()
            ->where('ativo', true)
            ->where('reservavel', true)
            ->firstOrFail();

        $this->segunda = Carbon::today()
            ->addDays(200)
            ->next(Carbon::MONDAY)
            ->toDateString();

        $this->reservarSemanaInteira();
    }

    public function test_o_lugar_nao_aparece_livre_no_meio_da_semana(): void
    {
        $quarta = Carbon::parse($this->segunda)->addDays(2)->toDateString();

        $livres = $this->livresEm($quarta);

        $this->assertNotContains(
            $this->secretaria->id,
            $livres,
            'A secretária está reservada até sexta e apareceu livre à quarta.'
        );
    }

    public function test_a_api_tambem_nao_o_mostra_livre(): void
    {
        $quarta = Carbon::parse($this->segunda)->addDays(2)->toDateString();

        Sanctum::actingAs($this->criarUtilizador());

        $resposta = $this->getJson('/api/reservas/disponibilidade?' . http_build_query([
            'data' => $quarta,
            'periodo_id' => $this->periodoManha()->id,
        ]));

        $resposta->assertSuccessful();

        $this->assertNotContains(
            $this->secretaria->id,
            collect($resposta->json('data'))->pluck('id')->all()
        );
    }

    public function test_o_lugar_volta_a_aparecer_livre_depois_do_intervalo(): void
    {
        $seguinte = Carbon::parse($this->segunda)->addDays(8)->toDateString();

        $livres = $this->livresEm($seguinte);

        $this->assertContains($this->secretaria->id, $livres);
    }

    /** IDs das secretárias que o serviço considera livres em $data. */
    private function livresEm(string $data): array
    {
        return app(ReservaDisponibilidadeService::class)
            ->secretariasDisponiveis($data, $this->periodoManha()->id)
            ->pluck('id')
            ->all();
    }

    private function reservarSemanaInteira(): void
    {
        app(ReservaCriacaoService::class)->criarDiaInteiro(
            [
                'data' => $this->segunda,
                'secretaria_id' => $this->secretaria->id,
                'tipo_duracao' => 'semanal',
            ],
            $this->criarUtilizador()->id
        );
    }

    private function periodoManha(): Periodo
    {
        return Periodo::where('nome', 'Manhã')->firstOrFail();
    }

    private function criarUtilizador(): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }
}
