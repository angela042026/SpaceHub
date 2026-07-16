<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSetorRequest;
use App\Http\Requests\UpdateSetorRequest;
use App\Http\Resources\SetorResource;
use App\Models\Setor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SetorController extends Controller
{
    /**
     * Lista setores com pesquisa, filtros,
     * ordenação e paginação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Setor::class);

        $query = Setor::query()
            ->with('piso.edificio');

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
                    ->orWhere('tipo', 'like', "%{$search}%")
                    ->orWhereHas('piso', function ($query) use ($search): void {
                        $query
                            ->where('nome', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    })
                    ->orWhereHas(
                        'piso.edificio',
                        function ($query) use ($search): void {
                            $query
                                ->where('nome', 'like', "%{$search}%")
                                ->orWhere('codigo', 'like', "%{$search}%");
                        }
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        if ($request->filled('piso_id')) {
            $query->where(
                'piso_id',
                $request->integer('piso_id')
            );
        }

        if ($request->filled('tipo')) {
            $query->where(
                'tipo',
                (string) $request->input('tipo')
            );
        }

        if ($request->has('reservavel')) {
            $query->where(
                'reservavel',
                $request->boolean('reservavel')
            );
        }

        if ($request->has('ativo')) {
            $query->where(
                'ativo',
                $request->boolean('ativo')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Ordenação segura
        |--------------------------------------------------------------------------
        */

        $allowedSortFields = [
            'id',
            'piso_id',
            'nome',
            'codigo',
            'tipo',
            'reservavel',
            'capacidade',
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

        $setores = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return SetorResource::collection($setores);
    }

    /**
     * Apresenta um setor.
     */
    public function show(Setor $setor): SetorResource
    {
        Gate::authorize('view', $setor);

        $setor->load('piso.edificio');

        return new SetorResource($setor);
    }

    /**
     * Cria um setor.
     */
    public function store(StoreSetorRequest $request)
    {
        Gate::authorize('create', Setor::class);

        $setor = Setor::create(
            $request->validated()
        );

        $setor->load('piso.edificio');

        return (new SetorResource($setor))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Atualiza um setor.
     */
    public function update(
        UpdateSetorRequest $request,
        Setor $setor
    ): SetorResource {
        Gate::authorize('update', $setor);

        $setor->update(
            $request->validated()
        );

        $setor->load('piso.edificio');

        return new SetorResource($setor);
    }

    /**
     * Ativa ou desativa um setor.
     */
    public function toggleAtivo(Setor $setor): SetorResource
    {
        Gate::authorize('toggleAtivo', $setor);

        $setor->ativo = ! $setor->ativo;
        $setor->save();

        $setor->load('piso.edificio');

        return new SetorResource($setor);
    }
}