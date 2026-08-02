import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function ChatBot({ aoVoltar }) {
    const { auth } = usePage().props;
    const nomeDoUtilizador = auth?.user ? auth.user.name : 'Utilizador';

    const [input, setInput] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagens, setMensagens] = useState([
        { id: 1, emissor: 'bot', texto: `Olá, ${nomeDoUtilizador}! 👋\nBem-vindo ao suporte do SpaceHub. Como posso ajudar hoje?`, opcoes: [] }
    ]);

    const fimMensagensRef = useRef(null);
    const inputRef = useRef(null); // 1. Ref criada aqui

    // Auto-scroll para a última mensagem
    useEffect(() => {
        fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens, carregando]);

    const enviarMensagemParaBackend = async (textoMensagem) => {
        if (!textoMensagem.trim() || carregando) return;

        const novaMensagemUser = { id: Date.now(), emissor: 'user', texto: textoMensagem };
        setMensagens(prev => [...prev, novaMensagemUser]);
        setInput('');
        setCarregando(true);

        try {
            const resposta = await axios.post('/chat/enviar', {
                mensagem: textoMensagem
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            const dadosBot = resposta.data;

            setMensagens(prev => [...prev, {
                id: Date.now() + 1,
                emissor: 'bot',
                texto: typeof dadosBot === 'string' ? dadosBot : (dadosBot.texto || dadosBot.resposta),
                opcoes: dadosBot.opcoes || []
            }]);

        } catch (error) {
            console.error('Erro ao comunicar com o BotService:', error);
            setMensagens(prev => [...prev, {
                id: Date.now() + 1,
                emissor: 'bot',
                texto: 'Ops! Ocorreu um erro ao ligar ao servidor do SpaceHub. Tenta novamente dentro de momentos. 🤖',
                opcoes: []
            }]);
        } finally {
            setCarregando(false);

            // 2. Garante que o foco volta ao input assim que o estado 'carregando' passa a false
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const lidarComEnvioForm = (e) => {
        e.preventDefault();
        enviarMensagemParaBackend(input);
    };

    const lidarComCliqueOpcao = (opcao) => {
        const textoAEnviar = opcao.mensagem_simulada || opcao.label;
        enviarMensagemParaBackend(textoAEnviar);
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 relative">

            {/* Imagem de fundo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <img
                    src="/images/logo/spacehub-logo.png"
                    alt="SpaceHub Watermark"
                    className="w-48 h-48 object-contain opacity-[0.04] dark:opacity-[0.02] grayscale"
                />
            </div>

            {/* Cabeçalho */}
            <div className="relative z-10 flex items-center gap-3 bg-teal-600 px-4 py-3 text-white shadow-md">
                {aoVoltar && (
                    <button
                        onClick={aoVoltar}
                        className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                        title="Voltar ao menu principal"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                    <Bot size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold leading-tight">Assistente Virtual</h4>
                    <span className="text-[11px] text-teal-100 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" /> Disponível
                    </span>
                </div>
            </div>

            {/* Balões de Conversa */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar">
                {mensagens.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                        <div
                            className={`flex items-start gap-2.5 max-w-[85%] ${msg.emissor === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                            <div className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold overflow-hidden
                                ${msg.emissor === 'user' ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                            >
                                {msg.emissor === 'user' ? (
                                    auth?.user?.photo ? (
                                        <img
                                            src={auth.user.photo}
                                            alt={nomeDoUtilizador}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User size={14} className="text-white stroke-[2.5]" />
                                    )
                                ) : (
                                    <Bot size={14} />
                                )}
                            </div>

                            <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm leading-relaxed break-words whitespace-pre-line
                                ${msg.emissor === 'user'
                                    ? 'bg-teal-500 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800'}`}
                            >
                                {msg.texto}
                            </div>
                        </div>

                        {msg.emissor === 'bot' && msg.opcoes && msg.opcoes.length > 0 && (
                            <div className="flex flex-wrap gap-2 pl-9">
                                {msg.opcoes.map((opcao, index) => (
                                    <button
                                        key={index}
                                        onClick={() => lidarComCliqueOpcao(opcao)}
                                        disabled={carregando}
                                        className="text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60 dark:hover:bg-teal-900/50 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        💡 {opcao.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {carregando && (
                    <div className="flex items-center gap-2 max-w-[85%] mr-auto">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">
                            <Bot size={14} />
                        </div>
                        <div className="rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-400 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={fimMensagensRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={lidarComEnvioForm}
                className="relative z-10 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2"
            >
                <input
                    ref={inputRef} // 3. Ref ligada aqui
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte-me algo (ex: login, preço, reserva)..."
                    disabled={carregando}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || carregando}
                    aria-label="Enviar mensagem"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/10 transition-all hover:bg-teal-600 disabled:opacity-40 disabled:hover:bg-teal-500 active:scale-95"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
