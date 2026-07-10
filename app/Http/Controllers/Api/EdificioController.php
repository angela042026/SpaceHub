<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEdificioRequest;
use App\Http\Requests\UpdateEdificioRequest;
use App\Http\Resources\EdificioResource;
use App\Models\Edificio;

class EdificioController extends Controller
{
    public function index()
    {
        $edificios = Edificio::orderBy('nome')->get();

        return EdificioResource::collection($edificios);
    }

    public function show(Edificio $edificio)
    {
        return new EdificioResource($edificio);
    }

    public function store(StoreEdificioRequest $request)
    {
        $edificio = Edificio::create($request->validated());

        return new EdificioResource($edificio);
    }

    public function update(UpdateEdificioRequest $request, Edificio $edificio)
    {
        $edificio->fill($request->validated());
        $edificio->save();

        return new EdificioResource($edificio);
    }

    public function toggleAtivo(Edificio $edificio)
    {
        $edificio->ativo = !$edificio->ativo;
        $edificio->save();

        return new EdificioResource($edificio);
    }
}