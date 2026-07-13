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
            ->orderBy('categoria')
            ->orderBy('ordem')
            ->get()
            ->groupBy('categoria');

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
        ]);
    }
}