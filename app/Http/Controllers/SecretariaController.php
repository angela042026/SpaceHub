<?php

namespace App\Http\Controllers;

use App\Models\Secretaria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SecretariaController extends Controller
{
    public function index()
    {
        $secretarias = Secretaria::with('setor')->get();
        return response()->json($secretarias, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'setor_id'     => 'required|exists:setores,id',
            'planta_x'     => 'nullable|integer',
            'planta_y'     => 'nullable|integer',
            'angulo'       => 'nullable|numeric|between:-360,360',
            'monitor'      => 'boolean',
            'dock_usb'     => 'boolean',
            'junto_janela' => 'boolean',
            'ergonomica'   => 'boolean',
            'reservavel'   => 'boolean',
            'ativo'        => 'boolean',
            'descricao'    => 'nullable|string',

            'codigo'       => [
                'required',
                'string',
                'max:20',
                Rule::unique('secretarias')->where(function ($query) use ($request) {
                    return $query->where('setor_id', $request->setor_id);
                }),
            ],
        ]);

        $secretaria = Secretaria::create($validated);

        return response()->json([
            'message' => 'Secretária criada com sucesso!',
            'data'    => $secretaria
        ], 211);
    }

    public function update(Request $request, string $id)
    {
        $secretaria = Secretaria::find($id);

        if (!$secretaria) {
            return response()->json(['message' => 'Secretária não encontrada.'], 404);
        }

        $validated = $request->validate([
            'setor_id'     => 'sometimes|required|exists:setores,id',
            'planta_x'     => 'nullable|integer',
            'planta_y'     => 'nullable|integer',
            'angulo'       => 'nullable|numeric|between:-360,360',
            'monitor'      => 'sometimes|boolean',
            'dock_usb'     => 'sometimes|boolean',
            'junto_janela' => 'sometimes|boolean',
            'ergonomica'   => 'sometimes|boolean',
            'reservavel'   => 'sometimes|boolean',
            'ativo'        => 'sometimes|boolean',
            'descricao'    => 'nullable|string',

            'codigo'       => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('secretarias')->where(function ($query) use ($request, $secretaria) {
                    $setorId = $request->setor_id ?? $secretaria->setor_id;
                    return $query->where('setor_id', $setorId);
                })->ignore($id),
            ],
        ]);

        $secretaria->update($validated);

        return response()->json([
            'message' => 'Secretária atualizada com sucesso!',
            'data'    => $secretaria
        ], 200);
    }

    public function destroy(string $id)
    {
        $secretaria = Secretaria::find($id);

        if (!$secretaria) {
            return response()->json(['message' => 'Secretária não encontrada.'], 404);
        }

        $secretaria->delete();

        return response()->json([
            'message' => 'Secretária eliminada com sucesso!'
        ], 200);
    }
}
