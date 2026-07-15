<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePisoRequest;
use App\Http\Requests\UpdatePisoRequest;
use App\Http\Resources\PisoResource;
use App\Models\Piso;
use Illuminate\Support\Facades\Gate;

class PisoController extends Controller
{
  
    public function index()
{
    Gate::authorize('viewAny', Piso::class);

    $pisos = Piso::with('edificio')
        ->orderBy('numero')
        ->get();

    return PisoResource::collection($pisos);
}

public function show(Piso $piso)
{
    Gate::authorize('view', $piso);

    $piso->load('edificio');

    return new PisoResource($piso);
}

public function store(StorePisoRequest $request)
{
    Gate::authorize('create', Piso::class);

    $piso = Piso::create($request->validated());

    $piso->load('edificio');

    return (new PisoResource($piso))
        ->response()
        ->setStatusCode(201);
}

public function update(UpdatePisoRequest $request, Piso $piso)
{
    Gate::authorize('update', $piso);

    $piso->update($request->validated());

    $piso->load('edificio');

    return new PisoResource($piso);
}

public function toggleAtivo(Piso $piso)
{
    Gate::authorize('toggleAtivo', $piso);

    $piso->ativo = ! $piso->ativo;
    $piso->save();

    $piso->load('edificio');

    return new PisoResource($piso);
}
}