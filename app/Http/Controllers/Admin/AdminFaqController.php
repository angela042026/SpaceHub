<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFaqController extends Controller
{
    /**
     * Retorna a lista de categorias únicas atualmente em uso por pelo menos uma FAQ.
     */
    private function getCategorias()
    {
        return Faq::whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->distinct()
            ->pluck('categoria')
            ->values();
    }

    public function index()
    {
        // Procura todas as FAQs e agrupa-as por categoria
        $faqs = Faq::all()->groupBy(function ($item) {
            return $item->categoria ?? 'Geral';
        });

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
        ]);
    }

    public function create()
    {
        return Inertia::render('Faqs/Create', [
            'categorias' => $this->getCategorias(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pergunta'  => 'required|string|max:255',
            'resposta'  => 'required|string',
            'categoria' => 'required|string|max:30',
            'keywords'  => 'nullable|string',
        ]);

        Faq::create($validated);

        return redirect()->route('admin.faqs.index')
            ->with('message', 'FAQ criada com sucesso!');
    }

    public function edit(Faq $faq)
    {
        return Inertia::render('Faqs/Edit', [
            'faq'        => $faq,
            'categorias' => $this->getCategorias(),
        ]);
    }

    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'pergunta'  => 'required|string|max:255',
            'resposta'  => 'required|string',
            'categoria' => 'required|string|max:30',
            'keywords'  => 'nullable|string',
        ]);

        $faq->update($validated);

        return redirect()->route('admin.faqs.index')
            ->with('message', 'FAQ atualizada com sucesso!');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return redirect()->route('admin.faqs.index')
            ->with('message', 'FAQ eliminada com sucesso!');
    }
}
