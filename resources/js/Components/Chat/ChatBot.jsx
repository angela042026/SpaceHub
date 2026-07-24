import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function ChatBot({ aoVoltar }) {
    const { auth } = usePage().props;
    const nomeDoUtilizador = auth?.user ? auth.user.name : 'Utilizador';

    const [input, setInput] = useState('');
    const [mensagens, setMensagens] = useState([
        { id: 1, emissor: 'bot', texto: `Olá, ${nomeDoUtilizador}! 👋\nBem-vindo ao suporte do SpaceHub. Como posso ajudar hoje?`, opcoes: [] }
    ]);
    const [mostrarBotoes, setMostrarBotoes] = useState(false);
    const [triggerPendente, setTriggerPendente] = useState(null);

    const fimMensagensRef = useRef(null);

    // Auto-scroll para a última mensagem
    useEffect(() => {
        fimMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens, mostrarBotoes]);

    const lidarComEnvio = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const pergunta = input;

        const novaMensagemUser = { id: Date.now(), emissor: 'user', texto: pergunta };
        setMensagens(prev => [...prev, novaMensagemUser]);
        setInput('');
        setMostrarBotoes(false);

        setTimeout(() => {
            let frase = pergunta.toLowerCase().trim();
            const procurar = ['á', 'à', 'ã', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'];
            const substituir = ['a', 'a', 'a', 'a', 'e', 'e', 'i', 'o', 'o', 'o', 'u', 'c'];
            procurar.forEach((letra, i) => {
                frase = frase.replaceAll(letra, substituir[i]);
            });

            const temas = [
                {
                    id: 'saudacao',
                    triggers: ['ola', 'oi', 'ajuda', 'bom dia', 'boa tarde', 'boa noite'],
                    resposta: "Olá! 👋\nComo posso ajudar?"
                },
                {
                    id: 'precos',
                    triggers: ['preco', 'precos', 'valores', 'plano', 'planos', 'pagar', 'valor', 'custo', 'custos'],
                    resposta: "Temos passes a partir de 8€ (meio-dia) e planos mensais a partir de 149€. Pode ver todos os detalhes na secção de Preços da página inicial! 💼"
                },
                {
                    id: 'espaco',
                    triggers: ['espaco', 'local', 'morada', 'onde', 'instalacoes', 'comunidade', 'cafe', 'internet', 'wifi'],
                    resposta: "Temos salas de reunião modernas, internet ultra-rápida e café grátis à descrição, disponível no lobby! ☕"
                },
                {
                    id: 'reservas',
                    triggers: ['reserva', 'reservar', 'reservas', 'sala', 'salas', 'secretaria', 'secretarias'],
                    resposta: "Para reservar uma sala de reunião ou secretária, basta aceder ao módulo correspondente no teu menu! 🗓️"
                }
            ];

            let temasEncontrados = [];

            temas.forEach(tema => {
                const triggerUsada = tema.triggers.find(t => {
                    const regex = new RegExp(`\\b${t}\\b`, 'i');
                    return regex.test(frase);
                });

                if (triggerUsada) {
                    const posicao = frase.indexOf(triggerUsada);
                    temasEncontrados.push({ ...tema, triggerExata: triggerUsada, posicaoNaFrase: posicao });
                }
            });

            if (temasEncontrados.length === 0) {
                setMensagens((prev) => [...prev, {
                    id: Date.now(),
                    emissor: 'bot',
                    texto: "Desculpe, ainda sou um robô em treino no SpaceHub. Por enquanto, posso ajudar com assuntos como 'preços', 'espaços' ou 'reservas'!"
                }]);
                return;
            }

            temasEncontrados.sort((a, b) => a.posicaoNaFrase - b.posicaoNaFrase);

            const primeiroTema = temasEncontrados[0];
            let respostaFinal = primeiroTema.resposta;

            if (temasEncontrados.length > 1) {
                const segundoTema = temasEncontrados[1];
                respostaFinal += `\n\n💡 Notei que também mencionou "${segundoTema.triggerExata}". Deseja obter mais informação sobre este assunto?`;

                setTriggerPendente(segundoTema);
                setMostrarBotoes(true);
            } else {
                setTriggerPendente(null);
            }

            setMensagens((prev) => [...prev, { id: Date.now(), emissor: 'bot', texto: respostaFinal }]);
        }, 800);
    };

    const lidarComEscolha = (querSaberMais) => {
        const proximoTema = triggerPendente;

        setMostrarBotoes(false);
        setTriggerPendente(null);

        if (querSaberMais && proximoTema) {
            setMensagens((prev) => [...prev, { id: Date.now(), emissor: 'user', texto: "Sim, quero saber mais." }]);

            setTimeout(() => {
                setMensagens((prev) => [...prev, {
                    id: Date.now() + 1,
                    emissor: 'bot',
                    texto: `${proximoTema.resposta}`
                }]);
            }, 800);
        } else {
            setMensagens((prev) => [...prev, { id: Date.now(), emissor: 'user', texto: "Já tenho a informação que procurava." }]);

            setTimeout(() => {
                setMensagens((prev) => [...prev, {
                    id: Date.now() + 1,
                    emissor: 'bot',
                    texto: "Excelente! Se precisar de mais ajuda, eu continuo deste lado. Bom trabalho no SpaceHub! 🚀"
                }]);
            }, 800);
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

                {/* Opções de Botões Alternativos */}
                {mostrarBotoes && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 pl-9 justify-start relative z-20">
                        <button
                            onClick={() => lidarComEscolha(false)}
                            className="bg-slate-500 hover:bg-slate-600 text-white border-none px-3 py-1.5 rounded-full text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                            Já tenho a informação que procurava
                        </button>
                        <button
                            onClick={() => lidarComEscolha(true)}
                            className="bg-teal-500 hover:bg-teal-600 text-white border-none px-3 py-1.5 rounded-full text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                            Sim, quero saber mais
                        </button>
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
                    disabled={!input.trim()}
                    aria-label="Enviar mensagem"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/10 transition-all hover:bg-teal-600 disabled:opacity-40 disabled:hover:bg-teal-500 active:scale-95"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
