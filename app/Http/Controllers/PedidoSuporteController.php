<?php

namespace App\Http\Controllers;

use App\Models\PedidoSuporte;
use App\Notifications\SuporteRespondidoNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PedidoSuporteController extends Controller
{
    private const POR_PAGINA = 10;

    /** Lista os pedidos de suporte, com filtro por estado, pesquisa e paginação. */
    public function index(Request $request)
    {
        $query = PedidoSuporte::query()->with('user');

        $estado = $request->filled('estado') ? $request->input('estado') : 'todos';

        if ($estado !== 'todos') {
            $query->where('estado', $estado);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('assunto', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));

                // "#SUP-024" ou "24" também encontra o pedido pelo id.
                if (is_numeric($search)) {
                    $query->orWhere('id', (int) $search);
                }
            });
        }

        $pedidos = $query
            ->latest()
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        // Contagens por estado (independentes dos filtros aplicados acima)
        // para os 4 cards de resumo e para o número junto de cada pill de
        // filtro — só leitura, não interfere com o fluxo de resposta.
        $contagens = PedidoSuporte::query()
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $totalGeral = (int) $contagens->sum();
        $abertos = (int) ($contagens['Pendente'] ?? 0);
        $emTratamento = (int) ($contagens['Em análise'] ?? 0);
        $resolvidos = (int) ($contagens['Resolvido'] ?? 0);

        return Inertia::render('Support/Index', [
            'pedidos' => $pedidos,
            'filters' => $request->only(['estado', 'search']),
            'stats' => [
                'total' => $totalGeral,
                'abertos' => $abertos,
                'emTratamento' => $emTratamento,
                'resolvidos' => $resolvidos,
                'porEstado' => [
                    'todos' => $totalGeral,
                    'Pendente' => $abertos,
                    'Em análise' => $emTratamento,
                    'Resolvido' => $resolvidos,
                ],
            ],
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

    /**
     * Marca um pedido pendente como "Em análise" — passo intermédio
     * opcional antes de responder, para sinalizar aos outros
     * admins/gestores que já está a ser tratado. Não exige resposta
     * (essa continua a acontecer só em update(), ao resolver).
     */
    public function marcarEmAnalise(string $id)
    {
        $pedido = PedidoSuporte::findOrFail($id);

        if ($pedido->estado !== 'Pendente') {
            return redirect()
                ->back()
                ->with('error', __('Só pedidos pendentes podem ser marcados como em análise.'));
        }

        $pedido->update(['estado' => 'Em análise']);

        return redirect()
            ->back()
            ->with('success', __('Pedido marcado como em análise.'));
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
            ->with('success', __('Resposta enviada e pedido marcado como resolvido.'));
    }

    /**Apresenta o formulário de contacto. */
    public function create()
    {
        // Pedidos anteriores do próprio utilizador, para ver o estado/resposta.
        // Limitado aos 20 mais recentes — sem isto, o payload desta página
        // crescia sem limite para um utilizador com muitos pedidos ao
        // longo do tempo.
        $meusPedidos = PedidoSuporte::where('user_id', Auth::id())
            ->latest()
            ->take(20)
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
            ->with('success', __('Pedido de suporte enviado com sucesso.'));
    }
}
