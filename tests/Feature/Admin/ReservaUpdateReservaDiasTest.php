<?php

namespace Tests\Feature\Admin;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Role;
use App\Models\User;
use App\Services\ReservaCriacaoService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Admin\ReservaController::update() só valida a data nova contra
 * conflitos com um único dia (existeReservaAtivaNaData) — não recalcula
 * data_fim, e não olhava para reserva_dias. Isto deixava uma lacuna
 * residual: mudar a secretária de uma reserva multi-dia, mantendo a
 * mesma data de início, só era validado contra esse UM dia, nunca
 * contra o resto do intervalo (data até data_fim antigo).
 */
class ReservaUpdateReservaDiasTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private function admin(): User
    {
        return User::factory()->create([
            'role_id' => Role::firstOrCreate(
                ['nome' => 'Administrador'],
                ['descricao' => 'Administrador']
            )->id,
        ]);
    }

    public function test_atualizar_reserva_regenera_reserva_dias_para_a_nova_secretaria(): void
    {
        $admin = $this->admin();
        $dono = $this->criarUsuarioComRole('Utilizador');

        $secretariaOriginal = $this->criarSecretaria();
        $secretariaOriginal->setor->update(['preco_semanal' => 40.00]);

        $secretariaNova = $this->criarSecretaria();
        $secretariaNova->setor->update(['preco_semanal' => 40.00]);

        $this->criarPeriodo();
        Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
        $this->criarEstadoReserva('pendente');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretariaOriginal->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        $this->assertSame(10, ReservaDia::where('reserva_id', $reserva->id)->count());
        $this->assertSame(
            10,
            ReservaDia::where('secretaria_id', $secretariaOriginal->id)->count()
        );

        $response = $this->actingAs($admin)->put(
            route('admin.reservas.update', $reserva),
            ['secretaria_id' => $secretariaNova->id]
        );

        $response->assertRedirect(route('admin.reservas.index'));
        $response->assertSessionHas('success');

        // As linhas antigas (secretária original) desaparecem, as
        // novas (secretária nova) aparecem — mesmo intervalo de dias.
        $this->assertSame(
            0,
            ReservaDia::where('secretaria_id', $secretariaOriginal->id)->count()
        );

        $this->assertSame(
            10,
            ReservaDia::where('secretaria_id', $secretariaNova->id)->count()
        );
    }

    public function test_atualizar_reserva_com_conflito_de_reserva_dias_devolve_erro_amigavel(): void
    {
        $admin = $this->admin();
        $donoA = $this->criarUsuarioComRole('Utilizador');
        $donoB = $this->criarUsuarioComRole('Utilizador');

        $secretariaAlvo = $this->criarSecretaria();
        $secretariaAlvo->setor->update(['preco_semanal' => 40.00]);

        $secretariaOriginalDeB = $this->criarSecretaria();
        $secretariaOriginalDeB->setor->update(['preco_semanal' => 40.00]);

        $periodoDiaInteiro = Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
        $this->criarPeriodo();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);
        $quarta = $segunda->copy()->addDays(2);
        $sexta = $segunda->copy()->addDays(4);

        // Reserva A: já ocupa a secretária alvo de quarta a sexta.
        $reservaA = Reserva::create([
            'user_id' => $donoA->id,
            'secretaria_id' => $secretariaAlvo->id,
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $quarta->toDateString(),
            'data_fim' => $sexta->toDateString(),
            'tipo_duracao' => 'semanal',
        ]);

        ReservaDia::insert(array_map(
            fn (array $dia) => [
                'reserva_id' => $reservaA->id,
                'secretaria_id' => $secretariaAlvo->id,
                'user_id' => $donoA->id,
                'dia' => $dia['dia'],
                'slot' => $dia['slot'],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            app(\App\Services\ReservaDisponibilidadeService::class)->gerarDiasOcupados(
                $quarta->toDateString(),
                $sexta->toDateString(),
                'Dia inteiro'
            )
        ));

        // Reserva B: semanal, segunda a sexta, noutra secretária.
        $reservaB = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretariaOriginalDeB->id,
            'tipo_duracao' => 'semanal',
        ], $donoB->id);

        // O admin move a reserva B para a secretária alvo, mantendo a
        // MESMA data de início (segunda) — o pre-check de um único dia
        // (existeReservaAtivaNaData) só olha para "segunda", onde a
        // secretária alvo está livre; não vê o conflito de
        // quarta/quinta/sexta, que só a constraint de reserva_dias apanha.
        $response = $this->actingAs($admin)->put(
            route('admin.reservas.update', $reservaB),
            ['secretaria_id' => $secretariaAlvo->id]
        );

        $response->assertSessionHasErrors('secretaria_id');

        // Nada foi alterado: a reserva B continua na secretária original.
        $reservaB->refresh();
        $this->assertSame($secretariaOriginalDeB->id, $reservaB->secretaria_id);

        $this->assertSame(
            10,
            ReservaDia::where('reserva_id', $reservaB->id)->count()
        );
    }
}
