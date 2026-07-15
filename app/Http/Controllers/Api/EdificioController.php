<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdificioRequest;
use App\Http\Requests\UpdateEdificioRequest;
use App\Http\Resources\EdificioResource;
use App\Models\Edificio;
use Illuminate\Support\Facades\Gate;

class EdificioController extends Controller
{
   
    public function index()
{
    Gate::authorize('viewAny', Edificio::class);

    $edificios = Edificio::orderBy('nome')->get();

    return EdificioResource::collection($edificios);
}

public function show(Edificio $edificio)
{
    Gate::authorize('view', $edificio);

    return new EdificioResource($edificio);
}

public function store(StoreEdificioRequest $request)
{
    Gate::authorize('create', Edificio::class);

    $edificio = Edificio::create($request->validated());

    return (new EdificioResource($edificio))
        ->response()
        ->setStatusCode(201);
}

public function update(
    UpdateEdificioRequest $request,
    Edificio $edificio
) {
    Gate::authorize('update', $edificio);

    $edificio->update($request->validated());

    return new EdificioResource($edificio);
}

public function toggleAtivo(Edificio $edificio)
{
    Gate::authorize('toggleAtivo', $edificio);

    $edificio->ativo = ! $edificio->ativo;
    $edificio->save();

    return new EdificioResource($edificio);
}
}