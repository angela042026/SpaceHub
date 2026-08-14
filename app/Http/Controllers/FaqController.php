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
                WHEN 'Sobre o SpaceHub' THEN 1
                WHEN 'Espaços e disponibilidade' THEN 2
                WHEN 'Reservas' THEN 3
                WHEN 'Pagamentos' THEN 4
                WHEN 'Check-in' THEN 5
                WHEN 'Conta' THEN 6
                ELSE 99
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
