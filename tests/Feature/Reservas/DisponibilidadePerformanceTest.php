<?php

namespace Tests\Feature\Reservas;

use App\Models\Periodo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * anexarDisponibilidadePorPeriodo() recalculava periodosEmConflito()
 * (2 queries à tabela periodos) para cada combinação secretária ×
 * período, apesar do resultado só depender do período. Confirma que o
 * número de queries à tabela periodos deixa de escalar com o número de
 * secretárias devolvidas.
 */
class DisponibilidadePerformanceTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_consulta_de_disponibilidade_nao_escala_queries_de_periodo_com_o_numero_de_secretarias(): void
    {
        $periodoManha = $this->criarPeriodo('08:00:00', '13:00:00');
        Periodo::create([
            'nome' => 'Tarde',
            'hora_inicio' => '14:00:00',
            'hora_fim' => '18:00:00',
            'ativo' => true,
        ]);

        // 6 secretárias reserváveis, no mesmo setor.
        $secretaria = $this->criarSecretaria();
        for ($i = 0; $i < 5; $i++) {
            $secretaria->setor->secretarias()->create([
                'codigo' => 'SEC-' . uniqid(),
                'reservavel' => true,
                'ativo' => true,
            ]);
        }

        $user = $this->criarUsuarioComRole('Utilizador');

        $queriesAPeriodos = 0;

        DB::listen(function ($query) use (&$queriesAPeriodos) {
            if (str_contains($query->sql, '"periodos"') || str_contains($query->sql, '`periodos`')) {
                $queriesAPeriodos++;
            }
        });

        $response = $this->actingAs($user)->getJson(
            route('reservas.lugaresPorSetor', [
                'data' => now()->addDays(30)->format('Y-m-d'),
                'setor_id' => $secretaria->setor_id,
            ])
        );

        $response->assertOk();
        $this->assertCount(6, $response->json());

        // Sem o N+1: 2 períodos × (1 findOrFail + 1 whereIn) = no máximo
        // 4 queries a "periodos", independentemente de haver 6
        // secretárias. Antes da correção seriam 2 períodos × 6
        // secretárias × 2 queries = 24.
        $this->assertLessThanOrEqual(
            6,
            $queriesAPeriodos,
            'O número de queries a "periodos" não deveria escalar com o número de secretárias.'
        );
    }
}
