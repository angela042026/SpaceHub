<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSecretariaRequest;
use App\Http\Requests\UpdateSecretariaRequest;
use App\Http\Resources\SecretariaResource;
use App\Models\Secretaria;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SecretariaController extends Controller
{
    /**
     * Lista secretárias com pesquisa, filtros,
     * ordenação e paginação.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Secretaria::class);

        $query = Secretaria::query()
            ->with('setor.piso.edificio');

        /*
        |--------------------------------------------------------------------------
        | Pesquisa
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('codigo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%")
                    ->orWhereHas('setor', function ($query) use ($search): void {
                        $query
                            ->where('nome', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    })
                    ->orWhereHas('setor.piso', function ($query) use ($search): void {
                        $query
                            ->where('nome', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    })
                    ->orWhereHas('setor.piso.edificio', function ($query) use ($search): void {
                        $query
                            ->where('nome', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%");
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtros
        |--------------------------------------------------------------------------
        */

        if ($request->filled('setor_id')) {
            $query->where(
                'setor_id',
                $request->integer('setor_id')
            );
        }

        if ($request->has('monitor')) {
            $query->where('monitor', $request->boolean('monitor'));
        }

        if ($request->has('dock_usb')) {
            $query->where('dock_usb', $request->boolean('dock_usb'));
        }

        if ($request->has('junto_janela')) {
            $query->where('junto_janela', $request->boolean('junto_janela'));
        }

        if ($request->has('ergonomica')) {
            $query->where('ergonomica', $request->boolean('ergonomica'));
        }

        if ($request->has('reservavel')) {
            $query->where('reservavel', $request->boolean('reservavel'));
        }

        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        /*
        |--------------------------------------------------------------------------
        | Ordenação segura
        |--------------------------------------------------------------------------
        */

        $allowedSortFields = [
            'id',
            'setor_id',
            'codigo',
            'monitor',
            'dock_usb',
            'junto_janela',
            'ergonomica',
            'reservavel',
            'ativo',
            'created_at',
            'updated_at',
        ];

        $sortBy = (string) $request->input('sort_by', 'codigo');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'codigo';
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

        $secretarias = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return SecretariaResource::collection($secretarias);
    }

    /**
     * Mostra uma secretária.
     */
    public function show(Secretaria $secretaria): SecretariaResource
    {
        Gate::authorize('view', $secretaria);

        $secretaria->load('setor.piso.edificio');

        return new SecretariaResource($secretaria);
    }

    /**
     * Cria uma nova secretária.
     */
    public function store(StoreSecretariaRequest $request)
    {
        Gate::authorize('create', Secretaria::class);

        $secretaria = Secretaria::create(
            $request->validated()
        );

        $secretaria->load('setor.piso.edificio');

        return (new SecretariaResource($secretaria))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Atualiza uma secretária.
     */
    public function update(
        UpdateSecretariaRequest $request,
        Secretaria $secretaria
    ): SecretariaResource {
        Gate::authorize('update', $secretaria);

        $secretaria->update(
            $request->validated()
        );

        $secretaria->load('setor.piso.edificio');

        return new SecretariaResource($secretaria);
    }

    /**
     * Ativa ou desativa uma secretária.
     */
    public function toggleAtivo(
        Secretaria $secretaria
    ): SecretariaResource {
        Gate::authorize('toggleAtivo', $secretaria);

        $secretaria->ativo = ! $secretaria->ativo;
        $secretaria->save();

        $secretaria->load('setor.piso.edificio');

        return new SecretariaResource($secretaria);
    }
}