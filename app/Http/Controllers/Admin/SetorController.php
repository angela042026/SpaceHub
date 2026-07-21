<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSetorRequest;
use App\Http\Requests\UpdateSetorRequest;
use App\Http\Resources\SetorResource;
use App\Models\Piso;
use App\Models\Setor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SetorController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Setor::class);

        $query = Setor::query()->with('piso.edificio');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('nome', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhereHas('piso', function ($query) use ($search): void {
                        $query->where('nome', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('piso_id')) {
            $query->where('piso_id', $request->integer('piso_id'));
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->input('tipo'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $allowedSortFields = ['id', 'nome', 'codigo', 'tipo', 'ativo', 'created_at'];
        $sortBy = (string) $request->input('sort_by', 'nome');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'nome';
        }

        $sortDirection = strtolower((string) $request->input('sort_direction', 'asc'));

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        $setores = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Setores/Index', [
            'setores' => SetorResource::collection($setores)->response()->getData(true),
            'pisos' => Piso::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['search', 'piso_id', 'tipo', 'ativo', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Setor::class);

        return Inertia::render('Admin/Setores/Create', [
            'pisos' => Piso::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(StoreSetorRequest $request): RedirectResponse
    {
        Gate::authorize('create', Setor::class);

        Setor::create($request->validated());

        return redirect()
            ->route('admin.setores.index')
            ->with('success', 'Setor criado com sucesso.');
    }

    public function edit(Setor $setor): Response
    {
        Gate::authorize('update', $setor);

        $setor->load('piso');

        return Inertia::render('Admin/Setores/Edit', [
            'setor' => new SetorResource($setor),
            'pisos' => Piso::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function update(UpdateSetorRequest $request, Setor $setor): RedirectResponse
    {
        Gate::authorize('update', $setor);

        $setor->update($request->validated());

        return redirect()
            ->route('admin.setores.index')
            ->with('success', 'Setor atualizado com sucesso.');
    }

    public function toggleAtivo(Setor $setor): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $setor);

        $setor->ativo = ! $setor->ativo;
        $setor->save();

        return redirect()
            ->back()
            ->with('success', $setor->ativo ? 'Setor ativado.' : 'Setor desativado.');
    }
}
