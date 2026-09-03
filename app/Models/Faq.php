<?php

namespace App\Models;

use App\Services\FaqKeywordService;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'categoria',
        'pergunta',
        'resposta',
        'pergunta_en',
        'resposta_en',
        'ordem',
        'ativo',
        'keywords_pt',
        'keywords_en',
    ];

    protected static function booted(): void
    {
        // Garante keywords sempre preenchidas, mesmo quando a FAQ é criada
        // fora do formulário de admin (ex: seeders, tinker).
        static::saving(function (Faq $faq) {
            if (empty($faq->keywords_pt) || empty($faq->keywords_en)) {
                $autoKeywords = app(FaqKeywordService::class)->extrair(
                    $faq->pergunta,
                    $faq->resposta,
                    $faq->pergunta_en,
                    $faq->resposta_en,
                );

                $faq->keywords_pt = $faq->keywords_pt ?: $autoKeywords['keywords_pt'];
                $faq->keywords_en = $faq->keywords_en ?: $autoKeywords['keywords_en'];
            }
        });
    }
}
