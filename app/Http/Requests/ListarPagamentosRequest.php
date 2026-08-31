<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListarPagamentosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => [
                'sometimes',
                'string',
                Rule::in(['pendente', 'pago', 'recusado', 'reembolsado', 'cancelado']),
            ],
            'metodo_pagamento' => [
                'sometimes',
                'string',
                Rule::in(['cartao', 'mbway', 'transferencia', 'paypal']),
            ],
            'busca' => ['sometimes', 'nullable', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
