<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePisoRequest;
use App\Http\Requests\UpdatePisoRequest;
use App\Http\Resources\PisoResource;
use App\Models\Edificio;
use App\Models\Piso;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PisoController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Piso::class);

        $query = Piso::query()->with('edificio');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('nome', 'like', "%{$search}%")
                    ->orWhere('nome_en', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhereHas('edificio', function ($query) use ($search): void {
                        $query->where('nome', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('edificio_id')) {
            $query->where('edificio_id', $request->integer('edificio_id'));
        }

        if ($request->has('ativo') && $request->input('ativo') !== '') {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $allowedSortFields = ['id', 'nome', 'codigo', 'numero', 'ativo', 'created_at'];
        $sortBy = (string) $request->input('sort_by', 'numero');

        if (! in_array($sortBy, $allowedSortFields, true)) {
            $sortBy = 'numero';
        }

        $sortDirection = strtolower((string) $request->input('sort_direction', 'asc'));

        if (! in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'asc';
        }

        $pisos = $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Pisos/Index', [
            'pisos' => PisoResource::collection($pisos)->response()->getData(true),
            'edificios' => Edificio::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['search', 'edificio_id', 'ativo', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Piso::class);

        return Inertia::render('Admin/Pisos/Create', [
            'edificios' => Edificio::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(StorePisoRequest $request): RedirectResponse
    {
        Gate::authorize('create', Piso::class);

        $dados = $request->validated();
        $plantaGuardada = null;

        if ($request->hasFile('planta')) {
            $plantaGuardada = $request->file('planta')->store('pisos/plantas', 'public');
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

        ActivityLogger::log(
            Auth::user(),
            'espaco_criado',
            $this->descreverPiso($piso),
            $piso
        );

        return redirect()
            ->route('admin.pisos.index')
            ->with('success', __('Piso criado com sucesso.'));
    }

    public function edit(Piso $piso): Response
    {
        Gate::authorize('update', $piso);

        $piso->load('edificio');

        return Inertia::render('Admin/Pisos/Edit', [
            // ->resolve() em vez de passar o Resource diretamente: o Inertia
            // trata qualquer Responsable chamando ->toResponse()->getData(true),
            // e o JsonResource embrulha sempre em {"data": {...}} (via
            // JsonResource::$wrap = 'data'). Sem isto, o React recebia
            // piso.data.nome em vez de piso.nome e o formulário ficava vazio.
            'piso' => (new PisoResource($piso))->resolve(),
            'edificios' => Edificio::orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function update(UpdatePisoRequest $request, Piso $piso): RedirectResponse
    {
        Gate::authorize('update', $piso);

        $dados = $request->validated();
        $plantaAntiga = $piso->planta;
        $novaPlanta = null;

        if ($request->hasFile('planta')) {
            $novaPlanta = $request->file('planta')->store('pisos/plantas', 'public');
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

        if ($novaPlanta !== null && $plantaAntiga !== null && $plantaAntiga !== $novaPlanta) {
            Storage::disk('public')->delete($plantaAntiga);
        }

        ActivityLogger::log(
            Auth::user(),
            'espaco_atualizado',
            $this->descreverPiso($piso),
            $piso
        );

        return redirect()
            ->route('admin.pisos.index')
            ->with('success', __('Piso atualizado com sucesso.'));
    }

    public function toggleAtivo(Piso $piso): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $piso);

        $piso->ativo = ! $piso->ativo;
        $piso->save();

        ActivityLogger::log(
            Auth::user(),
            $piso->ativo ? 'espaco_ativado' : 'espaco_desativado',
            $this->descreverPiso($piso),
            $piso
        );

        return redirect()
            ->back()
            ->with('success', $piso->ativo ? __('Piso ativado.') : __('Piso desativado.'));
    }

    /**
     * Descrição legível de um piso para o Registo de Atividade —
     * "{nome} · {edifício}".
     */
    private function descreverPiso(Piso $piso): string
    {
        $piso->loadMissing('edificio');

        return sprintf(
            '%s · %s',
            $piso->nome,
            $piso->edificio?->nome ?? '-'
        );
    }
}
