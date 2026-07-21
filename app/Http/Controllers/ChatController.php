<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\EnviarMensagem;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    private function gerarRespostaDoBot(string $pergunta)
    {
        if (trim($pergunta) === '') {
            return back();
        }

        $dadosResposta = $this->processarMensagem($pergunta);

        broadcast(new EnviarMensagem('Bot SpaceHub 🤖', $dadosResposta['texto'], $dadosResposta['opcoes']));

        return back();
    }

    public function enviarMensagem(Request $request)
    {
        $request->validate([
            'mensagem' => 'required|string|max:1000',
        ]);

        $utilizador = Auth::user();

        $nomeDoUtilizador = $utilizador ? $utilizador->name : 'Convidado';

        broadcast(new EnviarMensagem($nomeDoUtilizador, $request->mensagem, []))->toOthers();

        return $this->gerarRespostaDoBot($request->mensagem);
    }

    public function processarMensagem(string $pergunta): array
    {
        $perguntaLimpa = mb_strtolower(trim($pergunta), 'UTF-8');

        $procurar = ['á', 'à', 'ã', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'];
        $substituir = ['a', 'a', 'a', 'a', 'e', 'e', 'i', 'o', 'o', 'o', 'u', 'c'];
        $perguntaLimpa = str_replace($procurar, $substituir, $perguntaLimpa);

        $dicionario = [
            'saudacao' => [
                'chaves' => ['ola', 'oi', 'ajuda', 'bom dia', 'boa tarde', 'boa noite'],
                'nome' => 'Saudação',
                'resposta' => "Olá! Bem-vindo ao SpaceHub. Como posso ajudar? 🚀"
            ],
            'precos' => [
                'chaves' => ['preco', 'precos', 'valores', 'plano', 'planos', 'pagar', 'valor', 'custo', 'custos'],
                'nome' => 'Preços e Planos',
                'resposta' => "Os nossos planos de Coworking começam em 49€/mês para secretárias partilhadas! 💼"
            ],
            'espaco' => [
                'chaves' => ['espaco', 'local', 'morada', 'onde', 'instalacoes', 'comunidade', 'cafe', 'internet', 'wifi'],
                'nome' => 'O Nosso Espaço',
                'resposta' => "Temos salas de reunião modernas, internet ultra-rápida e café grátis à descrição! ☕"
            ],
            'reservas' => [
                'chaves' => ['reserva', 'reservar'],
                'nome' => 'Reservas',
                'resposta' => "Para reservar uma sala de reunião ou secretária, basta aceder ao módulo correspondente no seu menu! 🗓️"
            ]
        ];

        $temasDetetados = [];

        foreach ($dicionario as $idTema => $dados) {
            foreach ($dados['chaves'] as $chave) {
                $padrao = '/\b' . preg_quote($chave, '/') . '\b/iu';

                if (preg_match($padrao, $perguntaLimpa, $matches, PREG_OFFSET_CAPTURE)) {
                    $posicao = $matches[0][1];
                    $temasDetetados[] = [
                        'id' => $idTema,
                        'posicao' => $posicao,
                        'triggerExata' => $chave
                    ];
                    break;
                }
            }
        }

        if (empty($temasDetetados)) {
            return [
                'texto' => "Desculpe, ainda sou um robô em treino no SpaceHub. A minha formação só me permite responder a perguntas sobre preços, espaços ou reservas.",
                'opcoes' => []
            ];
        }

        usort($temasDetetados, function ($a, $b) {
            return $a['posicao'] <=> $b['posicao'];
        });

        $primeiroTemaDados = $temasDetetados[0];
        $idPrimeiroTema = $primeiroTemaDados['id'];

        $textoPrincipal = $dicionario[$idPrimeiroTema]['resposta'];
        $opcoesSecundarias = [];

        if (count($temasDetetados) > 1) {
            $outrosTemasDados = array_slice($temasDetetados, 1);
            $nomesOutrosTemas = [];

            foreach ($outrosTemasDados as $temaSecundarioDados) {
                $idSecundario = $temaSecundarioDados['id'];
                $nomesOutrosTemas[] = $dicionario[$idSecundario]['nome'];

                $opcoesSecundarias[] = [
                    'label' => "Saber mais sobre " . $dicionario[$idSecundario]['nome'],
                    'id_tema' => $idSecundario,
                    'mensagem_simulada' => $temaSecundarioDados['triggerExata']
                ];
            }

            $listaNomes = implode(' e ', $nomesOutrosTemas);

            $triggerSecundariaExata = $outrosTemasDados[0]['triggerExata'];
            $textoPrincipal .= "\n\n💡 Notei que também mencionou \"{$triggerSecundariaExata}\". Deseja obter mais informação sobre este assunto?";
        } else {
            $textoPrincipal .= "\n\nTem mais alguma questão sobre " . $dicionario[$idPrimeiroTema]['nome'] . "?";
        }

        return [
            'texto' => $textoPrincipal,
            'opcoes' => $opcoesSecundarias
        ];
    }
}
