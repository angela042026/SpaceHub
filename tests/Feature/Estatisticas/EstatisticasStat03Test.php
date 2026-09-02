<?php

namespace Tests\Feature\Estatisticas;

use App\Models\Reserva;
use App\Services\EstatisticasService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * STAT-03: os indicadores do dashboard de Estatísticas
 * (EstatisticasService::obterDashboard()) não devem contar reservas
 * canceladas/expiradas — só reservas_por_estado é exceção deliberada,
 * porque o objetivo desse cartão é mostrar a distribuição por TODOS os
 * estados.
 */
class EstatisticasStat03Test extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // O cache do dashboard (array driver nos testes) sobrevive entre
        // métodos de teste no mesmo processo — sem isto, dois testes que
        // pedem o mesmo período no mesmo dia liam a resposta um do outro.
        Cache::flush();
    }

    /**
     * Uma reserva com o estado indicado, em secretária/período próprios
     * (uma hierarquia física nova por chamada), para nunca colidir com o
     * índice único de reservas ativas entre estados diferentes.
     */
    private function criarReservaComEstado(string $estadoCodigo): Reserva
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $estado = $this->criarEstadoReserva($estadoCodigo);

        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'data_fim' => Carbon::today()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
            'cancelada_at' => in_array($estadoCodigo, ['cancelada', 'expirada'], true) ? now() : null,
        ]);
    }

    public function test_total_reservas_exclui_canceladas_e_expiradas(): void
    {
        // Contam: pendente, confirmada, concluida, nao_compareceu.
        $this->criarReservaComEstado('pendente');
        $this->criarReservaComEstado('confirmada');
        $this->criarReservaComEstado('concluida');
        $this->criarReservaComEstado('nao_compareceu');

        // Não contam.
        $this->criarReservaComEstado('cancelada');
        $this->criarReservaComEstado('expirada');

        $dashboard = app(EstatisticasService::class)->obterDashboard('30dias');

        $this->assertSame(4, $dashboard['kpis']['totalReservas']['valor']);
    }

    public function test_top_utilizadores_ignora_quem_so_tem_reserva_cancelada(): void
    {
        $confirmada = $this->criarReservaComEstado('confirmada');
        $cancelada = $this->criarReservaComEstado('cancelada');

        $dashboard = app(EstatisticasService::class)->obterDashboard('30dias');

        $ids = collect($dashboard['topUtilizadores'])->pluck('id');

        $this->assertTrue($ids->contains($confirmada->user_id));
        $this->assertFalse($ids->contains($cancelada->user_id));
    }

    /**
     * reservas_por_estado é a exceção deliberada — continua a mostrar
     * canceladas/expiradas, porque é precisamente esse o seu propósito.
     */
    public function test_reservas_por_estado_continua_a_mostrar_canceladas_e_expiradas(): void
    {
        $this->criarReservaComEstado('confirmada');
        $this->criarReservaComEstado('cancelada');
        $this->criarReservaComEstado('expirada');

        $dashboard = app(EstatisticasService::class)->obterDashboard('30dias');

        $porCodigo = collect($dashboard['reservasPorEstado'])->keyBy('codigo');

        $this->assertSame(1, $porCodigo->get('confirmada')['total']);
        $this->assertSame(1, $porCodigo->get('cancelada')['total']);
        $this->assertSame(1, $porCodigo->get('expirada')['total']);
    }
}
