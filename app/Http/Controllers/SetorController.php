<?php

namespace App\Http\Controllers;

use App\Models\Setor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SetorController extends Controller
{
    public function index()
    {
        $setores = Setor::with('piso')->get();
        return response()->json($setores, 200);
    }

    public function store(Request $request)
    {
        $tiposValidos = [
            'coworking', 'reuniao', 'rececao', 'cafetaria', 'lounge',
            'estacionamento', 'concentracao', 'phone_booth', 'sanitario',
            'tecnico', 'outro'
        ];

        $validated = $request->validate([
            'piso_id'    => 'required|exists:pisos,id',
            'nome'       => 'required|string|max:100',
            'tipo'       => ['required', Rule::in($tiposValidos)],
            'reservavel' => 'boolean',
            'capacidade' => 'nullable|integer|min:0',
            'descricao'  => 'nullable|string',
            'ativo'      => 'boolean',

            'codigo'     => [
                'required',
                'string',
                'max:20',
                Rule::unique('setores')->where(function ($query) use ($request) {
                    return $query->where('piso_id', $request->piso_id);
                }),
            ],
        ]);

        $setor = Setor::create($validated);

        return response()->json([
            'message' => 'Setor criado com sucesso!',
            'data'    => $setor
        ], 211);
    }

    public function update(Request $request, string $id)
    {
        $setor = Setor::find($id);

        if (!$setor) {
            return response()->json(['message' => 'Setor não encontrado.'], 404);
        }

        $tiposValidos = [
            'coworking', 'reuniao', 'rececao', 'cafetaria', 'lounge',
            'estacionamento', 'concentracao', 'phone_booth', 'sanitario',
            'tecnico', 'outro'
        ];

        $validated = $request->validate([
            'piso_id'    => 'sometimes|required|exists:pisos,id',
            'nome'       => 'sometimes|required|string|max:100',
            'tipo'       => ['sometimes', 'required', Rule::in($tiposValidos)],
            'reservavel' => 'sometimes|boolean',
            'capacidade' => 'nullable|integer|min:0',
            'descricao'  => 'nullable|string',
            'ativo'      => 'sometimes|boolean',

            'codigo'     => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('setores')->where(function ($query) use ($request, $setor) {
                    $pisoId = $request->piso_id ?? $setor->piso_id;
                    return $query->where('piso_id', $pisoId);
                })->ignore($id),
            ],
        ]);

        $setor->update($validated);

        return response()->json([
            'message' => 'Setor atualizado com sucesso!',
            'data'    => $setor
        ], 200);
    }

    public function destroy(string $id)
    {
        $setor = Setor::find($id);

        if (!$setor) {
            return response()->json(['message' => 'Setor não encontrado.'], 404);
        }

        $setor->delete();

        return response()->json([
            'message' => 'Setor eliminado com sucesso!'
        ], 200);
    }
}
