<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\EnviarMensagem;

class ChatController extends Controller
{
    /**
     * Processa a mensagem do utilizador e gera uma resposta via WebSocket.
     */
    public function simularResposta(Request $request)
    {
        // Captura a mensagem que vem do useForm do React
        $pergunta = $request->input('mensagem', '');

        // Obtém o array com ['texto' => ..., 'opcoes' => ...]
        $dadosResposta = $this->processarMensagem($pergunta);

        // Dispara o WebSocket enviando os campos certos para o construtor do EnviarMensagem
        broadcast(new EnviarMensagem('Bot SpaceHub 🤖', $dadosResposta['texto'], $dadosResposta['opcoes']));

        // Retorna um redirecionamento válido para o Inertia
        return back();
    }

    /**
     * Dicionário com substituição direta de acentos (Public para evitar restrições de proxy)
     */
    public function processarMensagem(string $pergunta): array
    {
        // Converte para minúsculas garantindo suporte a UTF-8
        $perguntaLimpa = mb_strtolower(trim($pergunta), 'UTF-8');

        // Substituição manual direta e rápida dos acentos mais comuns em português
        $procurar   = ['á', 'à', 'ã', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'];
        $substituir = ['a', 'a', 'a', 'a', 'e', 'e', 'i', 'o', 'o', 'o', 'u', 'c'];
        $perguntaLimpa = str_replace($procurar, $substituir, $perguntaLimpa);

        // Dicionário com chaves SEM acentos
        $dicionario = [
            'saudacao' => [
                'chaves' => ['ola', 'oi', 'ajuda', 'bom dia', 'boa tarde'],
                'nome' => 'Saudação',
                'resposta' => "Olá! Bem-vindo ao SpaceHub. Procuras um lugar para trabalhar ou queres gerir salas? 🚀"
            ],
            'precos' => [
                'chaves' => ['preco', 'valores', 'plano', 'planos', 'pagar', 'valor'],
                'nome' => 'Preços e Planos',
                'resposta' => "Os nossos planos de Coworking começam em 49€/mês para secretarias partilhadas! 💼"
            ],
            'espaco' => [
                'chaves' => ['espaco', 'local', 'morada', 'onde', 'instalacoes', 'comunidade'],
                'nome' => 'O Nosso Espaço',
                'resposta' => "Temos salas de reunião modernas, internet ultra-rápida e café grátis à discrição! ☕"
            ],
            'reservas' => [
                'chaves' => ['reserva', 'reservar', 'sala', 'salas', 'secretaria', 'secretarias'],
                'nome' => 'Reservas',
                'resposta' => "Para reservar uma sala de reunião ou secretaria, basta acederes ao módulo correspondente no teu menu! 🗓️"
            ]
        ];

        // Detetar quais os temas presentes na frase limpa
        $temasDetetados = [];
        foreach ($dicionario as $idTema => $dados) {
            foreach ($dados['chaves'] as $chave) {
                if (str_contains($perguntaLimpa, $chave)) {
                    $temasDetetados[] = $idTema;
                    break;
                }
            }
        }

        // Construir a resposta com base nos temas encontrados
        if (empty($temasDetetados)) {
            return [
                'texto' => "Desculpa, ainda sou um robô em treino no SpaceHub. Podes perguntar por 'olá', 'preço', 'espaço' ou 'reserva'!",
                'opcoes' => []
            ];
        }

        $primeiroTema = $temasDetetados[0];
        $textoPrincipal = $dicionario[$primeiroTema]['resposta'];
        $opcoesSecundarias = [];

        if (count($temasDetetados) > 1) {
            $outrosTemas = array_slice($temasDetetados, 1);
            $nomesOutrosTemas = [];

            foreach ($outrosTemas as $temaSecundario) {
                $nomesOutrosTemas[] = $dicionario[$temaSecundario]['nome'];
                $opcoesSecundarias[] = [
                    'label' => "Saber mais sobre " . $dicionario[$temaSecundario]['nome'],
                    'id_tema' => $temaSecundario,
                    'mensagem_simulada' => $dicionario[$temaSecundario]['chaves'][0]
                ];
            }

            $listaNomes = implode(' e ', $nomesOutrosTemas);
            $textoPrincipal .= "\n\n💡 Notei que também mencionaste assuntos relacionados com: {$listaNomes}. O que desejas fazer?";
        } else {
            $textoPrincipal .= "\n\nTens mais alguma questão sobre " . $dicionario[$primeiroTema]['nome'] . "?";
        }

        return [
            'texto' => $textoPrincipal,
            'opcoes' => $opcoesSecundarias
        ];
    }
}
