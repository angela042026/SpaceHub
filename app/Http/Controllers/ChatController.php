<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\EnviarMensagem;
use App\Services\BotService;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    protected BotService $botService;

    // Injeção de dependência do serviço do bot
    public function __construct(BotService $botService)
    {
        $this->botService = $botService;
    }

    public function enviarMensagem(Request $request)
    {
        $mensagemTexto = $request->input('mensagem');

        // Executa a tua classe de backend com todos os triggers novos!
        $dadosResposta = $this->botService->processarMensagem($mensagemTexto);

        // Se usares broadcast para WebSockets podes manter:
        // broadcast(new EnviarMensagem('Bot SpaceHub 🤖', $dadosResposta['texto'], $dadosResposta['opcoes']));

        // Retorna a resposta em JSON diretamente para o Axios
        return response()->json([
            'texto' => $dadosResposta['texto'] ?? $dadosResposta,
            'opcoes' => $dadosResposta['opcoes'] ?? []
        ]);
    }   
}
