<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePisoRequest;
use App\Http\Requests\UpdatePisoRequest;
use App\Http\Resources\PisoResource;
use App\Models\Piso;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PisoController extends Controller
{
    /**
     * Lista pisos com pesquisa, filtros,
     * ordenação e paginação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Piso::class);

        $query = Piso::query()->with('edificio');

        /*
        |--------------------------------------------------------------------------
        | Pesquisa
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('nome', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhereHas(
                        'edificio',
                        function ($query) use ($search): void {
                            $query->where(
                                'nome',
                                'like',
                                "%{$search}%"
                            );
                        }
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        if ($request->filled('edificio_id')) {
            $query->where(
                'edificio_id',
                $request->integer('edificio_id')
            );
        }

        if ($request->has('ativo')) {
            $query->where(
                'ativo',
                $request->boolean('ativo')
            );
        }

        if ($request->filled('numero')) {
            $query->where(
                'numero',
                $request->integer('numero')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ordenação segura
        |--------------------------------------------------------------------------
        */

        $allowedSortFields = [
            'id',
            'edificio_id',
            'nome',
            'codigo',
            'numero',
            'ativo',
            'created_at',
            'updated_at',
        ];

        $sortBy = (string) $request->input('sort_by', 'numero');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'numero';
        }

        $sortDirection = strtolower(
            (string) $request->input('sort_direction', 'asc')
        );

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        /*
        |--------------------------------------------------------------------------
        | Paginação
        |--------------------------------------------------------------------------
        */

        $perPage = $request->integer('per_page', 15);
        $perPage = max(1, min($perPage, 100));

        $pisos = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return PisoResource::collection($pisos);
    }

    /**
     * Apresenta um piso.
     */
    public function show(Piso $piso): PisoResource
    {
        Gate::authorize('view', $piso);

        $piso->load('edificio');

        return new PisoResource($piso);
    }

    /**
     * Cria um piso.
     */
    public function store(StorePisoRequest $request)
    {
        Gate::authorize('create', Piso::class);

        $dados = $request->validated();
        $plantaGuardada = null;

        if ($request->hasFile('planta')) {
            $plantaGuardada = $request
                ->file('planta')
                ->store('pisos/plantas', 'public');

            $dados['planta'] = $plantaGuardada;
        }

        try {
            $piso = Piso::create($dados);
        } catch (Throwable $exception) {
            if ($plantaGuardada !== null) {
                Storage::disk('public')->delete($plantaGuardada);
            }

            throw $exception;
        }

        $piso->load('edificio');

        return (new PisoResource($piso))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Atualiza um piso.
     */
    public function update(
        UpdatePisoRequest $request,
        Piso $piso
    ): PisoResource {
        Gate::authorize('update', $piso);

        $dados = $request->validated();

        $plantaAntiga = $piso->planta;
        $novaPlanta = null;

        /*
         * Permite distinguir:
         * - campo planta não enviado: mantém a planta atual;
         * - nova planta enviada: substitui a anterior;
         * - planta enviada como null: remove a planta atual.
         */
        $campoPlantaEnviado = array_key_exists('planta', $dados);

        if ($request->hasFile('planta')) {
            $novaPlanta = $request
                ->file('planta')
                ->store('pisos/plantas', 'public');

            $dados['planta'] = $novaPlanta;
        }

        try {
            $piso->update($dados);
        } catch (Throwable $exception) {
            if ($novaPlanta !== null) {
                Storage::disk('public')->delete($novaPlanta);
            }

            throw $exception;
        }

        $deveApagarPlantaAntiga = $plantaAntiga !== null
            && $campoPlantaEnviado
            && $plantaAntiga !== $piso->planta;

        if ($deveApagarPlantaAntiga) {
            Storage::disk('public')->delete($plantaAntiga);
        }

        $piso->load('edificio');

        return new PisoResource($piso);
    }

    /**
     * Ativa ou desativa um piso.
     */
    public function toggleAtivo(Piso $piso): PisoResource
    {
        Gate::authorize('toggleAtivo', $piso);

        $piso->ativo = ! $piso->ativo;
        $piso->save();

        $piso->load('edificio');

        return new PisoResource($piso);
    }
}