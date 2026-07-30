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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class PagamentoTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private PagamentoService $pagamentoService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->criarEstadoReserva('pendente');
        $this->criarEstadoReserva('confirmada');

        $this->pagamentoService = app(PagamentoService::class);
    }

    /**
     * Cria uma reserva válida para os testes dos pagamentos.
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
     * Define os preços utilizados para calcular o pagamento.
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
    private function criarPagamento(
        User $user,
        ?Secretaria $secretaria = null,
        ?Periodo $periodo = null,
        ?string $data = null,
    ): Pagamento {
        $secretaria ??= $this->criarSecretaria();
        $periodo ??= $this->criarPeriodo();

        $this->definirPrecos($secretaria);

        $reserva = $this->criarReserva(
            $user,
            $secretaria,
            $periodo,
            $data
        );

        return $this->pagamentoService
            ->criarParaReserva($reserva);
    }

    public function test_utilizador_consegue_listar_os_proprios_pagamentos(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);

        $response = $this->actingAs($user)->get(
            route('pagamentos.index')
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where('isAdmin', false)
                ->where('pagamentos.total', 1)
                ->has('pagamentos.data', 1)
                ->where(
                    'pagamentos.data.0.id',
                    $pagamento->id
                )
                ->where(
                    'pagamentos.data.0.reserva.user_id',
                    $user->id
                )
        );
    }

    public function test_utilizador_nao_ve_pagamentos_de_outros_utilizadores(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $outroUser = $this->criarUsuarioComRole('Utilizador');

        $pagamentoDoUser = $this->criarPagamento(
            $user,
            data: Carbon::tomorrow()->format('Y-m-d')
        );

        $pagamentoDoOutro = $this->criarPagamento(
            $outroUser,
            data: Carbon::tomorrow()->addDay()->format('Y-m-d')
        );

        $response = $this->actingAs($user)->get(
            route('pagamentos.index')
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where('isAdmin', false)
                ->where('pagamentos.total', 1)
                ->has('pagamentos.data', 1)
                ->where(
                    'pagamentos.data.0.id',
                    $pagamentoDoUser->id
                )
        );

        $idsApresentados = collect(
            $response->inertiaProps('pagamentos.data')
        )->pluck('id');

        $this->assertTrue(
            $idsApresentados->contains($pagamentoDoUser->id)
        );

        $this->assertFalse(
            $idsApresentados->contains($pagamentoDoOutro->id)
        );
    }

    public function test_administrador_consegue_listar_todos_os_pagamentos(): void
    {
        $admin = $this->criarUsuarioComRole('Administrador');
        $primeiroUser = $this->criarUsuarioComRole('Utilizador');
        $segundoUser = $this->criarUsuarioComRole('Utilizador');

        $primeiroPagamento = $this->criarPagamento(
            $primeiroUser,
            data: Carbon::tomorrow()->format('Y-m-d')
        );

        $segundoPagamento = $this->criarPagamento(
            $segundoUser,
            data: Carbon::tomorrow()->addDay()->format('Y-m-d')
        );

        $response = $this->actingAs($admin)->get(
            route('pagamentos.index')
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where('isAdmin', true)
                ->where('pagamentos.total', 2)
                ->has('pagamentos.data', 2)
        );

        $idsApresentados = collect(
            $response->inertiaProps('pagamentos.data')
        )->pluck('id');

        $this->assertTrue(
            $idsApresentados->contains($primeiroPagamento->id)
        );

        $this->assertTrue(
            $idsApresentados->contains($segundoPagamento->id)
        );
    }

    public function test_lista_de_pagamentos_e_paginada(): void
    {
        $admin = $this->criarUsuarioComRole('Administrador');
        $periodo = $this->criarPeriodo();

        for ($i = 1; $i <= 12; $i++) {
            $user = $this->criarUsuarioComRole('Utilizador');
            $secretaria = $this->criarSecretaria();

            $this->criarPagamento(
                $user,
                $secretaria,
                $periodo,
                Carbon::tomorrow()
                    ->addDays($i)
                    ->format('Y-m-d')
            );
        }

        $response = $this->actingAs($admin)->get(
            route('pagamentos.index')
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where('pagamentos.total', 12)
                ->where('pagamentos.per_page', 10)
                ->has('pagamentos.data', 10)
        );
    }

    public function test_utilizador_consegue_filtrar_pagamentos_por_estado(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamentoPendente = $this->criarPagamento(
            $user,
            data: Carbon::tomorrow()->format('Y-m-d')
        );

        $pagamentoPago = $this->criarPagamento(
            $user,
            data: Carbon::tomorrow()->addDay()->format('Y-m-d')
        );

        $this->pagamentoService->confirmarPagamento(
            $pagamentoPago,
            'cartao'
        );

        $response = $this->actingAs($user)->get(
            route('pagamentos.index', [
                'estado' => 'pendente',
            ])
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where('filters.estado', 'pendente')
                ->where('pagamentos.total', 1)
                ->has('pagamentos.data', 1)
                ->where(
                    'pagamentos.data.0.id',
                    $pagamentoPendente->id
                )
                ->where(
                    'pagamentos.data.0.estado',
                    'pendente'
                )
        );
    }

    public function test_utilizador_consegue_filtrar_pagamentos_por_metodo(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamentoCartao = $this->criarPagamento(
            $user,
            data: Carbon::tomorrow()->format('Y-m-d')
        );

        $pagamentoMbway = $this->criarPagamento(
            $user,
            data: Carbon::tomorrow()->addDay()->format('Y-m-d')
        );

        $this->pagamentoService->confirmarPagamento(
            $pagamentoCartao,
            'cartao'
        );

        $this->pagamentoService->confirmarPagamento(
            $pagamentoMbway,
            'mbway'
        );

        $response = $this->actingAs($user)->get(
            route('pagamentos.index', [
                'metodo_pagamento' => 'mbway',
            ])
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Index')
                ->where(
                    'filters.metodo_pagamento',
                    'mbway'
                )
                ->where('pagamentos.total', 1)
                ->has('pagamentos.data', 1)
                ->where(
                    'pagamentos.data.0.id',
                    $pagamentoMbway->id
                )
                ->where(
                    'pagamentos.data.0.metodo_pagamento',
                    'mbway'
                )
        );
    }

    public function test_utilizador_consegue_ver_detalhe_do_proprio_pagamento(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);

        $response = $this->actingAs($user)->get(
            route('pagamentos.show', $pagamento)
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Show')
                ->where('pagamento.id', $pagamento->id)
                ->where(
                    'pagamento.reserva_id',
                    $pagamento->reserva_id
                )
                ->where(
                    'pagamento.estado',
                    'pendente'
                )
                ->where(
                    'pagamento.reserva.user_id',
                    $user->id
                )
        );
    }

    public function test_utilizador_nao_consegue_ver_pagamento_de_outro_utilizador(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outroUser = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($dono);

        $response = $this->actingAs($outroUser)->get(
            route('pagamentos.show', $pagamento)
        );

        $response->assertForbidden();
    }

    public function test_administrador_consegue_ver_pagamento_de_outro_utilizador(): void
    {
        $admin = $this->criarUsuarioComRole('Administrador');
        $dono = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($dono);

        $response = $this->actingAs($admin)->get(
            route('pagamentos.show', $pagamento)
        );

        $response->assertOk();

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Pagamentos/Show')
                ->where('pagamento.id', $pagamento->id)
        );
    }

    public function test_utilizador_consegue_confirmar_o_proprio_pagamento(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);
        $response = $this->actingAs($user)->patch(
            route('pagamentos.confirmar', $pagamento),
            [
                'metodo_pagamento' => 'mbway',
                'telefone_mbway' => '912345678',
            ]
        );

        $response->assertRedirect(
            route('pagamentos.show', $pagamento)
        );

        $response->assertSessionHas(
            'success',
            'Pagamento confirmado com sucesso.'
        );

        $pagamento->refresh();

        $this->assertSame(
            'pago',
            $pagamento->estado
        );

        $this->assertSame(
            'mbway',
            $pagamento->metodo_pagamento
        );

        $this->assertNotNull(
            $pagamento->data_pagamento
        );

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'estado' => 'pago',
            'metodo_pagamento' => 'mbway',
        ]);
    }

    public function test_utilizador_nao_consegue_confirmar_pagamento_de_outro_utilizador(): void
    {
        $dono = $this->criarUsuarioComRole('Utilizador');
        $outroUser = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($dono);

        $response = $this->actingAs($outroUser)->patch(
            route('pagamentos.confirmar', $pagamento),
            [
                'metodo_pagamento' => 'cartao',
            ]
        );

        $response->assertForbidden();

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

    public function test_confirmacao_exige_metodo_de_pagamento(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);

        $response = $this
            ->actingAs($user)
            ->from(route('pagamentos.show', $pagamento))
            ->patch(
                route('pagamentos.confirmar', $pagamento),
                []
            );

        $response->assertRedirect(
            route('pagamentos.show', $pagamento)
        );

        $response->assertSessionHasErrors(
            'metodo_pagamento'
        );

        $pagamento->refresh();

        $this->assertSame(
            'pendente',
            $pagamento->estado
        );

        $this->assertNull(
            $pagamento->metodo_pagamento
        );
    }

    public function test_confirmacao_rejeita_metodo_de_pagamento_invalido(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);

        $response = $this
            ->actingAs($user)
            ->from(route('pagamentos.show', $pagamento))
            ->patch(
                route('pagamentos.confirmar', $pagamento),
                [
                    'metodo_pagamento' => 'dinheiro',
                ]
            );

        $response->assertRedirect(
            route('pagamentos.show', $pagamento)
        );

        $response->assertSessionHasErrors(
            'metodo_pagamento'
        );

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

    public function test_utilizador_nao_consegue_confirmar_pagamento_ja_pago(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $pagamento = $this->criarPagamento($user);

        $this->pagamentoService->confirmarPagamento(
            $pagamento,
            'cartao'
        );

        $response = $this->actingAs($user)->patch(
            route('pagamentos.confirmar', $pagamento),
            [
                'metodo_pagamento' => 'mbway',
            ]
        );

        $response->assertForbidden();

        $pagamento->refresh();

        $this->assertSame(
            'pago',
            $pagamento->estado
        );

        $this->assertSame(
            'cartao',
            $pagamento->metodo_pagamento
        );
    }
}
