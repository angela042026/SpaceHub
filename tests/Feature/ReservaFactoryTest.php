<?php

namespace Tests\Feature;

use App\Models\Pagamento;
use App\Models\Reserva;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * ReservaFactory.php estava com 0 bytes e o model Reserva não usava
 * HasFactory — Reserva::factory() falhava com erro fatal, e
 * PagamentoFactory (que depende de Reserva::factory() para o
 * reserva_id) falhava com ela.
 */
class ReservaFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_reserva_factory_cria_uma_reserva_valida(): void
    {
        $reserva = Reserva::factory()->create();

        $this->assertNotNull($reserva->id);
        $this->assertNotNull($reserva->user_id);
        $this->assertNotNull($reserva->secretaria_id);
        $this->assertNotNull($reserva->periodo_id);
        $this->assertNotNull($reserva->estado_reserva_id);
    }

    public function test_pagamento_factory_funciona_isoladamente(): void
    {
        $pagamento = Pagamento::factory()->create();

        $this->assertNotNull($pagamento->id);
        $this->assertInstanceOf(Reserva::class, $pagamento->reserva);
    }

    public function test_reserva_factory_reutiliza_secretaria_existente_em_vez_de_duplicar_hierarquia(): void
    {
        $primeira = Reserva::factory()->create();
        $segunda = Reserva::factory()->create();

        $this->assertSame($primeira->secretaria_id, $segunda->secretaria_id);
    }
}
