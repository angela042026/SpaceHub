<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSetorRequest;
use App\Http\Requests\UpdateSetorRequest;
use App\Http\Resources\SetorResource;
use App\Models\Setor;
use Illuminate\Support\Facades\Gate;

class SetorController extends Controller
{
    public function index()
{
    Gate::authorize('viewAny', Setor::class);

    $setores = Setor::with('piso')
        ->orderBy('nome')
        ->get();

    return SetorResource::collection($setores);
}

public function show(Setor $setor)
{
    Gate::authorize('view', $setor);

    $setor->load('piso');

    return new SetorResource($setor);
}

public function store(StoreSetorRequest $request)
{
    Gate::authorize('create', Setor::class);

    $setor = Setor::create($request->validated());

    $setor->load('piso');

    return (new SetorResource($setor))
        ->response()
        ->setStatusCode(201);
}

public function update(UpdateSetorRequest $request, Setor $setor)
{
    Gate::authorize('update', $setor);

    $setor->update($request->validated());

    $setor->load('piso');

    return new SetorResource($setor);
}

public function toggleAtivo(Setor $setor)
{
    Gate::authorize('toggleAtivo', $setor);

    $setor->ativo = ! $setor->ativo;
    $setor->save();

    $setor->load('piso');

    return new SetorResource($setor);
}
}