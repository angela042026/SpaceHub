<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function enviarMensagem(Request $request)
    {
        $request->validate([
            'mensagem' => 'required|string|max:500',
        ]);

        $mensagem = mb_strtolower(trim($request->input('mensagem')));

        // Remove pontuação e extrai termos individuais da mensagem do utilizador
        $palavrasChave = array_filter(
            explode(' ', preg_replace('/[^\p{L}\p{N}\s]/u', '', $mensagem))
        );

        $faqs = Faq::all();
        $melhorFaq = null;
        $maiorPontuacao = 0;

        foreach ($faqs as $faq) {
            $pontuacao = 0;

            $perguntaLower = mb_strtolower($faq->pergunta);
            $respostaLower = mb_strtolower($faq->resposta);
            $keywordsPtLower = mb_strtolower($faq->keywords_pt ?? '');
            $keywordsEnLower = mb_strtolower($faq->keywords_en ?? '');

            foreach ($palavrasChave as $palavra) {
                if (mb_strlen($palavra) < 3) {
                    continue; // Ignora conectores e palavras curtas (ex: "de", "in", "to")
                }

                // Correspondência nas Keywords bilingues (prioridade máxima)
                if ($keywordsPtLower !== '' && str_contains($keywordsPtLower, $palavra)) {
                    $pontuacao += 4;
                }
                if ($keywordsEnLower !== '' && str_contains($keywordsEnLower, $palavra)) {
                    $pontuacao += 4;
                }

                // Correspondência na Pergunta
                if (str_contains($perguntaLower, $palavra)) {
                    $pontuacao += 3;
                }

                // Correspondência na Resposta
                if (str_contains($respostaLower, $palavra)) {
                    $pontuacao += 1;
                }
            }

            if ($pontuacao > $maiorPontuacao) {
                $maiorPontuacao = $pontuacao;
                $melhorFaq = $faq;
            }
        }

        // Limiar de relevância mínima
        if ($melhorFaq && $maiorPontuacao >= 2) {
            return response()->json([
                'sucesso' => true,
                'resposta' => $melhorFaq->resposta,
                'faq_id' => $melhorFaq->id,
                'categoria' => $melhorFaq->categoria,
            ]);
        }

        return response()->json([
            'sucesso' => false,
            'resposta' => __('Desculpe, não encontrei uma resposta exata para a sua questão. Pode contactar a nossa equipa de suporte no separador "Apoio".'),
        ]);
    }
}
