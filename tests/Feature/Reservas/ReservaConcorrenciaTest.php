<?php

namespace Tests\Feature\Reservas;

use App\Models\Reserva;
use App\Services\ReservaDisponibilidadeService;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Testa a última linha de defesa contra reservas em conflito: a
 * constraint única da base de dados (unique_reserva_secretaria_periodo_ativa
 * / unique_reserva_utilizador_periodo_ativo).
 *
 * ReservaCriacaoService::garantirSemConflitos() faz uma verificação
 * exists() antes de inserir, mas sem lock — sob concorrência real, dois
 * pedidos podem ambos passar essa verificação antes de qualquer um dos
 * dois gravar. Por isso, ao contrário de ReservaTest::test_rejeita_*
 * (que passa pelo fluxo HTTP normal, sequencialmente, e nunca chega a
 * exercitar a constraint), aqui criamos as duas reservas diretamente
 * via Eloquent, ignorando de propósito a verificação da aplicação —
 * simulando o estado exato em que ambos os pedidos concorrentes já
 * decidiram inserir antes de qualquer um commitar.
 */
class ReservaConcorrenciaTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    public function test_constraint_da_bd_impede_dupla_reserva_da_mesma_secretaria_sob_concorrencia(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $data = Carbon::tomorrow()->format('Y-m-d');

        // "Pedido 1": já decidiu inserir, ainda ninguém tinha reservado.
        Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
        ]);

        // "Pedido 2": a verificação de disponibilidade dele também não
        // via conflito (correu antes do Pedido 1 gravar) — só resta a
        // constraint da BD para o travar.
        try {
            Reserva::create([
                'user_id' => $outro->id,
                'secretaria_id' => $secretaria->id,
                'periodo_id' => $periodo->id,
                'estado_reserva_id' => $estadoPendente->id,
                'data' => $data,
                'data_fim' => $data,
                'tipo_duracao' => 'diaria',
            ]);

            $this->fail('Esperava QueryException por violação da constraint única de secretária.');
        } catch (QueryException $e) {
            $this->assertTrue(
                app(ReservaDisponibilidadeService::class)->ehConflitoDeReservaAtiva($e)
            );
        }

        $this->assertSame(
            1,
            Reserva::where('secretaria_id', $secretaria->id)->count()
        );
    }

    public function test_constraint_da_bd_impede_dupla_reserva_do_mesmo_utilizador_sob_concorrencia(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $secretaria1 = $this->criarSecretaria();
        $secretaria2 = $this->criarSecretaria();

        $periodo = $this->criarPeriodo();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $data = Carbon::tomorrow()->format('Y-m-d');

        // "Pedido 1": o mesmo utilizador reserva a secretária 1.
        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria1->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
        ]);

        // "Pedido 2": o mesmo utilizador, quase ao mesmo tempo, reserva
        // uma secretária diferente no mesmo dia/período — a verificação
        // de "já tenho reserva neste período" dele também não via
        // conflito ainda.
        try {
            Reserva::create([
                'user_id' => $user->id,
                'secretaria_id' => $secretaria2->id,
                'periodo_id' => $periodo->id,
                'estado_reserva_id' => $estadoPendente->id,
                'data' => $data,
                'data_fim' => $data,
                'tipo_duracao' => 'diaria',
            ]);

            $this->fail('Esperava QueryException por violação da constraint única de utilizador.');
        } catch (QueryException $e) {
            $this->assertTrue(
                app(ReservaDisponibilidadeService::class)->ehConflitoDeReservaAtiva($e)
            );
        }

        $this->assertSame(
            1,
            Reserva::where('user_id', $user->id)->count()
        );
    }

    public function test_reserva_cancelada_liberta_o_slot_para_a_constraint(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outro = $this->criarUsuarioComRole('Utilizador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $data = Carbon::tomorrow()->format('Y-m-d');

        $reservaCancelada = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
            'cancelada_at' => now(),
        ]);

        // As colunas virtuais (secretaria_id_ativa/user_id_ativo) só têm
        // valor quando cancelada_at é NULL — uma reserva cancelada não
        // deve impedir outra reserva genuína no mesmo slot.
        $novaReserva = Reserva::create([
            'user_id' => $outro->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $data,
            'data_fim' => $data,
            'tipo_duracao' => 'diaria',
        ]);

        $this->assertNotNull($novaReserva->id);
        $this->assertNotSame($reservaCancelada->id, $novaReserva->id);
    }
}
