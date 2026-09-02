<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Secretaria;
use App\Services\ReservaCriacaoService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Regressão para um bug reportado ao usar a app: uma reserva de "Dia
 * inteiro" perdia a opção de continuar como "Dia inteiro" ao editar,
 * porque ReservaController::edit() só passava
 * periodosReservaAtivos() (que exclui Dia inteiro de propósito, para a
 * grelha Manhã/Tarde) — sem nenhuma alternativa para o período Dia
 * inteiro em si. Corrigido passando todos os períodos ativos.
 *
 * Também cobre a falta de sincronização de reserva_dias em
 * ReservaController::update() (o mesmo padrão já corrigido em
 * Admin\ReservaController::update()) — descoberta ao investigar este
 * bug.
 */
class ReservaUpdateDiaInteiroTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    private function criarPeriodoDiaInteiro(): Periodo
    {
        return Periodo::create([
            'nome' => 'Dia inteiro',
            'hora_inicio' => '08:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);
    }

    private function criarSecretariaComPreco(): Secretaria
    {
        $secretaria = $this->criarSecretaria();
        $secretaria->setor->update([
            'preco_dia_inteiro' => 14.00,
        ]);

        return $secretaria;
    }

    public function test_editar_reserva_dia_inteiro_para_outra_secretaria_mantendo_dia_inteiro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretariaOriginal = $this->criarSecretariaComPreco();
        $secretariaNova = $this->criarSecretariaComPreco();
        $periodoDiaInteiro = $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $data = Carbon::tomorrow()->format('Y-m-d');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretariaOriginal->id,
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
        ]);

        // Cenário exato do bug reportado: manter Dia inteiro, só mudar
        // a secretária.
        $response = $this->actingAs($user)->put(
            route('reservas.update', $reserva),
            [
                'data' => $data,
                'periodo_id' => $periodoDiaInteiro->id,
                'secretaria_id' => $secretariaNova->id,
            ]
        );

        $response->assertRedirect(route('reservas.index'));
        $response->assertSessionHas('success');
        $response->assertSessionDoesntHaveErrors();

        $reserva->refresh();
        $this->assertSame($secretariaNova->id, $reserva->secretaria_id);
        $this->assertSame($periodoDiaInteiro->id, $reserva->periodo_id);
    }

    public function test_atualizar_reserva_regenera_reserva_dias(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretariaOriginal = $this->criarSecretariaComPreco();
        $secretariaNova = $this->criarSecretariaComPreco();
        $periodoDiaInteiro = $this->criarPeriodoDiaInteiro();
        $this->criarEstadoReserva('pendente');

        $data = Carbon::tomorrow()->format('Y-m-d');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretariaOriginal->id,
            'periodo_id' => $periodoDiaInteiro->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
        ]);

        ReservaDia::insert([
            [
                'reserva_id' => $reserva->id,
                'secretaria_id' => $secretariaOriginal->id,
                'user_id' => $user->id,
                'dia' => $data,
                'slot' => 'manha',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'reserva_id' => $reserva->id,
                'secretaria_id' => $secretariaOriginal->id,
                'user_id' => $user->id,
                'dia' => $data,
                'slot' => 'tarde',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->actingAs($user)->put(
            route('reservas.update', $reserva),
            [
                'data' => $data,
                'periodo_id' => $periodoDiaInteiro->id,
                'secretaria_id' => $secretariaNova->id,
            ]
        );

        $this->assertSame(
            0,
            ReservaDia::where('secretaria_id', $secretariaOriginal->id)->count()
        );

        $this->assertSame(
            2,
            ReservaDia::where('secretaria_id', $secretariaNova->id)->count()
        );
    }

    /**
     * RES-03: mudar só a data de início de uma reserva semanal (via
     * fluxo web, "As Minhas Reservas") desloca data_fim na mesma
     * medida, preservando a duração original.
     */
    public function test_mudar_data_de_inicio_de_reserva_semanal_recalcula_data_fim(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretariaComPreco();
        $secretaria->setor->update(['preco_semanal' => 40.00]);
        $this->criarPeriodoDiaInteiro();
        $this->criarPeriodo();
        $this->criarEstadoReserva('pendente');

        $segunda = Carbon::today()->addDays(200)->next(Carbon::MONDAY);
        $novaSegunda = $segunda->copy()->addWeek();

        $reserva = app(ReservaCriacaoService::class)->criarDiaInteiro([
            'data' => $segunda->toDateString(),
            'secretaria_id' => $secretaria->id,
            'tipo_duracao' => 'semanal',
        ], $user->id);

        $response = $this->actingAs($user)->put(
            route('reservas.update', $reserva),
            [
                'data' => $novaSegunda->toDateString(),
                'periodo_id' => $reserva->periodo_id,
                'secretaria_id' => $secretaria->id,
            ]
        );

        $response->assertRedirect(route('reservas.index'));
        $response->assertSessionDoesntHaveErrors();

        $reserva->refresh();
        $this->assertSame($novaSegunda->toDateString(), $reserva->data->toDateString());
        $this->assertSame(
            $novaSegunda->copy()->addDays(6)->toDateString(),
            $reserva->data_fim->toDateString()
        );
        $this->assertSame(14, ReservaDia::where('reserva_id', $reserva->id)->count());
    }
}
