import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function ChatBot({ aoVoltar, aoFechar }) {
    const { auth } = usePage().props;
    const nomeDoUtilizador = auth?.user ? auth.user.name : 'Utilizador';

    const [input, setInput] = useState('');
    const [mensagens, setMensagens] = useState([
        { id: 1, emissor: 'bot', texto: `Olá, ${nomeDoUtilizador}! 👋\nBem-vindo ao suporte do SpaceHub. Como posso ajudar hoje?`, opcoes: [] }
    ]);
    const [aEnviar, setAEnviar] = useState(false);

    const fimMensagensRef = useRef(null);

    // Auto-scroll para a última mensagem
    useEffect(() => {
        fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens, aEnviar]);

    const lidarComEnvio = async (e) => {
        e.preventDefault();
        if (!input.trim() || aEnviar) return;

        const pergunta = input;

        const novaMensagemUser = { id: Date.now(), emissor: 'user', texto: pergunta };
        setMensagens(prev => [...prev, novaMensagemUser]);
        setInput('');
        setAEnviar(true);

        try {
            const { data } = await axios.post(route('chat.mensagem'), {
                mensagem: pergunta,
            });

            setMensagens((prev) => [...prev, { id: Date.now() + 1, emissor: 'bot', texto: data.resposta }]);
        } catch {
            setMensagens((prev) => [...prev, {
                id: Date.now() + 1,
                emissor: 'bot',
                texto: "Desculpe, ocorreu um erro ao processar a sua questão. Tente novamente mais tarde.",
            }]);
        } finally {
            setAEnviar(false);
        }
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
                <div className="flex-1">
                    <h4 className="text-sm font-bold leading-tight">Assistente Virtual</h4>
                    <span className="text-[11px] text-teal-100 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" /> Disponível
                    </span>
                </div>
                {aoFechar && (
                    <button
                        onClick={aoFechar}
                        aria-label="Fechar chat"
                        className="rounded-lg p-1 hover:bg-white/10 transition-colors"
                        title="Fechar"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Balões de Conversa */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar">
                {mensagens.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 max-w-[85%] ${msg.emissor === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                        {/* Círculo do Avatar */}
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

                        {/* Balão de Texto */}
                        <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm leading-relaxed break-words whitespace-pre-line
                            ${msg.emissor === 'user'
                                ? 'bg-teal-500 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800'}`}
                        >
                            {msg.texto}
                        </div>
                    </div>
                ))}

                {/* Indicador de escrita enquanto aguarda resposta */}
                {aEnviar && (
                    <div className="flex items-center gap-2 pl-9 text-xs text-slate-400">
                        <Bot size={14} /> A escrever...
                    </div>
                )}

                <div ref={fimMensagensRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={lidarComEnvio}
                className="relative z-10 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte-me algo (ex: preço, espaço, reserva)..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || aEnviar}
                    aria-label="Enviar mensagem"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/10 transition-all hover:bg-teal-600 disabled:opacity-40 disabled:hover:bg-teal-500 active:scale-95"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
