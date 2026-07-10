<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePisoRequest;
use App\Http\Requests\UpdatePisoRequest;
use App\Http\Resources\PisoResource;
use App\Models\Piso;

class PisoController extends Controller
{
    public function index()
    {
        $pisos = Piso::with('edificio')
            ->orderBy('numero')
            ->get();

        return PisoResource::collection($pisos);
    }

    public function show(Piso $piso)
    {
        $piso->load('edificio');

        return new PisoResource($piso);
    }

    public function store(StorePisoRequest $request)
    {
        $piso = Piso::create($request->validated());

        $piso->load('edificio');

        return (new PisoResource($piso))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePisoRequest $request, Piso $piso)
    {
        $piso->update($request->validated());

        $piso->load('edificio');

        return new PisoResource($piso);
    }

    public function toggleAtivo(Piso $piso)
    {
        $piso->ativo = !$piso->ativo;
        $piso->save();

        $piso->load('edificio');

        return new PisoResource($piso);
    }
}