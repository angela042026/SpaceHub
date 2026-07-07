<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PisoController extends Controller
{
    public function index()
    {
        $pisos = Piso::with('edificio')->get();
        return response()->json($pisos, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'edificio_id' => 'required|exists:edificios,id', // Garante que o edifício existe na BD
            'nome'        => 'required|string|max:100',
            'numero'      => 'required|integer',
            'planta'      => 'nullable|string',
            'descricao'   => 'nullable|string',
            'ativo'       => 'boolean',

            'codigo'      => [
                'required',
                'string',
                'max:10',
                Rule::unique('pisos')->where(function ($query) use ($request) {
                    return $query->where('edificio_id', $request->edificio_id);
                }),
            ],
        ]);

        $piso = Piso::create($validated);

        return response()->json([
            'message' => 'Piso criado com sucesso!',
            'data'    => $piso
        ], 211); // 211 Created
    }

    public function update(Request $request, string $id)
    {
        $piso = Piso::find($id);

        if (!$piso) {
            return response()->json(['message' => 'Piso não encontrado.'], 404);
        }

        $validated = $request->validate([
            'edificio_id' => 'sometimes|required|exists:edificios,id',
            'nome'        => 'sometimes|required|string|max:100',
            'numero'      => 'sometimes|required|integer',
            'planta'      => 'nullable|string',
            'descricao'   => 'nullable|string',
            'ativo'       => 'sometimes|boolean',

            'codigo'      => [
                'sometimes',
                'required',
                'string',
                'max:10',
                Rule::unique('pisos')->where(function ($query) use ($request, $piso) {
                    $edificioId = $request->edificio_id ?? $piso->edificio_id;
                    return $query->where('edificio_id', $edificioId);
                })->ignore($id),
            ],
        ]);

        $piso->update($validated);

        return response()->json([
            'message' => 'Piso atualizado com sucesso!',
            'data'    => $piso
        ], 200);
    }

    public function destroy(string $id)
    {
        $piso = Piso::find($id);

        if (!$piso) {
            return response()->json(['message' => 'Piso não encontrado.'], 404);
        }

        $piso->delete();

        return response()->json([
            'message' => 'Piso eliminado com sucesso!'
        ], 200);
    }
}
