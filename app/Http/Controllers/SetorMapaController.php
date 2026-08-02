<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use App\Models\Secretaria;
use App\Models\Setor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SetorMapaController extends Controller
{
    /**
     * Editor visual de posições das zonas/setores e das secretárias na planta de cada piso.
     *
     * Sem um Setor específico para autorizar contra, reutiliza a
     * ability `create` do SetorPolicy — já restrita a Administrador
     * (via before()) ou Gestor — em vez de reimplementar a mesma regra
     * num helper próprio.
     */
    public function edit(): Response
    {
        Gate::authorize('create', Setor::class);

        $pisos = Piso::where('ativo', true)
            ->with(['setores' => fn ($query) => $query->where('ativo', true)
                ->orderBy('id')
                ->with(['secretarias' => fn ($query) => $query->where('ativo', true)->orderBy('codigo')])])
            ->orderBy('numero')
            ->get()
            ->map(fn ($piso) => [
                'id' => $piso->id,
                'nome' => $piso->nome,
                'codigo' => $piso->codigo,
                'planta' => $piso->planta,
                'setores' => $piso->setores->values()->map(fn ($setor, $indice) => [
                    'id' => $setor->id,
                    'numero' => $indice + 1,
                    'nome' => $setor->nome,
                    'codigo' => $setor->codigo,
                    'planta_x' => $setor->planta_x,
                    'planta_y' => $setor->planta_y,
                    'secretarias' => $setor->secretarias->values()->map(fn ($secretaria, $indice) => [
                        'id' => $secretaria->id,
                        'numero' => $indice + 1,
                        'codigo' => $secretaria->codigo,
                        'planta_x' => $secretaria->planta_x,
                        'planta_y' => $secretaria->planta_y,
                    ]),
                ]),
            ]);

        return Inertia::render('Secretarias/MapaEditor', ['pisos' => $pisos]);
    }

    /**
     * Atualiza a posição (%) de um setor na planta. Chamado via fetch a partir do editor.
     */
    public function atualizarPosicao(Request $request, Setor $setor): JsonResponse
    {
        Gate::authorize('update', $setor);

        $dados = $request->validate([
            'planta_x' => ['required', 'integer', 'min:0', 'max:100'],
            'planta_y' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $setor->update($dados);

        return response()->json(['ok' => true, 'setor' => $setor->only(['id', 'planta_x', 'planta_y'])]);
    }

    /**
     * Atualiza a posição (%) de uma secretária individual na planta.
     */
    public function atualizarPosicaoSecretaria(Request $request, Secretaria $secretaria): JsonResponse
    {
        Gate::authorize('update', $secretaria);

        $dados = $request->validate([
            'planta_x' => ['required', 'integer', 'min:0', 'max:100'],
            'planta_y' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $secretaria->update($dados);

        return response()->json(['ok' => true, 'secretaria' => $secretaria->only(['id', 'planta_x', 'planta_y'])]);
    }
}
