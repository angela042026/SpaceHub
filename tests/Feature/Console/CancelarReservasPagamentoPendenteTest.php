<?php

namespace Tests\Feature\Console;

use App\Models\Pagamento;
use App\Models\Reserva;
use App\Notifications\PagamentoExpiradoNotification;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class CancelarReservasPagamentoPendenteTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function criarReservaComPagamento(string $estadoPagamento): array
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->criarEstadoReserva('pendente')->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'data_fim' => Carbon::today()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $pagamento = Pagamento::create([
            'reserva_id' => $reserva->id,
            'valor' => 8.00,
            'estado' => $estadoPagamento,
            'referencia' => 'REF-'.Str::upper(Str::random(8)),
        ]);

        return [$user, $reserva, $pagamento];
    }

    public function test_cancela_reserva_com_pagamento_pendente_expirado(): void
    {
        Notification::fake();

        Carbon::setTestNow(Carbon::parse('2026-01-15 09:00:00'));

        $this->criarEstadoReserva('cancelada');

        [$user, $reserva, $pagamento] = $this->criarReservaComPagamento('pendente');

        // 31 minutos depois — passou o limite de 30 minutos do comando.
        Carbon::setTestNow(Carbon::parse('2026-01-15 09:31:00'));

        Artisan::call('pagamentos:cancelar-pendentes-expirados');

        $reserva->refresh();
        $pagamento->refresh();

        $this->assertSame('cancelada', $reserva->estadoReserva->codigo);
        $this->assertNotNull($reserva->cancelada_at);
        $this->assertSame('cancelado', $pagamento->estado);

        Notification::assertSentTo(
            $user,
            PagamentoExpiradoNotification::class
        );
    }

    public function test_nao_cancela_pagamento_ainda_dentro_do_prazo(): void
    {
        Notification::fake();

        Carbon::setTestNow(Carbon::parse('2026-01-15 09:00:00'));

        $this->criarEstadoReserva('cancelada');

        [$user, $reserva, $pagamento] = $this->criarReservaComPagamento('pendente');

        // Só 10 minutos depois — ainda dentro do prazo de 30 minutos.
        Carbon::setTestNow(Carbon::parse('2026-01-15 09:10:00'));

        Artisan::call('pagamentos:cancelar-pendentes-expirados');

        $reserva->refresh();
        $pagamento->refresh();

        $this->assertNull($reserva->cancelada_at);
        $this->assertSame('pendente', $pagamento->estado);

        Notification::assertNotSentTo(
            $user,
            PagamentoExpiradoNotification::class
        );
    }

    public function test_nao_cancela_reserva_com_pagamento_ja_pago(): void
    {
        Notification::fake();

        Carbon::setTestNow(Carbon::parse('2026-01-15 09:00:00'));

        $this->criarEstadoReserva('cancelada');

        [$user, $reserva, $pagamento] = $this->criarReservaComPagamento('pago');

        Carbon::setTestNow(Carbon::parse('2026-01-15 10:00:00'));

        Artisan::call('pagamentos:cancelar-pendentes-expirados');

        $reserva->refresh();
        $pagamento->refresh();

        $this->assertNull($reserva->cancelada_at);
        $this->assertSame('pago', $pagamento->estado);

        Notification::assertNotSentTo(
            $user,
            PagamentoExpiradoNotification::class
        );
    }
}
