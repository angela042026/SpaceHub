<?php

namespace App\Http\Controllers;

use App\Models\Secretaria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SecretariaController extends Controller
{
    public function index(Request $request)
    {
        $query = Secretaria::with('setor.piso');

    // Filtro por Monitor
    if ($request->has('monitor')) {
        $query->where('monitor', $request->boolean('monitor'));
    }

    // Filtro por Dock USB
    if ($request->has('dock_usb')) {
        $query->where('dock_usb', $request->boolean('dock_usb'));
    }

    // Filtro por Junto à Janela
    if ($request->has('junto_janela')) {
        $query->where('junto_janela', $request->boolean('junto_janela'));
    }

    // Filtro por Cadeira Ergonómica
    if ($request->has('ergonomica')) {
        $query->where('ergonomica', $request->boolean('ergonomica'));
    }

    // Filtro por Ativo (se o admin quiser ver apenas as operacionais)
    if ($request->has('ativo')) {
        $query->where('ativo', $request->boolean('ativo'));
    }

    // Filtro por Setor Específico (caso o user selecione no dropdown)
    if ($request->has('setor_id')) {
        $query->where('setor_id', $request->integer('setor_id'));
    }

    // Executa a query com todos os filtros aplicados de forma cumulativa
    $secretarias = $query->get();

    return response()->json($secretarias, 200);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'setor_id' => 'required|exists:setores,id',
            'planta_x' => 'nullable|integer',
            'planta_y' => 'nullable|integer',
            'angulo' => 'nullable|numeric|between:-360,360',
            'monitor' => 'boolean',
            'dock_usb' => 'boolean',
            'junto_janela' => 'boolean',
            'ergonomica' => 'boolean',
            'reservavel' => 'boolean',
            'ativo' => 'boolean',
            'descricao' => 'nullable|string',

            'codigo' => [
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
            'data' => $secretaria
        ], 211);
    }

    public function update(Request $request, string $id)
    {
        $secretaria = Secretaria::find($id);

        if (!$secretaria) {
            return response()->json(['message' => 'Secretária não encontrada.'], 404);
        }

        $validated = $request->validate([
            'setor_id' => 'sometimes|required|exists:setores,id',
            'planta_x' => 'nullable|integer',
            'planta_y' => 'nullable|integer',
            'angulo' => 'nullable|numeric|between:-360,360',
            'monitor' => 'sometimes|boolean',
            'dock_usb' => 'sometimes|boolean',
            'junto_janela' => 'sometimes|boolean',
            'ergonomica' => 'sometimes|boolean',
            'reservavel' => 'sometimes|boolean',
            'ativo' => 'sometimes|boolean',
            'descricao' => 'nullable|string',

            'codigo' => [
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
            'data' => $secretaria
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
