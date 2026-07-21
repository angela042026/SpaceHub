<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSecretariaRequest;
use App\Http\Requests\UpdateSecretariaRequest;
use App\Http\Resources\SecretariaResource;
use App\Models\Secretaria;
use App\Models\Setor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SecretariaController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Secretaria::class);

        $query = Secretaria::query()->with('setor.piso');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('codigo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%")
                    ->orWhereHas('setor', function ($query) use ($search): void {
                        $query->where('nome', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('setor_id')) {
            $query->where('setor_id', $request->integer('setor_id'));
        }

        if ($request->filled('reservavel')) {
            $query->where('reservavel', $request->boolean('reservavel'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $allowedSortFields = ['id', 'codigo', 'ativo', 'created_at'];
        $sortBy = (string) $request->input('sort_by', 'codigo');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'codigo';
        }

        $sortDirection = strtolower((string) $request->input('sort_direction', 'asc'));

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        $secretarias = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Secretarias/Index', [
            'secretarias' => SecretariaResource::collection($secretarias)->response()->getData(true),
            'setores' => Setor::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['search', 'setor_id', 'reservavel', 'ativo', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Secretaria::class);

        return Inertia::render('Admin/Secretarias/Create', [
            'setores' => Setor::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(StoreSecretariaRequest $request): RedirectResponse
    {
        Gate::authorize('create', Secretaria::class);

        Secretaria::create($request->validated());

        return redirect()
            ->route('admin.secretarias.index')
            ->with('success', 'Secretária criada com sucesso.');
    }

    public function edit(Secretaria $secretaria): Response
    {
        Gate::authorize('update', $secretaria);

        $secretaria->load('setor');

        return Inertia::render('Admin/Secretarias/Edit', [
            'secretaria' => new SecretariaResource($secretaria),
            'setores' => Setor::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function update(UpdateSecretariaRequest $request, Secretaria $secretaria): RedirectResponse
    {
        Gate::authorize('update', $secretaria);

        $secretaria->update($request->validated());

        return redirect()
            ->route('admin.secretarias.index')
            ->with('success', 'Secretária atualizada com sucesso.');
    }

    public function toggleAtivo(Secretaria $secretaria): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $secretaria);

        $secretaria->ativo = ! $secretaria->ativo;
        $secretaria->save();

        return redirect()
            ->back()
            ->with('success', $secretaria->ativo ? 'Secretária ativada.' : 'Secretária desativada.');
    }
}
