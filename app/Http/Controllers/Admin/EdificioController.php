<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdificioRequest;
use App\Http\Requests\UpdateEdificioRequest;
use App\Http\Resources\EdificioResource;
use App\Models\Edificio;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

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

        $dados = $request->validated();
        $imagemGuardada = null;

        if ($request->hasFile('imagem')) {
            $imagemGuardada = $request->file('imagem')->store('edificios/imagens', 'public');
            $dados['imagem'] = $imagemGuardada;
        }

        try {
            $edificio = Edificio::create($dados);
        } catch (Throwable $exception) {
            if ($imagemGuardada !== null) {
                Storage::disk('public')->delete($imagemGuardada);
            }

            throw $exception;
        }

        ActivityLogger::log(
            Auth::user(),
            'espaco_criado',
            $edificio->nome,
            $edificio
        );

        return redirect()
            ->route('admin.edificios.index')
            ->with('success', __('Edifício criado com sucesso.'));
    }

    public function edit(Edificio $edificio): Response
    {
        Gate::authorize('update', $edificio);

        return Inertia::render('Admin/Edificios/Edit', [
            // ->resolve() em vez de passar o Resource diretamente: o Inertia
            // trata qualquer Responsable chamando ->toResponse()->getData(true),
            // e o JsonResource embrulha sempre em {"data": {...}} (via
            // JsonResource::$wrap = 'data'). Sem isto, o React recebia
            // edificio.data.nome em vez de edificio.nome e o formulário ficava vazio.
            'edificio' => (new EdificioResource($edificio))->resolve(),
        ]);
    }

    public function update(UpdateEdificioRequest $request, Edificio $edificio): RedirectResponse
    {
        Gate::authorize('update', $edificio);

        $dados = $request->validated();
        $imagemAntiga = $edificio->imagem;
        $novaImagem = null;

        if ($request->hasFile('imagem')) {
            $novaImagem = $request->file('imagem')->store('edificios/imagens', 'public');
            $dados['imagem'] = $novaImagem;
        }

        try {
            $edificio->update($dados);
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
            $edificio->nome,
            $edificio
        );

        return redirect()
            ->route('admin.edificios.index')
            ->with('success', __('Edifício atualizado com sucesso.'));
    }

    public function toggleAtivo(Edificio $edificio): RedirectResponse
    {
        Gate::authorize('toggleAtivo', $edificio);

        $edificio->ativo = ! $edificio->ativo;
        $edificio->save();

        ActivityLogger::log(
            Auth::user(),
            $edificio->ativo ? 'espaco_ativado' : 'espaco_desativado',
            $edificio->nome,
            $edificio
        );

        return redirect()
            ->back()
            ->with('success', $edificio->ativo ? __('Edifício ativado.') : __('Edifício desativado.'));
    }
}
