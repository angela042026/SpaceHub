<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSecretariaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $secretaria = $this->route('secretaria');

        return [
            'setor_id' => ['sometimes', 'required', 'exists:setores,id'],
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('secretarias')->where(fn ($query) =>
                    $query->where('setor_id', $this->setor_id ?? $secretaria->setor_id)
                )->ignore($secretaria),
            ],
            'planta_x' => ['nullable', 'integer'],
            'planta_y' => ['nullable', 'integer'],
            'angulo' => ['nullable', 'numeric', 'min:0', 'max:360'],
            'monitor' => ['boolean'],
            'dock_usb' => ['boolean'],
            'junto_janela' => ['boolean'],
            'ergonomica' => ['boolean'],
            'reservavel' => ['boolean'],
            'ativo' => ['boolean'],
            'descricao' => ['nullable', 'string'],
        ];
    }
}