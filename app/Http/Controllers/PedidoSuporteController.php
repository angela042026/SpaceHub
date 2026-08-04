<?php

namespace App\Http\Controllers;

use App\Models\PedidoSuporte;
use App\Notifications\SuporteRespondidoNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PedidoSuporteController extends Controller
{
    /** Lista todos os pedidos de suporte. */
    public function index()
    {
        // Obtém todos os pedidos de suporte
        $pedidos = PedidoSuporte::with('user')
            ->latest()
            ->get();

        return Inertia::render('Support/Index', [
            'pedidos' => $pedidos,
        ]);
    }

    /** Apresenta os detalhes de um pedido de suporte. */
    public function show(string $id)
    {
        // Obtém o pedido de suporte
        $pedido = PedidoSuporte::with('user')
            ->findOrFail($id);

        return Inertia::render('Support/Show', [
            'pedido' => $pedido,
        ]);
    }

    /** Regista a resposta do admin/gestor e marca o pedido como resolvido. */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'resposta' => ['required', 'string', 'min:5'],
        ]);

        // Obtém o pedido de suporte
        $pedido = PedidoSuporte::findOrFail($id);

        // Atualiza a resposta e o estado
        $pedido->update([
            'resposta' => $request->resposta,
            'estado' => 'Resolvido',
        ]);

        // Avisa o utilizador que o pedido foi respondido
        $pedido->user?->notify(new SuporteRespondidoNotification($pedido));

        return redirect()
            ->route('support.index')
            ->with('success', 'Resposta enviada e pedido marcado como resolvido.');
    }

    /**Apresenta o formulário de contacto. */
    public function create()
    {
        // Pedidos anteriores do próprio utilizador, para ver o estado/resposta
        $meusPedidos = PedidoSuporte::where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('Support/Create', [
            'meusPedidos' => $meusPedidos,
        ]);
    }

    /** Guarda um novo pedido de suporte.*/
    public function store(Request $request)
    {
        // Validação dos dados
        $request->validate([
            'assunto' => ['required', 'string', 'max:255'],
            'mensagem' => ['required', 'string', 'min:10'],
        ]);

        // Cria o pedido de suporte
        PedidoSuporte::create([
            'user_id' => Auth::id(),
            'assunto' => $request->assunto,
            'mensagem' => $request->mensagem,
            'estado' => 'Pendente',
        ]);


        return redirect()
            ->route('faqs.index')
            ->with('success', 'Pedido de suporte enviado com sucesso.');
    }
}
