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
            'piso_id' => [
                'required',
                'integer',
                'exists:pisos,id',
            ],

            'nome' => [
                'required',
                'string',
                'max:100',
            ],

            'codigo' => [
                'required',
                'string',
                'max:20',
                Rule::unique('setores')->where(
                    fn ($query) => $query->where(
                        'piso_id',
                        $this->integer('piso_id')
                    )
                ),
            ],

            'tipo' => [
                'nullable',
                Rule::in([
                    'open_space',
                    'escritorio',
                    'escritorio_executivo',
                    'sala_reunioes',
                    'sala_criativa',
                    'phone_booth',
                    'rececao',
                    'copa',
                    'lounge',
                    'sala_espera',
                    'wc',
                    'estacionamento',
                    'tecnico',
                    'outro',
                ]),
            ],

            'reservavel' => [
                'sometimes',
                'boolean',
            ],

            'capacidade' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'descricao' => [
                'nullable',
                'string',
            ],
        ];
    }
}