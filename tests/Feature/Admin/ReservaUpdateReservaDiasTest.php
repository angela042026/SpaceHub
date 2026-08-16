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
 * Admin\ReservaController::update() regenera reserva_dias para a
 * secretária/intervalo corretos (RES-02), e valida conflitos contra o
 * intervalo completo [data, data_fim] via existeReservaAtivaNoIntervalo,
 * recalculando data_fim para preservar a duração original quando só a
 * data de início muda (RES-03) — antes só validava contra o único dia
 * novo (existeReservaAtivaNaData), deixando conflitos nos restantes
 * dias só para a constraint de reserva_dias apanhar via QueryException.
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

        $this->assertSame(14, ReservaDia::where('reserva_id', $reserva->id)->count());
        $this->assertSame(
            14,
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
            14,
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

        // Reserva B: semanal, 7 dias corridos a partir de segunda, noutra secretária.
        $reservaB = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretariaOriginalDeB->id,
            'tipo_duracao' => 'semanal',
        ], $donoB->id);

        // O admin move a reserva B para a secretária alvo, mantendo a
        // MESMA data de início (segunda) — o pre-check agora olha para
        // todo o intervalo [segunda, domingo] (existeReservaAtivaNoIntervalo),
        // por isso já apanha o conflito de quarta/quinta/sexta na
        // validação, sem precisar da constraint de reserva_dias como
        // rede de segurança.
        $response = $this->actingAs($admin)->put(
            route('admin.reservas.update', $reservaB),
            ['secretaria_id' => $secretariaAlvo->id]
        );

        $response->assertSessionHasErrors('secretaria_id');

        // Nada foi alterado: a reserva B continua na secretária original.
        $reservaB->refresh();
        $this->assertSame($secretariaOriginalDeB->id, $reservaB->secretaria_id);

        $this->assertSame(
            14,
            ReservaDia::where('reserva_id', $reservaB->id)->count()
        );
    }

    /**
     * RES-03: mudar só a data de início de uma reserva semanal (7 dias)
     * desloca data_fim na mesma medida, preservando a duração original.
     */
    public function test_mudar_data_de_inicio_recalcula_data_fim_preservando_a_duracao(): void
    {
        $admin = $this->admin();
        $dono = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $secretaria->setor->update(['preco_semanal' => 40.00]);

        Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
        $this->criarPeriodo();
        $this->criarEstadoReserva('pendente');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);
        $novaSegunda = $segunda->copy()->addWeek();

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $dono->id);

        $dataFimOriginal = $reserva->data_fim->toDateString();
        $this->assertSame(
            $segunda->copy()->addDays(6)->toDateString(),
            $dataFimOriginal
        );

        $response = $this->actingAs($admin)->put(
            route('admin.reservas.update', $reserva),
            ['data' => $novaSegunda->toDateString()]
        );

        $response->assertRedirect(route('admin.reservas.index'));

        $reserva->refresh();
        $this->assertSame($novaSegunda->toDateString(), $reserva->data->toDateString());
        $this->assertSame(
            $novaSegunda->copy()->addDays(6)->toDateString(),
            $reserva->data_fim->toDateString()
        );

        // Continua a ocupar exatamente 7 dias (14 linhas: 2 slots/dia).
        $this->assertSame(14, ReservaDia::where('reserva_id', $reserva->id)->count());
    }
}
