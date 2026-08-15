<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use App\Models\Secretaria;
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
     *
     * Não devolve um Illuminate\Http\Response normal de propósito: neste
     * ambiente (servidor embutido do PHP, SAPI cli-server), o
     * Response::send() do Symfony chama closeOutputBuffers(), que insere 4
     * bytes de espaço antes do corpo da resposta. Inofensivo em HTML (os
     * browsers ignoram espaço antes de <!DOCTYPE>), mas inválido em SVG —
     * a declaração XML deixa de estar no início do documento e o browser
     * recusa-se a renderizar ("XML declaration allowed only at the start
     * of the document"). Confirmado isolando cada camada (geração do SVG,
     * middleware, bootstrap do Laravel) até restar só o Response::send().
     * O envio manual e imediato evita esse caminho de código.
     */
    public function show(Secretaria $secretaria): never
    {
        Gate::authorize('update', $secretaria);

        ob_start();
        $svg = (string) QrCode::format('svg')->size(300)->margin(1)->generate($secretaria->checkinUrl());
        ob_end_clean();

        // Drena qualquer buffer de output que o próprio Laravel ainda
        // tenha ativo neste ponto do pedido. Sem isto, o echo() abaixo
        // escreve para dentro desse buffer em vez de ir direto para a
        // rede — e é precisamente quando esse buffer do Laravel é
        // enviado (via Response::send()/closeOutputBuffers()) que os 4
        // bytes de espaço voltam a ser inseridos antes do SVG.
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        header('Content-Type: image/svg+xml');
        header('Cache-Control: no-store, must-revalidate');
        echo $svg;
        exit;
    }
}
