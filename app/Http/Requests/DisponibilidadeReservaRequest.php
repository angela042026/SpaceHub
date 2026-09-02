<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DisponibilidadeReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data' => [
                'required',
                'date',
            ],

            'periodo_id' => [
                'required',
                'exists:periodos,id',
            ],
        ];
    }
}
