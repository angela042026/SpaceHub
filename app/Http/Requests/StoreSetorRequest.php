<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSetorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'piso_id' => ['required', 'exists:pisos,id'],
            'nome' => ['required', 'string', 'max:100'],
            'codigo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('setores')->where(fn ($query) =>
                    $query->where('piso_id', $this->piso_id)
                ),
            ],
            'tipo' => ['nullable', Rule::in([
                'coworking',
                'reuniao',
                'rececao',
                'cafetaria',
                'lounge',
                'estacionamento',
                'concentracao',
                'phone_booth',
                'wc',
                'tecnico',
                'outro',
            ])],
            'reservavel' => ['boolean'],
            'capacidade' => ['nullable', 'integer', 'min:0'],
            'descricao' => ['nullable', 'string'],
            'ativo' => ['boolean'],
        ];
    }
}