<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use App\Models\Secretaria;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SecretariaQrCodeController extends Controller
{
    /**
     * Listagem administrativa de QR Codes por secretária, agrupada por piso.
     *
     * Sem uma Secretaria específica para autorizar contra, reutiliza a
     * ability `create` do SecretariaPolicy — já restrita a Administrador
     * (via before()) ou Gestor — em vez de reimplementar a mesma regra
     * num helper próprio.
     */
    public function index()
    {
        Gate::authorize('create', Secretaria::class);

        $pisos = Piso::where('ativo', true)
            ->with(['setores.secretarias' => function ($query) {
                $query->where('ativo', true)->orderBy('codigo');
            }])
            ->orderBy('numero')
            ->get()
            ->map(fn ($piso) => [
                'id' => $piso->id,
                'nome' => $piso->nome,
                'secretarias' => $piso->setores->flatMap(fn ($setor) => $setor->secretarias->map(fn ($secretaria) => [
                    'id' => $secretaria->id,
                    'codigo' => $secretaria->codigo,
                    'setor' => $setor->nome,
                    'qrUrl' => route('secretarias.qrcode', $secretaria->id),
                ]))->values(),
            ]);

        return Inertia::render('Secretarias/QrCodes', ['pisos' => $pisos]);
    }

    /**
     * Gera a imagem SVG do QR Code de uma secretária, apontando para a página de check-in.
     */
    public function show(Secretaria $secretaria): Response
    {
        Gate::authorize('update', $secretaria);

        $svg = QrCode::format('svg')->size(300)->margin(1)->generate($secretaria->checkinUrl());

        return response($svg, 200)->header('Content-Type', 'image/svg+xml');
    }
}
