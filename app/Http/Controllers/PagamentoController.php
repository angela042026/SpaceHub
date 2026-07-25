<?php

namespace App\Http\Controllers;

use App\Models\Pagamento;
use App\Services\PagamentoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PagamentoController extends Controller
{
    private PagamentoService $pagamentoService;

    public function __construct(PagamentoService $pagamentoService)
    {
        $this->pagamentoService = $pagamentoService;
    }

    /**
     * Lista os pagamentos do utilizador autenticado.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Pagamento::class);

        $user = Auth::user();

        $query = Pagamento::query()
            ->with([
                'reserva.user',
                'reserva.periodo',
                'reserva.secretaria.setor',
            ]);

        /*
         * O administrador vê todos os pagamentos.
         * Os restantes utilizadores veem apenas os próprios.
         */
        if ($user->role?->nome !== 'Administrador') {
            $query->whereHas('reserva', function ($query) use ($user): void {
                $query->where('user_id', $user->id);
            });
        }

        if ($request->filled('estado')) {
            $query->where(
                'estado',
                $request->input('estado')
            );
        }

        if ($request->filled('metodo_pagamento')) {
            $query->where(
                'metodo_pagamento',
                $request->input('metodo_pagamento')
            );
        }

        $pagamentos = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Pagamentos/Index', [
            'pagamentos' => $pagamentos,

            'filters' => $request->only([
                'estado',
                'metodo_pagamento',
            ]),

            'isAdmin' => $user->role?->nome === 'Administrador',
        ]);
    }

    /**
     * Apresenta o detalhe de um pagamento.
     */
    public function show(Pagamento $pagamento): Response
    {
        Gate::authorize('view', $pagamento);

        $pagamento->load([
            'reserva.periodo',
            'reserva.secretaria.setor',
        ]);

        return Inertia::render('Pagamentos/Show', [
            'pagamento' => $pagamento,
        ]);
    }

    /**
     * Apresenta a página onde o utilizador efetua o pagamento.
     */
    public function pagar(Pagamento $pagamento): Response
    {
        Gate::authorize('confirmar', $pagamento);

        /*
         * Um pagamento só pode ser efetuado enquanto estiver pendente.
         */
        if ($pagamento->estado !== 'pendente') {
            abort(
                403,
                'Este pagamento já não se encontra pendente.'
            );
        }

        $pagamento->load([
            'reserva.periodo',
            'reserva.secretaria.setor',
        ]);

        return Inertia::render('Pagamentos/Pagar', [
            'pagamento' => $pagamento,
        ]);
    }

    /**
     * Confirma um pagamento simulado.
     */
    public function confirmar(
        Request $request,
        Pagamento $pagamento
    ): RedirectResponse {
        Gate::authorize('confirmar', $pagamento);

        $dados = $request->validate([
            'metodo_pagamento' => [
                'required',
                Rule::in([
                    'cartao',
                    'mbway',
                    'transferencia',
                    'paypal',
                ]),
            ],

            /*
             * Dados do cartão.
             *
             * Estes dados são apenas validados e não são guardados
             * na base de dados.
             */
            'nome_titular' => [
                'required_if:metodo_pagamento,cartao',
                'nullable',
                'string',
                'min:3',
                'max:100',
            ],

            'numero_cartao' => [
                'required_if:metodo_pagamento,cartao',
                'nullable',
                'regex:/^[0-9]{16}$/',
            ],

            'validade_cartao' => [
                'required_if:metodo_pagamento,cartao',
                'nullable',
                'regex:/^(0[1-9]|1[0-2])\/[0-9]{2}$/',
            ],

            'cvv' => [
                'required_if:metodo_pagamento,cartao',
                'nullable',
                'regex:/^[0-9]{3,4}$/',
            ],

            /*
             * Dados do MB Way.
             */
            'telefone_mbway' => [
                'required_if:metodo_pagamento,mbway',
                'nullable',
                'regex:/^9[0-9]{8}$/',
            ],

            /*
         'confirmacao_transferencia' => [
    'exclude_unless:metodo_pagamento,transferencia',
    'required',
    'accepted',
],
            /*
             * Dados do PayPal.
             */
            'email_paypal' => [
                'required_if:metodo_pagamento,paypal',
                'nullable',
                'email',
                'max:255',
            ],
        ], [
            'metodo_pagamento.required' =>
            'Seleciona um método de pagamento.',

            'metodo_pagamento.in' =>
            'O método de pagamento selecionado não é válido.',

            'nome_titular.required_if' =>
            'Indica o nome do titular do cartão.',

            'nome_titular.min' =>
            'O nome do titular deve ter pelo menos 3 caracteres.',

            'numero_cartao.required_if' =>
            'Indica o número do cartão.',

            'numero_cartao.regex' =>
            'O número do cartão deve conter exatamente 16 algarismos.',

            'validade_cartao.required_if' =>
            'Indica a validade do cartão.',

            'validade_cartao.regex' =>
            'A validade deve estar no formato MM/AA.',

            'cvv.required_if' =>
            'Indica o código de segurança do cartão.',

            'cvv.regex' =>
            'O CVV deve conter 3 ou 4 algarismos.',

            'telefone_mbway.required_if' =>
            'Indica o número de telemóvel associado ao MB Way.',

            'telefone_mbway.regex' =>
            'Introduz um número de telemóvel português válido.',

            'confirmacao_transferencia.required_if' =>
            'Confirma que compreendeste as instruções da transferência.',

            'confirmacao_transferencia.accepted' =>
            'É necessário confirmar as instruções da transferência.',

            'email_paypal.required_if' =>
            'Indica o email associado à conta PayPal.',

            'email_paypal.email' =>
            'Introduz um endereço de email válido.',
        ]);

        /*
         * Apenas o método de pagamento é enviado para o serviço.
         *
         * Os dados do cartão, CVV, telefone e email são usados
         * exclusivamente para validar a simulação e não são guardados.
         */
        $this->pagamentoService->confirmarPagamento(
            $pagamento,
            $dados['metodo_pagamento']
        );

        return redirect()
            ->route('pagamentos.show', $pagamento)
            ->with(
                'success',
                'Pagamento confirmado com sucesso.'
            );
    }
    public function comprovativo(Pagamento $pagamento): Response
    {
        Gate::authorize('view', $pagamento);

        if ($pagamento->estado !== 'pago') {
            abort(
                403,
                'O comprovativo só está disponível para pagamentos concluídos.'
            );
        }

        $pagamento->load([
            'reserva.user',
            'reserva.periodo',
            'reserva.secretaria.setor.piso.edificio',
        ]);

        return Inertia::render('Pagamentos/Comprovativo', [
            'pagamento' => $pagamento,
        ]);
    }
}
