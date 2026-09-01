<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use App\Models\Secretaria;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class SecretariaQrCodeController extends Controller
{
    /**
     * Listagem administrativa de QR Codes por secretária, agrupada por piso.
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
                'nome' => $piso->nome_localizado,
                'secretarias' => $piso->setores->flatMap(fn ($setor) => $setor->secretarias->map(fn ($secretaria) => [
                    'id' => $secretaria->id,
                    'codigo' => $secretaria->codigo,
                    'setor' => $setor->nome_localizado,
                    'qrUrl' => route('secretarias.qrcode', $secretaria->id),
                ]))->values(),
            ]);

        return Inertia::render('Secretarias/QrCodes', ['pisos' => $pisos]);
    }

    /**
     * Gera o QR Code de uma secretária em SVG.
     */
    public function show(Secretaria $secretaria): HttpResponse
    {
        Gate::authorize('update', $secretaria);

        $svg = (string) QrCode::format('svg')
            ->size(300)
            ->margin(1)
            ->generate($secretaria->checkinUrl());

        $svg = ltrim($svg);
        $svg = preg_replace('/<\?xml[^?]*\?>\s*/', '', $svg, 1);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'no-store, must-revalidate',
        ]);
    }
}
