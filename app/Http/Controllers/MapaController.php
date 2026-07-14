<?php

namespace App\Http\Controllers;

use App\Services\MapaOcupacaoService;
use Inertia\Inertia;
use Inertia\Response;

class MapaController extends Controller
{
    public function __construct(
        private readonly MapaOcupacaoService $mapaOcupacaoService
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('Mapa/Index', $this->mapaOcupacaoService->obterDados());
    }
}
