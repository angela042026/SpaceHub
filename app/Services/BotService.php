<?php

namespace App\Services;

use App\Models\Faq;
use Illuminate\Support\Facades\Log;

class BotService
{
    public function processarMensagem(string $pergunta): array
    {
        try {
            $perguntaLimpa = $this->limparTexto($pergunta);

            Log::info("=== BOT DIAGNÓSTICO INÍCIO ===");
            Log::info("Entrada Utilizador: '{$pergunta}' | Limpa: '{$perguntaLimpa}'");

            // 1. Deteção de Saudações (Tratado diretamente no código)
            $respostaSaudacao = $this->verificarSaudacao($perguntaLimpa);
            if ($respostaSaudacao) {
                return $respostaSaudacao;
            }

            // 2. Deteção de Despedidas (Tratado diretamente no código)
            $respostaDespedida = $this->verificarDespedida($perguntaLimpa);
            if ($respostaDespedida) {
                return $respostaDespedida;
            }

            // 3. Deteção de Agradecimentos (Tratado diretamente no código)
            $respostaAgradecimento = $this->verificarAgradecimento($perguntaLimpa);
            if ($respostaAgradecimento) {
                return $respostaAgradecimento;
            }

            // 4. Carregar FAQs ativas da Base de Dados
            $faqs = Faq::where('ativo', true)->get();

            // 5. Deteção de Continuidade (Tratado diretamente no código)
            $respostaContinuidade = $this->verificarContinuidade($perguntaLimpa);
            if ($respostaContinuidade) {
                return $respostaContinuidade;
            }

            if ($faqs->isEmpty()) {
                Log::warning('BotService: Nenhuma FAQ ativa encontrada na base de dados.');
                return $this->respostaDefault();
            }

            // Remove apenas artigos/preposições muito irrelevantes
            $stopwords = ['de', 'do', 'da', 'dos', 'das', 'um', 'uma', 'uns', 'umas', 'em', 'no', 'na', 'nos', 'nas', 'com', 'por', 'para', 'que', 'os', 'as', 'e'];

            // Extrai as palavras que o utilizador escreveu
            $palavrasUtilizador = array_values(array_filter(
                explode(' ', $perguntaLimpa),
                fn($p) => mb_strlen($p) >= 2 && !in_array($p, $stopwords)
            ));

            if (empty($palavrasUtilizador)) {
                $palavrasUtilizador = explode(' ', $perguntaLimpa);
            }

            $resultados = [];

            // 4. Pesquisa focada nas colunas KEYWORDS e RESPOSTA
            foreach ($faqs as $faq) {
                $keywordsBD = $this->limparTexto($faq->keywords ?? '');
                $respostaBD = $this->limparTexto($faq->resposta ?? '');
                $perguntaBD = $this->limparTexto($faq->pergunta ?? '');

                $pontuacao = 0;

                foreach ($palavrasUtilizador as $palavra) {
                    $radical = preg_replace('/(s|es|is|oes)$/', '', $palavra); // ex: "salas" -> "sala"

                    // A) Correspondência na coluna KEYWORDS (Peso Mais Alto)
                    if (!empty($keywordsBD)) {
                        if (str_contains($keywordsBD, $palavra)) {
                            $pontuacao += 20;
                        } elseif (mb_strlen($radical) >= 3 && str_contains($keywordsBD, $radical)) {
                            $pontuacao += 15;
                        }
                    }

                    // B) Correspondência na coluna RESPOSTA
                    if (!empty($respostaBD)) {
                        if (str_contains($respostaBD, $palavra)) {
                            $pontuacao += 10;
                        } elseif (mb_strlen($radical) >= 3 && str_contains($respostaBD, $radical)) {
                            $pontuacao += 7;
                        }
                    }

                    // C) Correspondência na coluna PERGUNTA (se existir)
                    if (!empty($perguntaBD)) {
                        if (str_contains($perguntaBD, $palavra) || (mb_strlen($radical) >= 3 && str_contains($perguntaBD, $radical))) {
                            $pontuacao += 5;
                        }
                    }
                }

                if ($pontuacao > 0) {
                    Log::info("FAQ ID {$faq->id} | Keywords: \"{$faq->keywords}\" | Pontuação: {$pontuacao}");

                    $resultados[] = [
                        'faq' => $faq,
                        'pontuacao' => $pontuacao
                    ];
                }
            }

            // Se nenhuma FAQ na BD corresponder às palavras do utilizador
            if (empty($resultados)) {
                Log::info("Nenhuma FAQ correspondeu às keywords/resposta pesquisadas.");
                return $this->respostaDefault();
            }

            // Ordena as FAQs da maior para a menor pontuação
            usort($resultados, fn($a, $b) => $b['pontuacao'] <=> $a['pontuacao']);

            /** @var Faq $melhorFaq */
            $melhorFaq = $resultados[0]['faq'];
            Log::info("FAQ Selecionada: ID {$melhorFaq->id}");

            // Monta opções secundárias para perguntas semelhantes (se existirem mais)
            $opcoesSecundarias = [];
            if (count($resultados) > 1) {
                $outros = array_slice($resultados, 1, 3);
                foreach ($outros as $res) {
                    $label = $res['faq']->pergunta ?? $res['faq']->keywords;
                    $opcoesSecundarias[] = [
                        'label' => "Saber mais: " . $label,
                        'id_tema' => $res['faq']->id,
                        'mensagem_simulada' => $label
                    ];
                }
            }

            return [
                'texto' => $melhorFaq->resposta,
                'opcoes' => $opcoesSecundarias
            ];

        } catch (\Throwable $e) {
            Log::error('Erro no BotService: ' . $e->getMessage());

            return [
                'texto' => "⚠️ Ocorreu um erro ao consultar a base de dados de respostas.",
                'opcoes' => []
            ];
        }
    }

    protected function verificarSaudacao(string $perguntaLimpa): ?array
    {
        $saudacoes = ['ola', 'oi', 'boa tarde', 'bom dia', 'boa noite', 'hey', 'boas', 'tudo bem', 'como vais'];

        foreach ($saudacoes as $s) {
            if ($perguntaLimpa === $s || str_starts_with($perguntaLimpa, $s . ' ')) {
                return [
                    'texto' => "Olá! Bem-vindo ao SpaceHub! 🚀 Em que te posso ajudar hoje?",
                    'opcoes' => []
                ];
            }
        }

        return null;
    }

    protected function verificarAgradecimento(string $perguntaLimpa): ?array
    {
        $agradecimentos = [
            'obrigado', 'obrigada', 'valeu', 'obg'
        ];

        foreach ($agradecimentos as $a) {
            if ($perguntaLimpa === $a || str_contains($perguntaLimpa, $a)) {
                return [
                    'texto' => "De nada! Se precisares de mais alguma coisa em relação ao SpaceHub, estarei por aqui. Até à próxima! 👋",
                    'opcoes' => []
                ];
            }
        }

        return null;
    }
    protected function verificarDespedida(string $perguntaLimpa): ?array
    {
        $despedidas = [
            'adeuz', 'adeus', 'tchau', 'chau', 'ate logo', 'ate ja', 'ate amanha',
            'fim', 'sair'
        ];

        foreach ($despedidas as $d) {
            if ($perguntaLimpa === $d || str_contains($perguntaLimpa, $d)) {
                return [
                    'texto' => "Até já! Se precisares de mais alguma coisa em relação ao SpaceHub, estarei por aqui. 👋",
                    'opcoes' => []
                ];
            }
        }

        return null;
    }

    protected function verificarContinuidade(string $perguntaLimpa): ?array
    {
        $continuidades = [
            'outra pergunta', 'outra questao', 'mais uma pergunta', 'mais uma questao', 'espera'
        ];

        foreach ($continuidades as $d) {
            if ($perguntaLimpa === $d || str_contains($perguntaLimpa, $d)) {
                return [
                    'texto' => "Claro! Como posso ajudar?",
                    'opcoes' => []
                ];
            }
        }

        return null;
    }

    protected function respostaDefault(): array
    {
        return [
            'texto' => "Desculpe, ainda sou um robô em treino no SpaceHub. Não consegui encontrar uma resposta para a sua pergunta. Tente perguntar sobre reservas, espaços ou login!",
            'opcoes' => []
        ];
    }

    protected function limparTexto(string $texto): string
    {
        $texto = mb_strtolower($texto, 'UTF-8');

        $mapaAcentos = [
            'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'ç'=>'c',
            'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i',
            'î'=>'i', 'ï'=>'i', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o',
            'õ'=>'o', 'ö'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ü'=>'u'
        ];
        $texto = strtr($texto, $mapaAcentos);

        // Remove pontuação mantendo letras, números e espaços
        $texto = preg_replace('/[^a-z0-9\s]/', '', $texto);

        return trim(preg_replace('/\s+/', ' ', $texto));
    }
}
