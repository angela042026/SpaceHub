<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;

class FaqController extends Controller
{
    /** Apresenta o Centro de Ajuda. */
    public function index()
    {
        $faqs = Faq::where('ativo', true)
            ->orderByRaw("
            CASE categoria
                WHEN 'Check-in' THEN 1
                WHEN 'Reservas' THEN 2
                WHEN 'Espaços' THEN 3
                WHEN 'Space Hub' THEN 4
                WHEN 'Conta' THEN 5
            END
        ")
            ->orderBy('ordem')
            ->get()
            ->groupBy('categoria');

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
        ]);
    }
}
