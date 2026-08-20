<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;

class FaqController extends Controller
{
    /** Apresenta o Centro de Ajuda. */
    public function index()
    {
        $locale = app()->getLocale();

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
            // As colunas _en são opcionais (nem todas as FAQs têm
            // tradução ainda) — sem uma, mostra sempre o texto em PT
            // em vez de deixar a pergunta ou a resposta vazias.
            ->map(fn (Faq $faq) => [
                'id' => $faq->id,
                'categoria' => $faq->categoria,
                'pergunta' => $locale === 'en' && $faq->pergunta_en
                    ? $faq->pergunta_en
                    : $faq->pergunta,
                'resposta' => $locale === 'en' && $faq->resposta_en
                    ? $faq->resposta_en
                    : $faq->resposta,
                'traduzida' => $locale === 'en' ? (bool) $faq->resposta_en : true,
            ])
            ->groupBy('categoria');

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
        ]);
    }
}
