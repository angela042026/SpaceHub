<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSetorRequest;
use App\Http\Requests\UpdateSetorRequest;
use App\Http\Resources\SetorResource;
use App\Models\Setor;

class SetorController extends Controller
{
    public function index()
    {
        $setores = Setor::with('piso')
            ->orderBy('nome')
            ->get();

        return SetorResource::collection($setores);
    }

    public function show(Setor $setor)
    {
        $setor->load('piso');

        return new SetorResource($setor);
    }

    public function store(StoreSetorRequest $request)
    {
        $setor = Setor::create($request->validated());

        $setor->load('piso');

        return (new SetorResource($setor))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateSetorRequest $request, Setor $setor)
    {
        $setor->update($request->validated());

        $setor->load('piso');

        return new SetorResource($setor);
    }

    public function toggleAtivo(Setor $setor)
    {
        $setor->ativo = !$setor->ativo;
        $setor->save();

        $setor->load('piso');

        return new SetorResource($setor);
    }
}