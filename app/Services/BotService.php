<?php

namespace App\Services;

use App\Models\Faq; // 1. Usamos apenas o Model Faq
use Illuminate\Support\Facades\Log;

class BotService
{
    public function processarMensagem(string $pergunta): array
    {
        try {
            $perguntaLimpa = $this->limparTexto($pergunta);

            Log::info("=== BOT DIAGNÓSTICO INÍCIO ===");
            Log::info("Entrada Utilizador: '{$pergunta}' | Limpa: '{$perguntaLimpa}'");

            // 1. Saudações
            $respostaSaudacao = $this->verificarSaudacao($perguntaLimpa);
            if ($respostaSaudacao) {
                return $respostaSaudacao;
            }

            $faqs = Faq::where('ativo', true)->whereNotNull('pergunta')->get();

            if ($faqs->isEmpty()) {
                Log::warning('BotService: Nenhuma FAQ ativa encontrada.');
                return $this->respostaDefault();
            }

            // Lista expandida de stopwords (palavras a ignorar)
            $stopwords = [
                'como', 'para', 'onde', 'qual', 'quais', 'quem', 'posso', 'consigo', 'fazer',
                'quer', 'quero', 'com', 'que', 'uma', 'uns', 'umas', 'pelo', 'pela', 'sobre',
                'saber', 'gostaria', 'preciso', 'ajuda', 'favor', 'obrigado', 'este', 'esta',
                'ter', 'tens'
            ];

            // Verbos/palavras de ação genéricas (pontuação reduzida)
            $verbosGenericos = [
                'mudar', 'alterar', 'trocar', 'pedir', 'saber', 'ver', 'fazer',
                'obter', 'cancelar', 'posso', 'consigo', 'como', 'onde', 'qual'
            ];

            // Extrai palavras significativas da pergunta do utilizador
            $palavrasUtilizador = array_values(array_filter(
                explode(' ', $perguntaLimpa),
                fn($p) => mb_strlen($p) >= 3 && !in_array($p, $stopwords)
            ));

            Log::info("Palavras da pergunta consideradas: " . json_encode($palavrasUtilizador));

            if (empty($palavrasUtilizador)) {
                // Fallback para termos curtos
                $palavrasUtilizador = array_values(array_filter(
                    explode(' ', $perguntaLimpa),
                    fn($p) => mb_strlen($p) >= 2
                ));
            }

            if (empty($palavrasUtilizador)) {
                return $this->respostaDefault();
            }

            $totalPalavrasUtilizador = count($palavrasUtilizador);
            $resultados = [];

            foreach ($faqs as $item) {
                $perguntaBdLimpa = $this->limparTexto($item->pergunta ?? '');
                $keywordsBdLimpa = $this->limparTexto($item->keywords ?? '');

                if (empty($perguntaBdLimpa) && empty($keywordsBdLimpa)) {
                    continue;
                }

                $pontuacao = 0;
                $palavrasComuns = [];
                $primeiraPosicao = 999;

                // 1. Verificação de correspondência exata da frase inteira (Prioridade máxima)
                if (!empty($perguntaBdLimpa) && (str_contains($perguntaBdLimpa, $perguntaLimpa) || str_contains($perguntaLimpa, $perguntaBdLimpa))) {
                    $pontuacao += 30.0;
                    $primeiraPosicao = 0;
                    $palavrasComuns = $palavrasUtilizador;
                } else {
                    // 2. Avaliação palavra por palavra
                    $textoBd = trim($perguntaBdLimpa . ' ' . $keywordsBdLimpa);
                    $palavrasBd = array_values(array_filter(
                        explode(' ', $textoBd),
                        fn($p) => mb_strlen($p) >= 3 && !in_array($p, $stopwords)
                    ));

                    foreach ($palavrasUtilizador as $indexUser => $pUser) {
                        foreach ($palavrasBd as $pBd) {
                            $match = false;

                            // A) Cálculo dinâmico do peso
                            if (in_array($pUser, $verbosGenericos)) {
                                $pesoBase = 2.0; // Verbos genéricos valem pouco
                            } else {
                                // Substantivos/termos específicos (palavras longas ganham destaque automático)
                                $pesoBase = (mb_strlen($pUser) >= 6) ? 10.0 : 7.0;
                            }

                            // B) Avaliação do Match
                            // Correspondência exata da palavra (100% do peso)
                            if ($pUser === $pBd) {
                                $pontuacao += $pesoBase;
                                $match = true;
                            }
                            // Plural / Similaridade (80% do peso)
                            elseif ($this->saoSemelhantesPlural($pUser, $pBd)) {
                                $pontuacao += ($pesoBase * 0.8);
                                $match = true;
                            }
                            // Radical / Substring (50% do peso - seguro para 'alter' ou 'reserv')
                            elseif (mb_strlen($pUser) >= 4 && mb_strlen($pBd) >= 4 && (str_contains($pBd, $pUser) || str_contains($pUser, $pBd))) {
                                $pontuacao += ($pesoBase * 0.5);
                                $match = true;
                            }

                            if ($match) {
                                $palavrasComuns[] = $pUser;
                                if ($indexUser < $primeiraPosicao) {
                                    $primeiraPosicao = $indexUser;
                                }
                                break; // Passa à próxima palavra da pergunta do utilizador
                            }
                        }
                    }
                }

                $palavrasComunsUnicas = array_values(array_unique($palavrasComuns));
                $qtdPalavrasComuns = count($palavrasComunsUnicas);

                // Cálculo da percentagem de cobertura da pergunta do utilizador
                $cobertura = $totalPalavrasUtilizador > 0 ? ($qtdPalavrasComuns / $totalPalavrasUtilizador) : 0;

                // Regista no log para diagnóstico
                if ($pontuacao > 0) {
                    Log::info("FAQ ID {$item->id} | Pergunta: \"{$item->pergunta}\" | Pontuação: {$pontuacao} | Cobertura: " . round($cobertura * 100) . "% | Primeira Pos: {$primeiraPosicao}");
                }

                // Critério de inclusão: Mínimo 4.0 pontos E pelo menos 50% de cobertura das palavras do utilizador
                if ($pontuacao >= 4.0 && $cobertura >= 0.5) {
                    $resultados[] = [
                        'item' => $item,
                        'pontuacao' => $pontuacao,
                        'cobertura' => $cobertura,
                        'primeiraPosicao' => $primeiraPosicao,
                        'palavrasComuns' => $palavrasComunsUnicas
                    ];
                }
            }

            if (empty($resultados)) {
                Log::info("Nenhum resultado atingiu a pontuação e cobertura mínimas.");
                return $this->respostaDefault();
            }

            // Ordenação estrita: 1º Maior Pontuação | 2º Maior Cobertura | 3º Ordem da Palavra
            usort($resultados, function ($a, $b) {
                if ($a['pontuacao'] !== $b['pontuacao']) {
                    return $b['pontuacao'] <=> $a['pontuacao'];
                }
                if ($a['cobertura'] !== $b['cobertura']) {
                    return $b['cobertura'] <=> $a['cobertura'];
                }
                return $a['primeiraPosicao'] <=> $b['primeiraPosicao'];
            });

            Log::info("Vencedor selecionado: FAQ ID {$resultados[0]['item']->id} - \"{$resultados[0]['item']->pergunta}\"");
            Log::info("=== BOT DIAGNÓSTICO FIM ===");

            /** @var Faq $primeiroItem */
            $primeiroItem = $resultados[0]['item'];
            $textoPrincipal = $primeiroItem->resposta ?? 'Sem resposta definida.';
            $opcoesSecundarias = [];

            if (count($resultados) > 1) {
                // Limita a no máximo 3 sugestões secundárias
                $outrosResultados = array_slice($resultados, 1, 3);

                foreach ($outrosResultados as $resSecundario) {
                    /** @var Faq $itemSecundario */
                    $itemSecundario = $resSecundario['item'];
                    $palavrasComuns = $resSecundario['palavrasComuns'] ?? [];
                    $strPalavras = is_array($palavrasComuns) ? implode(' ', $palavrasComuns) : (string) $palavrasComuns;

                    $opcoesSecundarias[] = [
                        'label' => "Saber mais sobre " . $itemSecundario->pergunta,
                        'id_tema' => $itemSecundario->id,
                        'mensagem_simulada' => $strPalavras
                    ];
                }

                // Opção fixa para o Help Center
                $opcoesSecundarias[] = [
                    'label' => '🔍 Ver mais no Help Center',
                    'id_tema' => 'help_center',
                    'url' => config('app.help_center_url', 'https://o-teu-help-center.com'),
                    'mensagem_simulada' => 'Quero ir para o Help Center'
                ];

                try {
                    $p1 = (array) ($resultados[0]['palavrasComuns'] ?? []);
                    $p2 = (array) ($outrosResultados[0]['palavrasComuns'] ?? []);
                    $palavrasNovas = array_diff($p2, $p1);

                    if (!empty($palavrasNovas)) {
                        $termoDiferente = implode(', ', $palavrasNovas);
                        $textoPrincipal .= "\n\n💡 Notei que também mencionaste \"{$termoDiferente}\". Desejas saber mais sobre isso?";
                    } else {
                        $perguntaOutraFaq = $outrosResultados[0]['item']->pergunta ?? '';
                        if ($perguntaOutraFaq !== '') {
                            $textoPrincipal .= "\n\n💡 Também podes ter interesse em saber: \"{$perguntaOutraFaq}\".";
                        }
                    }
                } catch (\Throwable $eLogic) {
                    Log::warning('Erro na construção da sugestão secundária: ' . $eLogic->getMessage());
                }
            }

            return [
                'texto' => $textoPrincipal,
                'opcoes' => $opcoesSecundarias
            ];

        } catch (\Throwable $e) {
            Log::error('Erro no BotService: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'texto' => "⚠️ Ocorreu um erro interno ao processar a tua mensagem.",
                'opcoes' => []
            ];
        }
    }

    protected function verificarSaudacao(string $perguntaLimpa): ?array
    {
        $saudacoes = ['ola', 'oi', 'boa tarde', 'bom dia', 'boa noite', 'hey', 'start', 'inicio'];

        if (in_array($perguntaLimpa, $saudacoes)) {
            return [
                'texto' => "Olá! Bem-vindo ao SpaceHub! 🚀 Em que te posso ajudar hoje?",
                'opcoes' => []
            ];
        }

        return null;
    }

    protected function saoSemelhantesPlural(string $p1, string $p2): bool
    {
        return ($p1 . 's' === $p2) || ($p2 . 's' === $p1) || (rtrim($p1, 's') === rtrim($p2, 's'));
    }

    protected function respostaDefault(): array
    {
        return [
            'texto' => "Desculpe, ainda sou um robô em treino no SpaceHub. Não consegui encontrar uma resposta para a sua pergunta. Tente perguntar sobre reservas, espaços  ou login!",
            'opcoes' => []
        ];
    }

    protected function limparTexto(string $texto): string
    {
        // Limpeza segura de acentos com fallback se intl falhar
        if (function_exists('transliterator_transliterate')) {
            $transliterado = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $texto);
            $texto = ($transliterado !== false && $transliterado !== null) ? $transliterado : $texto;
        } else {
            $texto = mb_strtolower($texto, 'UTF-8');
            $texto = strtr(utf8_decode($texto), utf8_decode('àáâãäçèéêëìíîïñòóôõöùúûüýÿ'), 'aaaaaceeeeiiiinooooouuuuyy');
        }

        // Mantém apenas caracteres alfanuméricos e espaços
        $texto = preg_replace('/[^a-z0-9\s]/', '', $texto);

        return trim(preg_replace('/\s+/', ' ', $texto));
    }
}
