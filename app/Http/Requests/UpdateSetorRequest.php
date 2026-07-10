<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSetorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $setor = $this->route('setor');

        return [
            'piso_id' => ['sometimes', 'required', 'exists:pisos,id'],
            'nome' => ['sometimes', 'required', 'string', 'max:100'],
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('setores')->where(fn ($query) =>
                    $query->where('piso_id', $this->piso_id ?? $setor->piso_id)
                )->ignore($setor),
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