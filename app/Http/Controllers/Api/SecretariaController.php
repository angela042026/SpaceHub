<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSecretariaRequest;
use App\Http\Requests\UpdateSecretariaRequest;
use App\Http\Resources\SecretariaResource;
use App\Models\Secretaria;
use Illuminate\Http\Request;

class SecretariaController extends Controller
{
    /**
     * Lista todas as secretárias.
     */
    public function index(Request $request)
{
    $query = Secretaria::with('setor.piso');

    if ($request->has('monitor')) {
        $query->where('monitor', $request->boolean('monitor'));
    }

    if ($request->has('dock_usb')) {
        $query->where('dock_usb', $request->boolean('dock_usb'));
    }

    if ($request->has('junto_janela')) {
        $query->where('junto_janela', $request->boolean('junto_janela'));
    }

    if ($request->has('ergonomica')) {
        $query->where('ergonomica', $request->boolean('ergonomica'));
    }

    if ($request->has('reservavel')) {
        $query->where('reservavel', $request->boolean('reservavel'));
    }

    if ($request->has('ativo')) {
        $query->where('ativo', $request->boolean('ativo'));
    }

    if ($request->has('setor_id')) {
        $query->where('setor_id', $request->integer('setor_id'));
    }

    $secretarias = $query
        ->orderBy('codigo')
        ->get();

    return SecretariaResource::collection($secretarias);
}

    /**
     * Mostra uma secretária.
     */
    public function show(Secretaria $secretaria)
    {
        $secretaria->load('setor');

        return new SecretariaResource($secretaria);
    }

    /**
     * Cria uma nova secretária.
     */
    public function store(StoreSecretariaRequest $request)
    {
        $secretaria = Secretaria::create($request->validated());

        $secretaria->load('setor');

        return (new SecretariaResource($secretaria))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Atualiza uma secretária.
     */
    public function update(UpdateSecretariaRequest $request, Secretaria $secretaria)
    {
        $secretaria->update($request->validated());

        $secretaria->load('setor');

        return new SecretariaResource($secretaria);
    }

    /**
     * Ativa/Desativa uma secretária.
     */
    public function toggleAtivo(Secretaria $secretaria)
    {
        $secretaria->ativo = !$secretaria->ativo;
        $secretaria->save();

        $secretaria->load('setor');

        return new SecretariaResource($secretaria);
    }
}