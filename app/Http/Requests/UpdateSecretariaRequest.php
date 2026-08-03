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

            'setor_id' => [
                'sometimes',
                'required',
                'exists:setores,id',
            ],

            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('secretarias')
                    ->where(
                        fn ($query) => $query->where(
                            'setor_id',
                            $this->integer('setor_id')
                                ?: $secretaria->setor_id
                        )
                    )
                    ->ignore($secretaria),
            ],

            'planta_x' => [
                'sometimes',
                'nullable',
                'integer',
            ],

            'planta_y' => [
                'sometimes',
                'nullable',
                'integer',
            ],

            'angulo' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
                'max:360',
            ],

            /*
            |--------------------------------------------------------------------------
            | Características da Secretária
            |--------------------------------------------------------------------------
            */

            'monitor' => [
                'sometimes',
                'boolean',
            ],


            'dock_usb' => [
                'sometimes',
                'boolean',
            ],

            'hdmi' => [
                'sometimes',
                'boolean',
            ],

            'ergonomica' => [
                'sometimes',
                'boolean',
            ],

            'junto_janela' => [
                'sometimes',
                'boolean',
            ],

            'luz_natural' => [
                'sometimes',
                'boolean',
            ],

            'zona_silenciosa' => [
                'sometimes',
                'boolean',
            ],

            'proximo_copa' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Estado
            |--------------------------------------------------------------------------
            */

            'reservavel' => [
                'sometimes',
                'boolean',
            ],

            'descricao' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'imagem' => [
                'sometimes',
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'ativo' => [
                'prohibited',
            ],

            'qr_token' => [
                'prohibited',
            ],
        ];
    }
}