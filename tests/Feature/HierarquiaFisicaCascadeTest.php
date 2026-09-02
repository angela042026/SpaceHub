<?php

namespace Tests\Feature;

use App\Models\Piso;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\Setor;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Regressão para a mesma classe de bug já corrigida em reservas.user_id
 * (ver ProfileContaEliminacaoTest), mas um nível acima: toda a cadeia
 * edifício→piso→setor→secretaria era cascadeOnDelete(), o que arrastava
 * reservas/pagamentos/avaliações ao apagar qualquer nível acima.
 *
 * Não existe hoje nenhuma rota/UI que apague fisicamente estas
 * entidades (só toggleAtivo()) — por isso estes testes chamam
 * ->delete() diretamente no model, simulando o cenário que só se
 * tornaria possível se alguém adicionasse um destroy() no futuro sem
 * se lembrar deste risco.
 */
class HierarquiaFisicaCascadeTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    public function test_apagar_secretaria_com_reserva_e_bloqueado(): void
    {
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $user = $this->criarUsuarioComRole('Utilizador');

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => now()->addDay()->format('Y-m-d'),
            'data_fim' => now()->addDay()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $this->expectException(QueryException::class);

        $secretaria->delete();
    }

    public function test_apagar_setor_com_secretaria_e_bloqueado(): void
    {
        $secretaria = $this->criarSecretaria();
        $setor = $secretaria->setor;

        $this->expectException(QueryException::class);

        $setor->delete();
    }

    public function test_apagar_piso_com_setor_e_bloqueado(): void
    {
        $secretaria = $this->criarSecretaria();
        $piso = $secretaria->setor->piso;

        $this->expectException(QueryException::class);

        $piso->delete();
    }

    public function test_apagar_edificio_com_piso_e_bloqueado(): void
    {
        $secretaria = $this->criarSecretaria();
        $edificio = $secretaria->setor->piso->edificio;

        $this->expectException(QueryException::class);

        $edificio->delete();
    }

    public function test_apagar_secretaria_sem_dependentes_continua_a_funcionar(): void
    {
        $secretaria = $this->criarSecretaria();

        $secretaria->delete();

        $this->assertDatabaseMissing('secretarias', [
            'id' => $secretaria->id,
        ]);
    }
}
