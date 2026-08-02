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
            'piso_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:pisos,id',
            ],

            'nome' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('setores')
                    ->where(
                        fn ($query) => $query->where(
                            'piso_id',
                            $this->integer('piso_id')
                                ?: $setor->piso_id
                        )
                    )
                    ->ignore($setor),
            ],

            'tipo' => [
                'sometimes',
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
                'sometimes',
                'nullable',
                'integer',
                'min:0',
            ],

            'descricao' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ];
    }
}