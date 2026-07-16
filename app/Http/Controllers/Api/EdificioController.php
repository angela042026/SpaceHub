<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdificioRequest;
use App\Http\Requests\UpdateEdificioRequest;
use App\Http\Resources\EdificioResource;
use App\Models\Edificio;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class EdificioController extends Controller
{
    /**
     * Lista edifícios com pesquisa, filtros,
     * ordenação e paginação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Edificio::class);

        $query = Edificio::query();

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
                    ->orWhere('morada', 'like', "%{$search}%")
                    ->orWhere('cidade', 'like', "%{$search}%")
                    ->orWhere('pais', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        if ($request->has('ativo')) {
            $query->where(
                'ativo',
                $request->boolean('ativo')
            );
        }

        if ($request->filled('cidade')) {
            $query->where(
                'cidade',
                (string) $request->input('cidade')
            );
        }

        if ($request->filled('pais')) {
            $query->where(
                'pais',
                (string) $request->input('pais')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ordenação segura
        |--------------------------------------------------------------------------
        */

        $allowedSortFields = [
            'id',
            'nome',
            'codigo',
            'cidade',
            'pais',
            'ativo',
            'created_at',
            'updated_at',
        ];

        $sortBy = (string) $request->input('sort_by', 'nome');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'nome';
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

        $edificios = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return EdificioResource::collection($edificios);
    }

    /**
     * Apresenta um edifício.
     */
    public function show(Edificio $edificio): EdificioResource
    {
        Gate::authorize('view', $edificio);

        return new EdificioResource($edificio);
    }

    /**
     * Cria um edifício.
     */
    public function store(
        StoreEdificioRequest $request
    ): EdificioResource {
        Gate::authorize('create', Edificio::class);

        $edificio = Edificio::create(
            $request->validated()
        );

        return new EdificioResource($edificio);
    }

    /**
     * Atualiza um edifício.
     */
    public function update(
        UpdateEdificioRequest $request,
        Edificio $edificio
    ): EdificioResource {
        Gate::authorize('update', $edificio);

        $edificio->update(
            $request->validated()
        );

        return new EdificioResource($edificio);
    }

    /**
     * Ativa ou desativa um edifício.
     */
    public function toggleAtivo(
        Edificio $edificio
    ): EdificioResource {
        Gate::authorize('toggleAtivo', $edificio);

        $edificio->ativo = ! $edificio->ativo;
        $edificio->save();

        return new EdificioResource($edificio);
    }
}