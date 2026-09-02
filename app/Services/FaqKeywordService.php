<?php

namespace App\Services;

class FaqKeywordService
{
    /**
     * Palavras de ligação a ignorar em Português.
     */
    protected array $stopwordsPt = [
        'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
        'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'para',
        'com', 'como', 'onde', 'quando', 'porque', 'porquê', 'que', 'qual', 'quais', 'se',
        'e', 'ou', 'mas', 'também', 'ser', 'estar', 'ter', 'haver', 'fazer', 'pode', 'posso',
        'está', 'são', 'foram', 'meu', 'minha', 'seu', 'sua', 'este', 'esta', 'isto'
    ];

    /**
     * Palavras de ligação a ignorar em Inglês.
     */
    protected array $stopwordsEn = [
        'i', 'me', 'my', 'mine', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was',
        'were', 'to', 'of', 'in', 'on', 'for', 'with', 'from', 'how', 'what', 'where',
        'when', 'why', 'who', 'can', 'could', 'do', 'does', 'did', 'you', 'your', 'we',
        'our', 'they', 'their', 'it', 'this', 'that', 'have', 'has', 'had', 'be', 'been'
    ];

    /**
     * Exceções curtas permitidas nas keywords inglesas.
     */
    protected array $keywordsEnCurtasPermitidas = [
        'map',
        'pay',
    ];

    /**
     * Gera automaticamente as keywords em Português e Inglês.
     */
    public function extrair(
        string $pergunta,
        string $resposta,
        ?string $perguntaEn = null,
        ?string $respostaEn = null
    ): array
    {
        $textoPt = $pergunta . ' ' . $resposta;
        $textoEn = trim(($perguntaEn ?? '') . ' ' . ($respostaEn ?? ''));

        $termosPt = $this->extrairTermosBase($textoPt, $this->stopwordsPt);
        $termosEn = $textoEn === ''
            ? []
            : $this->extrairTermosBase($textoEn, $this->stopwordsEn, $this->keywordsEnCurtasPermitidas);

        return [
            'keywords_pt' => implode(', ', array_unique($termosPt)),
            'keywords_en' => implode(', ', array_unique($termosEn)),
        ];
    }

    /**
     * Isola as palavras mais relevantes filtrando ruído e pontuação.
     */
    protected function extrairTermosBase(string $texto, array $stopwords = [], array $curtasPermitidas = []): array
    {
        // Converte para minúsculas e remove pontuação
        $limpo = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', mb_strtolower($texto));
        $palavras = array_filter(explode(' ', $limpo));

        $relevantes = [];
        foreach ($palavras as $palavra) {
            $palavraSemAcento = $this->removerAcentos($palavra);

            // Aceita apenas palavras com mais de 3 letras que não sejam stopwords
            if (
                (mb_strlen($palavra) > 3 || in_array($palavraSemAcento, $curtasPermitidas, true))
                && !in_array($palavraSemAcento, $stopwords, true)
            ) {
                $relevantes[] = $palavra;
            }
        }

        // Devolve os 6 termos mais frequentes/relevantes
        $frequencias = array_count_values($relevantes);
        arsort($frequencias);

        return array_slice(array_keys($frequencias), 0, 6);
    }

    /**
     * Remove acentos para facilitar comparações no dicionário.
     */
    protected function removerAcentos(string $texto): string
    {
        return preg_replace(
            '~&([a-z]{1,2})(?:acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml);~i',
            '$1',
            htmlentities($texto, ENT_QUOTES, 'UTF-8')
        );
    }
}
