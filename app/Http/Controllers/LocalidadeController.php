<?php

namespace App\Http\Controllers;

use App\Models\Localidade;
use Illuminate\Http\Request;

class LocalidadeController extends Controller
{
    public function index()
    {
        $localidades = Localidade::all();
        return response()->json($localidades, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'codigo' => 'required|string|max:3|unique:localidades,codigo',
        ]);

        $localidade = Localidade::create($validated);

        return response()->json([
            'message' => 'Localidade criada com sucesso!',
            'data' => $localidade
        ], 211); // 211 Created
    }

    public function update(Request $request, string $id)
    {
        $localidade = Localidade::find($id);

        if (!$localidade) {
            return response()->json(['message' => 'Localidade não encontrada.'], 404);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'codigo' => 'sometimes|string|max:3|unique:localidades,codigo,' . $id,
        ]);

        $localidade->update($validated);

        return response()->json([
            'message' => 'Localidade atualizada com sucesso!',
            'data' => $localidade
        ], 200);
    }

    public function destroy(string $id)
    {
        $localidade = Localidade::find($id);

        if (!$localidade) {
            return response()->json(['message' => 'Localidade não encontrada.'], 404);
        }

        $localidade->delete();

        return response()->json([
            'message' => 'Localidade eliminada com sucesso!'
        ], 200);
    }
}
