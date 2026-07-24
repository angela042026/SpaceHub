<?php

namespace Tests\Feature\Pagamentos;

use App\Models\Pagamento;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\User;
use App\Services\PagamentoService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class PagamentoServiceTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private PagamentoService $pagamentoService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pagamentoService = app(PagamentoService::class);
    }

    /**
     * Cria uma reserva válida para os testes de pagamentos.
     */
    private function criarReserva(
        User $user,
        Secretaria $secretaria,
        Periodo $periodo,
        ?string $data = null,
        ?string $canceladaAt = null,
    ): Reserva {
        return Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this
                ->criarEstadoReserva('pendente')
                ->id,
            'data' => $data
                ?? Carbon::tomorrow()->format('Y-m-d'),
            'cancelada_at' => $canceladaAt,
        ]);
    }

    /**
     * Define os preços do setor da secretária.
     */
    private function definirPrecos(
        Secretaria $secretaria,
        float $precoMeioDia = 15.50,
        float $precoDiaInteiro = 25.00,
    ): void {
        $secretaria->setor()->update([
            'preco_meio_dia' => $precoMeioDia,
            'preco_dia_inteiro' => $precoDiaInteiro,
        ]);
    }

    /**
     * Cria um pagamento pendente associado a uma reserva.
     */
    private function criarPagamentoPendente(
        ?User $user = null,
        ?Secretaria $secretaria = null,
        ?Periodo $periodo = null,
    ): Pagamento {
        $user ??= $this->criarUsuarioComRole('Utilizador');
        $secretaria ??= $this->criarSecretaria();
        $periodo ??= $this->criarPeriodo();

        $this->definirPrecos($secretaria);

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        return $this->pagamentoService
            ->criarParaReserva($reserva);
    }

    public function test_cria_pagamento_pendente_para_reserva(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $this->definirPrecos(
            $secretaria,
            15.50,
            25.00
        );

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $pagamento = $this->pagamentoService
            ->criarParaReserva($reserva);

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'reserva_id' => $reserva->id,
            'valor' => 15.50,
            'estado' => 'pendente',
            'metodo_pagamento' => null,
            'data_pagamento' => null,
        ]);

        $this->assertSame(
            $reserva->id,
            $pagamento->reserva_id
        );

        $this->assertSame(
            'pendente',
            $pagamento->estado
        );

        $this->assertNull(
            $pagamento->metodo_pagamento
        );

        $this->assertNull(
            $pagamento->data_pagamento
        );
    }

    public function test_cria_pagamento_com_preco_de_meio_dia(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $periodo->update([
            'nome' => 'Manhã',
        ]);

        $this->definirPrecos(
            $secretaria,
            12.75,
            22.50
        );

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $pagamento = $this->pagamentoService
            ->criarParaReserva($reserva);

        $this->assertSame(
            '12.75',
            $pagamento->valor
        );

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'valor' => 12.75,
            'estado' => 'pendente',
        ]);
    }

    public function test_cria_pagamento_com_preco_de_dia_inteiro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $periodo->update([
            'nome' => 'Dia inteiro',
        ]);

        $this->definirPrecos(
            $secretaria,
            14.00,
            28.90
        );

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $pagamento = $this->pagamentoService
            ->criarParaReserva($reserva);

        $this->assertSame(
            '28.90',
            $pagamento->valor
        );

        $this->assertDatabaseHas('pagamentos', [
            'reserva_id' => $reserva->id,
            'valor' => 28.90,
            'estado' => 'pendente',
        ]);
    }

    public function test_pagamento_recebe_referencia_interna_unica(): void
    {
        $primeiroUser = $this->criarUsuarioComRole('Utilizador');
        $segundoUser = $this->criarUsuarioComRole('Utilizador');

        $primeiraSecretaria = $this->criarSecretaria();
        $segundaSecretaria = $this->criarSecretaria();

        $periodo = $this->criarPeriodo();

        $this->definirPrecos($primeiraSecretaria);
        $this->definirPrecos($segundaSecretaria);

        $primeiraReserva = $this->criarReserva(
            $primeiroUser,
            $primeiraSecretaria,
            $periodo
        );

        $segundaReserva = $this->criarReserva(
            $segundoUser,
            $segundaSecretaria,
            $periodo
        );

        $primeiroPagamento = $this->pagamentoService
            ->criarParaReserva($primeiraReserva);

        $segundoPagamento = $this->pagamentoService
            ->criarParaReserva($segundaReserva);

        $this->assertNotEmpty(
            $primeiroPagamento->referencia
        );

        $this->assertNotEmpty(
            $segundoPagamento->referencia
        );

        $this->assertMatchesRegularExpression(
            '/^SPH-[A-Z0-9]{12}$/',
            $primeiroPagamento->referencia
        );

        $this->assertMatchesRegularExpression(
            '/^SPH-[A-Z0-9]{12}$/',
            $segundoPagamento->referencia
        );

        $this->assertNotSame(
            $primeiroPagamento->referencia,
            $segundoPagamento->referencia
        );

        $this->assertDatabaseHas('pagamentos', [
            'referencia' => $primeiroPagamento->referencia,
        ]);

        $this->assertDatabaseHas('pagamentos', [
            'referencia' => $segundoPagamento->referencia,
        ]);
    }

    public function test_confirma_pagamento_pendente_com_cartao(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamentoConfirmado = $this->pagamentoService
            ->confirmarPagamento(
                $pagamento,
                'cartao'
            );

        $this->assertSame(
            'pago',
            $pagamentoConfirmado->estado
        );

        $this->assertSame(
            'cartao',
            $pagamentoConfirmado->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamentoConfirmado->data_pagamento
        );

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'estado' => 'pago',
            'metodo_pagamento' => 'cartao',
        ]);
    }

    public function test_confirma_pagamento_pendente_com_mbway(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamentoConfirmado = $this->pagamentoService
            ->confirmarPagamento(
                $pagamento,
                'mbway'
            );

        $this->assertSame(
            'pago',
            $pagamentoConfirmado->estado
        );

        $this->assertSame(
            'mbway',
            $pagamentoConfirmado->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamentoConfirmado->data_pagamento
        );
    }

    public function test_confirma_pagamento_pendente_com_transferencia(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamentoConfirmado = $this->pagamentoService
            ->confirmarPagamento(
                $pagamento,
                'transferencia'
            );

        $this->assertSame(
            'pago',
            $pagamentoConfirmado->estado
        );

        $this->assertSame(
            'transferencia',
            $pagamentoConfirmado->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamentoConfirmado->data_pagamento
        );
    }

    public function test_rejeita_metodo_de_pagamento_invalido(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        try {
            $this->pagamentoService->confirmarPagamento(
                $pagamento,
                'dinheiro'
            );

            $this->fail(
                'Era esperada uma ValidationException.'
            );
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey(
                'metodo_pagamento',
                $exception->errors()
            );
        }

        $pagamento->refresh();

        $this->assertSame(
            'pendente',
            $pagamento->estado
        );

        $this->assertNull(
            $pagamento->metodo_pagamento
        );

        $this->assertNull(
            $pagamento->data_pagamento
        );
    }

    public function test_impede_confirmar_pagamento_que_ja_foi_pago(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $this->pagamentoService->confirmarPagamento(
            $pagamento,
            'cartao'
        );

        try {
            $this->pagamentoService->confirmarPagamento(
                $pagamento,
                'mbway'
            );

            $this->fail(
                'Era esperada uma ValidationException.'
            );
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey(
                'pagamento',
                $exception->errors()
            );
        }

        $pagamento->refresh();

        $this->assertSame(
            'pago',
            $pagamento->estado
        );

        $this->assertSame(
            'cartao',
            $pagamento->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamento->data_pagamento
        );
    }

    public function test_impede_confirmar_pagamento_cancelado(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamento->update([
            'estado' => 'cancelado',
        ]);

        try {
            $this->pagamentoService->confirmarPagamento(
                $pagamento,
                'cartao'
            );

            $this->fail(
                'Era esperada uma ValidationException.'
            );
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey(
                'pagamento',
                $exception->errors()
            );
        }

        $pagamento->refresh();

        $this->assertSame(
            'cancelado',
            $pagamento->estado
        );

        $this->assertNull(
            $pagamento->metodo_pagamento
        );

        $this->assertNull(
            $pagamento->data_pagamento
        );
    }

    public function test_impede_pagar_reserva_cancelada(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamento->reserva->update([
            'cancelada_at' => now(),
        ]);

        try {
            $this->pagamentoService->confirmarPagamento(
                $pagamento,
                'cartao'
            );

            $this->fail(
                'Era esperada uma ValidationException.'
            );
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey(
                'pagamento',
                $exception->errors()
            );
        }

        $pagamento->refresh();

        $this->assertSame(
            'pendente',
            $pagamento->estado
        );

        $this->assertNull(
            $pagamento->metodo_pagamento
        );

        $this->assertNull(
            $pagamento->data_pagamento
        );
    }

    public function test_cancela_pagamento_pendente_da_reserva(): void
    {
        $pagamento = $this->criarPagamentoPendente();
        $reserva = $pagamento->reserva;

        $this->pagamentoService
            ->cancelarParaReserva($reserva);

        $pagamento->refresh();

        $this->assertSame(
            'cancelado',
            $pagamento->estado
        );

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'reserva_id' => $reserva->id,
            'estado' => 'cancelado',
        ]);
    }

    public function test_cancelar_reserva_sem_pagamento_nao_lanca_erro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $this->pagamentoService
            ->cancelarParaReserva($reserva);

        $this->assertDatabaseMissing('pagamentos', [
            'reserva_id' => $reserva->id,
        ]);

        $this->assertSame(
            0,
            Pagamento::where('reserva_id', $reserva->id)->count()
        );
    }

    public function test_cancelar_pagamento_ja_cancelado_nao_altera_estado(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamento->update([
            'estado' => 'cancelado',
        ]);

        $this->pagamentoService
            ->cancelarParaReserva($pagamento->reserva);

        $pagamento->refresh();

        $this->assertSame(
            'cancelado',
            $pagamento->estado
        );
    }

    public function test_cancelar_pagamento_reembolsado_nao_altera_estado(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $pagamento->update([
            'estado' => 'reembolsado',
        ]);

        $this->pagamentoService
            ->cancelarParaReserva($pagamento->reserva);

        $pagamento->refresh();

        $this->assertSame(
            'reembolsado',
            $pagamento->estado
        );
    }

    public function test_impede_cancelar_pagamento_ja_pago(): void
    {
        $pagamento = $this->criarPagamentoPendente();

        $this->pagamentoService->confirmarPagamento(
            $pagamento,
            'cartao'
        );

        try {
            $this->pagamentoService
                ->cancelarParaReserva($pagamento->reserva);

            $this->fail(
                'Era esperada uma ValidationException.'
            );
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey(
                'pagamento',
                $exception->errors()
            );
        }

        $pagamento->refresh();

        $this->assertSame(
            'pago',
            $pagamento->estado
        );

        $this->assertSame(
            'cartao',
            $pagamento->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamento->data_pagamento
        );
    }

    public function test_atualiza_valor_de_pagamento_pendente(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();

        $periodo->update([
            'nome' => 'Manhã',
        ]);

        $this->definirPrecos(
            $secretaria,
            10.00,
            20.00
        );

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo
        );

        $pagamento = $this->pagamentoService
            ->criarParaReserva($reserva);

        $this->assertSame(
            '10.00',
            $pagamento->valor
        );

        $secretaria->setor()->update([
            'preco_meio_dia' => 17.50,
            'preco_dia_inteiro' => 30.00,
        ]);

        $this->pagamentoService
            ->atualizarValorParaReserva($reserva);

        $pagamento->refresh();

        $this->assertSame(
            '17.50',
            $pagamento->valor
        );

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'reserva_id' => $reserva->id,
            'valor' => 17.50,
            'estado' => 'pendente',
        ]);
    }

    public function test_atualiza_valor_ao_mudar_para_dia_inteiro(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodoMeioDia = $this->criarPeriodo();

        $periodoMeioDia->update([
            'nome' => 'Manhã',
        ]);

        $this->definirPrecos(
            $secretaria,
            12.00,
            27.50
        );

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodoMeioDia
        );

        $pagamento = $this->pagamentoService
            ->criarParaReserva($reserva);

        $this->assertSame(
            '12.00',
            $pagamento->valor
        );

        $periodoDiaInteiro = $this->criarPeriodo();

        $periodoDiaInteiro->update([
            'nome' => 'Dia inteiro',
        ]);

        $reserva->update([
            'periodo_id' => $periodoDiaInteiro->id,
        ]);

        $reserva->refresh();

        $this->pagamentoService
            ->atualizarValorParaReserva($reserva);

        $pagamento->refresh();

        $this->assertSame(
            '27.50',
            $pagamento->valor
        );
    }

  public function test_impede_atualizar_valor_de_pagamento_pago(): void
{
    $pagamento = $this->criarPagamentoPendente();
    $valorOriginal = $pagamento->valor;

    $this->pagamentoService->confirmarPagamento(
        $pagamento,
        'cartao'
    );

    $pagamento->reserva
        ->secretaria
        ->setor()
        ->update([
            'preco_meio_dia' => 99.00,
            'preco_dia_inteiro' => 150.00,
        ]);

    try {
        $this->pagamentoService
            ->atualizarValorParaReserva($pagamento->reserva);

        $this->fail(
            'Era esperada uma ValidationException.'
        );
    } catch (ValidationException $exception) {
        $this->assertArrayHasKey(
            'pagamento',
            $exception->errors()
        );

        $this->assertSame(
            'Não é possível alterar o espaço ou o período porque o pagamento já não se encontra pendente.',
            $exception->errors()['pagamento'][0]
        );
    }

    $pagamento->refresh();

    $this->assertSame(
        'pago',
        $pagamento->estado
    );

    $this->assertSame(
        $valorOriginal,
        $pagamento->valor
    );

    $this->assertSame(
        'cartao',
        $pagamento->metodo_pagamento
    );

    $this->assertNotNull(
        $pagamento->data_pagamento
    );
}

public function test_impede_atualizar_valor_de_pagamento_cancelado(): void
{
    $pagamento = $this->criarPagamentoPendente();
    $valorOriginal = $pagamento->valor;

    $this->pagamentoService
        ->cancelarParaReserva($pagamento->reserva);

    $pagamento->reserva
        ->secretaria
        ->setor()
        ->update([
            'preco_meio_dia' => 99.00,
            'preco_dia_inteiro' => 150.00,
        ]);

    try {
        $this->pagamentoService
            ->atualizarValorParaReserva($pagamento->reserva);

        $this->fail(
            'Era esperada uma ValidationException.'
        );
    } catch (ValidationException $exception) {
        $this->assertArrayHasKey(
            'pagamento',
            $exception->errors()
        );

        $this->assertSame(
            'Não é possível alterar o espaço ou o período porque o pagamento já não se encontra pendente.',
            $exception->errors()['pagamento'][0]
        );
    }

    $pagamento->refresh();

    $this->assertSame(
        'cancelado',
        $pagamento->estado
    );

    $this->assertSame(
        $valorOriginal,
        $pagamento->valor
    );

    $this->assertNull(
        $pagamento->metodo_pagamento
    );

    $this->assertNull(
        $pagamento->data_pagamento
    );
}
}