<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmarPagamentoRequest extends FormRequest
{
    /**
     * A autorização é efetuada através da PagamentoPolicy.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Regras de validação.
     */
    public function rules(): array
    {
        return [
            'metodo_pagamento' => [
                'required',
                'string',
                Rule::in([
                    'cartao',
                    'mbway',
                    'transferencia',
                    'paypal',
                ]),
            ],
        ];
    }

    /**
     * Mensagens de validação.
     */
    public function messages(): array
    {
        return [
            'metodo_pagamento.required' =>
                __('Seleciona um método de pagamento.'),

            'metodo_pagamento.in' =>
                __('O método de pagamento selecionado não é válido.'),
        ];
    }
}