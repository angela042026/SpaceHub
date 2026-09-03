<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Expressões de saudação e despedida com resposta fixa, tratadas à
     * parte da pesquisa nas FAQs.
     */
    protected array $saudacoes = ['ola', 'olá', 'bom dia', 'boa tarde', 'boa noite'];

    protected array $despedidas = ['adeus', 'xau', 'até logo', 'ate logo'];

    public function enviarMensagem(Request $request)
    {
        $request->validate([
            'mensagem' => 'required|string|max:500',
        ]);

        $mensagem = mb_strtolower(trim($request->input('mensagem')));

        $temSaudacao = $this->contemAlguma($mensagem, $this->saudacoes);
        $temDespedida = $this->contemAlguma($mensagem, $this->despedidas);

        // Remove as saudações/despedidas antes de extrair os termos, para que
        // palavras genéricas (ex: "dia", "tarde", "logo") não interfiram na
        // pesquisa nas FAQs.
        $mensagemSemSaudacoes = $this->removerFrases($mensagem, [...$this->saudacoes, ...$this->despedidas]);

        $melhorFaq = $this->encontrarMelhorFaq($mensagemSemSaudacoes);

        if ($melhorFaq) {
            return response()->json([
                'sucesso' => true,
                'resposta' => $melhorFaq->resposta,
                'faq_id' => $melhorFaq->id,
                'categoria' => $melhorFaq->categoria,
            ]);
        }

        // Só responde com saudação/despedida se não houver outra keyword relevante.
        $respostaFixa = match (true) {
            $temSaudacao => __('Olá! Como posso ajudar?'),
            $temDespedida => __('Até já! Continuo à disposição para mais questões que possam surgir'),
            default => null,
        };

        if ($respostaFixa) {
            return response()->json(['sucesso' => true, 'resposta' => $respostaFixa]);
        }

        return response()->json([
            'sucesso' => false,
            'resposta' => __('Desculpe, não encontrei uma resposta exata para a sua questão. Pode contactar a nossa equipa de suporte no separador "Apoio".'),
        ]);
    }

    /**
     * Encontra a FAQ com maior pontuação de relevância para a mensagem, ou
     * null se nenhuma atingir o limiar mínimo.
     */
    protected function encontrarMelhorFaq(string $mensagem): ?Faq
    {
        // Remove pontuação e extrai termos individuais da mensagem do utilizador
        $palavrasChave = array_filter(
            explode(' ', preg_replace('/[^\p{L}\p{N}\s]/u', '', $mensagem))
        );

        $melhorFaq = null;
        $maiorPontuacao = 0;

        foreach (Faq::all() as $faq) {
            $pontuacao = $this->pontuarFaq($faq, $palavrasChave);

            if ($pontuacao > $maiorPontuacao) {
                $maiorPontuacao = $pontuacao;
                $melhorFaq = $faq;
            }
        }

        // Limiar de relevância mínima
        return $maiorPontuacao >= 2 ? $melhorFaq : null;
    }

    /**
     * Calcula a pontuação de relevância de uma FAQ para o conjunto de termos.
     */
    protected function pontuarFaq(Faq $faq, array $palavrasChave): int
    {
        $perguntaLower = mb_strtolower($faq->pergunta);
        $respostaLower = mb_strtolower($faq->resposta);
        $keywordsPtLower = mb_strtolower($faq->keywords_pt ?? '');
        $keywordsEnLower = mb_strtolower($faq->keywords_en ?? '');

        $pontuacao = 0;

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

        return $pontuacao;
    }

    /**
     * Verifica se alguma das frases indicadas ocorre na mensagem, respeitando
     * limites de palavra (evita apanhar "olá" dentro de outra palavra).
     */
    protected function contemAlguma(string $mensagem, array $frases): bool
    {
        foreach ($frases as $frase) {
            if (preg_match('/\b'.preg_quote($frase, '/').'\b/u', $mensagem)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Remove as frases indicadas da mensagem, respeitando limites de palavra.
     */
    protected function removerFrases(string $mensagem, array $frases): string
    {
        foreach ($frases as $frase) {
            $mensagem = preg_replace('/\b'.preg_quote($frase, '/').'\b/u', ' ', $mensagem);
        }

        return $mensagem;
    }
}
