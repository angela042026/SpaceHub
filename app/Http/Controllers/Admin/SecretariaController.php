<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSecretariaRequest;
use App\Http\Requests\UpdateSecretariaRequest;
use App\Http\Resources\SecretariaResource;
use App\Models\Piso;
use App\Models\Secretaria;
use App\Models\Setor;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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
            'pisos' => Piso::orderBy('numero')->get(['id', 'nome']),
            'setores' => Setor::where('reservavel', true)->orderBy('nome')->get(['id', 'nome', 'piso_id']),
        ]);
    }

    public function store(StoreSecretariaRequest $request): RedirectResponse
    {
        Gate::authorize('create', Secretaria::class);

        $dados = $request->validated();
        $imagemGuardada = null;

        if ($request->hasFile('imagem')) {
            $imagemGuardada = $request->file('imagem')->store('secretarias/imagens', 'public');
            $dados['imagem'] = $imagemGuardada;
        }

        try {
            $secretaria = Secretaria::create($dados);
        } catch (Throwable $exception) {
            if ($imagemGuardada !== null) {
                Storage::disk('public')->delete($imagemGuardada);
            }

            throw $exception;
        }

        ActivityLogger::log(
            Auth::user(),
            'espaco_criado',
            $this->descreverSecretaria($secretaria),
            $secretaria
        );

        return redirect()
            ->route('admin.secretarias.index')
            ->with('success', 'Secretária criada com sucesso.');
    }

    public function edit(Secretaria $secretaria): Response
    {
        Gate::authorize('update', $secretaria);

        $secretaria->load('setor');

        return Inertia::render('Admin/Secretarias/Edit', [
            // ->resolve() em vez de passar o Resource diretamente: o Inertia
            // trata qualquer Responsable chamando ->toResponse()->getData(true),
            // e o JsonResource embrulha sempre em {"data": {...}} (via
            // JsonResource::$wrap = 'data'). Sem isto, o React recebia
            // secretaria.data.codigo em vez de secretaria.codigo e o
            // formulário ficava vazio.
            'secretaria' => (new SecretariaResource($secretaria))->resolve(),
            'pisos' => Piso::orderBy('numero')->get(['id', 'nome']),
            'setores' => Setor::where('reservavel', true)->orderBy('nome')->get(['id', 'nome', 'piso_id']),
        ]);
    }

    public function update(UpdateSecretariaRequest $request, Secretaria $secretaria): RedirectResponse
    {
        Gate::authorize('update', $secretaria);

        $dados = $request->validated();
        $imagemAntiga = $secretaria->imagem;
        $novaImagem = null;

        if ($request->hasFile('imagem')) {
            $novaImagem = $request->file('imagem')->store('secretarias/imagens', 'public');
            $dados['imagem'] = $novaImagem;
        }

        try {
            $secretaria->update($dados);
        } catch (Throwable $exception) {
            if ($novaImagem !== null) {
                Storage::disk('public')->delete($novaImagem);
            }

            throw $exception;
        }

        if ($novaImagem !== null && $imagemAntiga !== null && $imagemAntiga !== $novaImagem) {
            Storage::disk('public')->delete($imagemAntiga);
        }

        ActivityLogger::log(
            Auth::user(),
            'espaco_atualizado',
            $this->descreverSecretaria($secretaria),
            $secretaria
        );

        return redirect()
            ->route('admin.secretarias.index')
            ->with('success', 'Secretária atualizada com sucesso.');
    }

    public function toggleAtivo(Secretaria $secretaria): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $secretaria);

        $secretaria->ativo = ! $secretaria->ativo;
        $secretaria->save();

        ActivityLogger::log(
            Auth::user(),
            $secretaria->ativo ? 'espaco_ativado' : 'espaco_desativado',
            $this->descreverSecretaria($secretaria),
            $secretaria
        );

        return redirect()
            ->back()
            ->with('success', $secretaria->ativo ? 'Secretária ativada.' : 'Secretária desativada.');
    }

    /**
     * Descrição legível de uma secretária para o Registo de Atividade —
     * "Secretária {código} · {setor}".
     */
    private function descreverSecretaria(Secretaria $secretaria): string
    {
        $secretaria->loadMissing('setor');

        return sprintf(
            'Secretária %s · %s',
            $secretaria->codigo,
            $secretaria->setor?->nome ?? '-'
        );
    }
}
