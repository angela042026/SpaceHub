<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Services\FaqKeywordService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    protected FaqKeywordService $keywordService;

    public function __construct(FaqKeywordService $keywordService)
    {
        $this->keywordService = $keywordService;
    }

    public function index()
    {
        $faqs = Faq::all()->groupBy('categoria');

        return Inertia::render('Admin/Faqs/Index', [
            'faqs' => $faqs,
        ]);
    }

    public function create()
    {
        $categorias = Faq::distinct()->pluck('categoria')->filter()->values();

        return Inertia::render('Admin/Faqs/Create', [
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria' => 'required|string|max:30',
            'pergunta' => 'required|string|max:255',
            'resposta' => 'required|string',
            'pergunta_en' => 'nullable|string|max:255',
            'resposta_en' => 'nullable|string',
            'keywords_pt' => 'nullable|string',
            'keywords_en' => 'nullable|string',
        ]);

        if (empty($validated['keywords_pt']) || empty($validated['keywords_en'])) {
            $autoKeywords = $this->keywordService->extrair(
                $validated['pergunta'],
                $validated['resposta'],
                $validated['pergunta_en'] ?? null,
                $validated['resposta_en'] ?? null,
            );

            $validated['keywords_pt'] = $validated['keywords_pt'] ?: $autoKeywords['keywords_pt'];
            $validated['keywords_en'] = $validated['keywords_en'] ?: $autoKeywords['keywords_en'];
        }

        Faq::create($validated);

        return redirect()->route('admin.faqs.index')->with('message', __('FAQ criada com sucesso!'));
    }

    public function edit(Faq $faq)
    {
        $categorias = Faq::distinct()->pluck('categoria')->filter()->values();

        return Inertia::render('Admin/Faqs/Edit', [
            'faq' => $faq,
            'categorias' => $categorias,
        ]);
    }

    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'categoria' => 'required|string|max:30',
            'pergunta' => 'required|string|max:255',
            'resposta' => 'required|string',
            'pergunta_en' => 'nullable|string|max:255',
            'resposta_en' => 'nullable|string',
            'keywords_pt' => 'nullable|string',
            'keywords_en' => 'nullable|string',
        ]);

        if (empty($validated['keywords_pt']) || empty($validated['keywords_en'])) {
            $autoKeywords = $this->keywordService->extrair(
                $validated['pergunta'],
                $validated['resposta'],
                $validated['pergunta_en'] ?? null,
                $validated['resposta_en'] ?? null
            );

            $validated['keywords_pt'] = $validated['keywords_pt'] ?: $autoKeywords['keywords_pt'];
            $validated['keywords_en'] = $validated['keywords_en'] ?: $autoKeywords['keywords_en'];
        }

        $faq->update($validated);

        return redirect()->route('admin.faqs.index')->with('message', __('FAQ atualizada com sucesso!'));
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return redirect()->route('admin.faqs.index')->with('message', __('FAQ eliminada com sucesso!'));
    }
}
