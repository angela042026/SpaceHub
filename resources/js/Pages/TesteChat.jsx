import React, { useEffect, useState, useRef } from 'react';

export default function TesteChat() {
    const [status, setStatus] = useState('A ligar ao Laravel Echo...');
    const [statusColor, setStatusColor] = useState('orange');
    const [mensagens, setMensagens] = useState([]);
    const [inputMensagem, setInputMensagem] = useState('');

    // ESTADOS PARA OS BOTÕES DINÂMICOS
    const [mostrarBotoes, setMostrarBotoes] = useState(false);
    const [triggerPendente, setTriggerPendente] = useState(null);

    const mensagensEndRef = useRef(null);

    const scrollToBottom = () => {
        mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensagens]);

    useEffect(() => {
        if (window.Echo) {
            setStatus('✅ Ligado ao Reverb (Modo Sandbox)!');
            setStatusColor('green');
            const canal = window.Echo.channel('chat');
            canal.listen('MensagemTeste', (dados) => {
                setMensagens((prev) => [...prev, { user: dados.user, texto: dados.texto }]);
            });
        } else {
            setStatus('❌ Erro: Laravel Echo não configurado.');
            setStatusColor('red');
        }
        return () => {
            if (window.Echo) window.Echo.leaveChannel('chat');
        };
    }, []);

    const enviarParaOBackend = (e) => {
        e.preventDefault();
        if (!inputMensagem.trim()) return;

        const pergunta = inputMensagem;
        setMensagens((prev) => [...prev, { user: 'Tu', texto: pergunta }]);
        setInputMensagem('');
        setMostrarBotoes(false);

        setTimeout(() => {
            const frase = pergunta.toLowerCase().trim();

            const temasDisponiveis = [
                {
                    id: 'saudacao',
                    nome: 'Saudações',
                    triggers: ['olá', 'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'ajuda', 'suporte', 'chat'],
                    resposta: "Olá! 👋\nBem-vindo ao suporte do SpaceHub. Como posso ajudar hoje?"
                },
                {
                    id: 'precos',
                    nome: 'Preços',
                    triggers: ['preço', 'preços', 'valor', 'valores', 'plano', 'planos', 'custo', 'custos'],
                    resposta: "Os nossos planos de Coworking começam em 49€/mês! 💼"
                },
                {
                    id: 'espaco',
                    nome: 'Espaço',
                    triggers: ['espaço', 'local', 'sala', 'salas', 'internet', 'wifi', 'café', 'bar', 'comida', 'bebidas', 'catering', 'cafe'],
                    resposta: "Temos salas de reunião modernas, internet ultra-rápida e café grátis à descrição, disponível no lobby! ☕"
                }
            ];

            let temasEncontrados = [];

            // Mapeia todas as ocorrências guardando a posição real do texto (ordem correta)
            temasDisponiveis.forEach(tema => {
                tema.triggers.forEach(trigger => {
                    const posicao = frase.indexOf(trigger);
                    if (posicao !== -1) {
                        temasEncontrados.push({
                            ...tema,
                            triggerExata: trigger,
                            posicaoNaFrase: posicao
                        });
                    }
                });
            });

            if (temasEncontrados.length === 0) {
                setMensagens((prev) => [...prev, {
                    user: 'Bot SpaceHub 🤖',
                    texto: "Desculpe, ainda sou um robô em treino no SpaceHub. Pode perguntar por assuntos como 'preço' ou 'espaço'!"
                }]);
                return;
            }

            // CORREÇÃO 1: Ordena as respostas de acordo com o que o utilizador escreveu primeiro
            temasEncontrados.sort((a, b) => a.posicaoNaFrase - b.posicaoNaFrase);

            // Filtra duplicados do mesmo tema (ex: "sala" e "espaço" na mesma frase)
            const temasUnicos = [];
            const idsVistos = new Set();
            temasEncontrados.forEach(t => {
                if (!idsVistos.has(t.id)) {
                    idsVistos.add(t.id);
                    temasUnicos.push(t);
                }
            });

            const primeiroTema = temasUnicos[0];
            let respostaFinal = primeiroTema.resposta;

            // Se houver uma segunda trigger detetada na frase
            if (temasUnicos.length > 1) {
                const segundoTema = temasUnicos[1];
                respostaFinal += `\n\n💡 Notei que também mencionou "${segundoTema.triggerExata}". Deseja obter mais informação sobre este assunto?`;

                setTriggerPendente(segundoTema);
                setMostrarBotoes(true);
            } else {
                setTriggerPendente(null);
            }

            setMensagens((prev) => [...prev, { user: 'Bot SpaceHub 🤖', texto: respostaFinal }]);
        }, 800);
    };

    // AÇÃO DOS BOTÕES DE DECISÃO
    const lidarComEscolha = (querSaberMais) => {
        // Guardamos o ponteiro localmente para o setTimeout conseguir ler sem conflito de render
        const proximoTema = triggerPendente;

        setMostrarBotoes(false);
        setTriggerPendente(null); // Limpa o estado imediatamente para libertar o próximo ciclo

        if (querSaberMais && proximoTema) {
            setMensagens((prev) => [...prev, { user: 'Tu', texto: "Sim, quero saber mais." }]);

            // CORREÇÃO 2: Injeta a resposta em falta no chat e fecha o ciclo
            setTimeout(() => {
                setMensagens((prev) => [...prev, {
                    user: 'Bot SpaceHub 🤖',
                    texto: `${proximoTema.resposta}\n\nPrecisa de ajuda com algum outro assunto?`
                }]);
            }, 800);
        } else {
            setMensagens((prev) => [...prev, { user: 'Tu', texto: "Já tenho a informação que procurava." }]);

            setTimeout(() => {
                setMensagens((prev) => [...prev, {
                    user: 'Bot SpaceHub 🤖',
                    texto: "Excelente! Se precisar de mais ajuda, eu continuo deste lado. Bom trabalho no SpaceHub! 🚀"
                }]);
            }, 800);
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
            <h2>SpaceHub Chat Bot 🤖 (Sandbox)</h2>
            <div style={{ color: statusColor, fontWeight: 'bold', marginBottom: '15px' }}>{status}</div>

            <div style={{ border: '1px solid #ccc', borderRadius: '8px', height: '400px', display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
                <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
                    {mensagens.map((msg, index) => (
                        <div key={index} style={{ marginBottom: '12px', textAlign: msg.user === 'Tu' ? 'right' : 'left' }}>
                            <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>{msg.user}</span>
                            <span style={{
                                display: 'inline-block',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                background: msg.user === 'Tu' ? '#007bff' : '#e9ecef',
                                color: msg.user === 'Tu' ? '#fff' : '#000',
                                marginTop: '2px',
                                maxWidth: '80%',
                                whitespace: 'pre-line',
                                textAlign: 'left'
                            }}>
                                {msg.texto}
                            </span>
                        </div>
                    ))}

                    {mostrarBotoes && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-start' }}>
                            <button
                                onClick={() => lidarComEscolha(false)}
                                style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '15px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Já tenho a informação que procurava
                            </button>
                            <button
                                onClick={() => lidarComEscolha(true)}
                                style={{ background: '#007bff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '15px', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Sim, quero saber mais
                            </button>
                        </div>
                    )}

                    <div ref={mensagensEndRef} />
                </div>

                <form onSubmit={enviarParaOBackend} style={{ display: 'flex', borderTop: '1px solid #ccc', padding: '10px', background: '#fff', borderRadius: '0 0 8px 8px' }}>
                    <input
                        type="text"
                        value={inputMensagem}
                        onChange={(e) => setInputMensagem(e.target.value)}
                        placeholder="Pergunta-me algo (ex: olá, preço, espaço)..."
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '8px' }}
                    />
                    <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}> Enviar </button>
                </form>
            </div>
        </div>
    );
}
