<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdificioRequest;
use App\Http\Requests\UpdateEdificioRequest;
use App\Http\Resources\EdificioResource;
use App\Models\Edificio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EdificioController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Edificio::class);

        $query = Edificio::query();

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

        if ($request->filled('cidade')) {
            $query->where('cidade', $request->input('cidade'));
        }

        if ($request->filled('pais')) {
            $query->where('pais', $request->input('pais'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $allowedSortFields = ['id', 'nome', 'codigo', 'cidade', 'pais', 'ativo', 'created_at'];
        $sortBy = (string) $request->input('sort_by', 'nome');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'nome';
        }

        $sortDirection = strtolower((string) $request->input('sort_direction', 'asc'));

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        $edificios = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Edificios/Index', [
            'edificios' => EdificioResource::collection($edificios)->response()->getData(true),
            'filters' => $request->only(['search', 'cidade', 'pais', 'ativo', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Edificio::class);

        return Inertia::render('Admin/Edificios/Create');
    }

    public function store(StoreEdificioRequest $request): RedirectResponse
    {
        Gate::authorize('create', Edificio::class);

        Edificio::create($request->validated());

        return redirect()
            ->route('admin.edificios.index')
            ->with('success', 'Edifício criado com sucesso.');
    }

    public function edit(Edificio $edificio): Response
    {
        Gate::authorize('update', $edificio);

        return Inertia::render('Admin/Edificios/Edit', [
            'edificio' => new EdificioResource($edificio),
        ]);
    }

    public function update(UpdateEdificioRequest $request, Edificio $edificio): RedirectResponse
    {
        Gate::authorize('update', $edificio);

        $edificio->update($request->validated());

        return redirect()
            ->route('admin.edificios.index')
            ->with('success', 'Edifício atualizado com sucesso.');
    }

    public function toggleAtivo(Edificio $edificio): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $edificio);

        $edificio->ativo = ! $edificio->ativo;
        $edificio->save();

        return redirect()
            ->back()
            ->with('success', $edificio->ativo ? 'Edifício ativado.' : 'Edifício desativado.');
    }
}
