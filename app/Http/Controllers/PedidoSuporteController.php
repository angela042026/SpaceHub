<?php

namespace App\Http\Controllers;

use App\Models\PedidoSuporte;
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

    /** Marca um pedido de suporte como resolvido. */
    public function update(string $id)
    {
        // Obtém o pedido de suporte
        $pedido = PedidoSuporte::findOrFail($id);

        // Atualiza o estado
        $pedido->update([
            'estado' => 'Resolvido',
        ]);

        return redirect()
            ->route('support.index')
            ->with('success', 'Pedido de suporte marcado como resolvido.');
    }

    /**Apresenta o formulário de contacto. */
    public function create()
    {
        return Inertia::render('Support/Create');
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
