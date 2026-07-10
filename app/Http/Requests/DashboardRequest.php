<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'periodo' => [
                'nullable',
                'string',
                Rule::in(['geral', 'semana', 'mes']),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'periodo.in' => 'O período selecionado é inválido.',
        ];
    }
}