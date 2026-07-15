import React, { useEffect, useState, useRef } from 'react';

export default function ChatBot() {
    const [mensagens, setMensagens] = useState([]);
    const [inputMensagem, setInputMensagem] = useState('');

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
        // O Echo continua a ouvir em background silenciosamente, sem mostrar avisos técnicos no ecrã
        if (window.Echo) {
            const canal = window.Echo.channel('chat');
            canal.listen('MensagemTeste', (dados) => {
                setMensagens((prev) => [...prev, { user: dados.user, texto: dados.texto }]);
            });
        }
        return () => {
            if (window.Echo) window.Echo.leaveChannel('chat');
        };
    }, []);

    const enviarParaOBackend = (e) => {
        e.preventDefault();
        if (!inputMensagem.trim()) return;

        const pergunta = inputMensagem;
        setMensagens((prev) => [...prev, { user: 'Utilizador', texto: pergunta }]);
        setInputMensagem('');
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
                    nome: 'Saudações',
                    triggers: ['ola', 'oi', 'ajuda', 'bom dia', 'boa tarde', 'boa noite'],
                    resposta: "Olá! 👋\nBem-vindo ao suporte do SpaceHub. Como posso ajudar hoje?"
                },
                {
                    id: 'precos',
                    nome: 'Preços',
                    triggers: ['preco', 'precos', 'valores', 'plano', 'planos', 'pagar', 'valor', 'custo', 'custos'],
                    resposta: "Os nossos planos de Coworking começam em 49€/mês! 💼"
                },
                {
                    id: 'espaco',
                    nome: 'Espaço',
                    triggers: ['espaco', 'local', 'morada', 'onde', 'instalacoes', 'comunidade', 'cafe', 'internet', 'wifi'],
                    resposta: "Temos salas de reunião modernas, internet ultra-rápida e café grátis à descrição, disponível no lobby! ☕"
                },
                {
                    id: 'reservas',
                    nome: 'Reservas',
                    triggers: ['reserva', 'reservar', 'reservas', 'sala', 'salas', 'secretaria', 'secretarias'],
                    resposta: "Para reservar uma sala de reunião ou secretária, basta aceder ao módulo correspondente no seu menu! 🗓️"
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
                    user: 'Bot SpaceHub 🤖',
                    texto: "Desculpe, ainda sou um robô em treino no SpaceHub. Pode perguntar por assuntos como 'preço', 'espaço' ou 'reserva'!"
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

            setMensagens((prev) => [...prev, { user: 'Bot SpaceHub 🤖', texto: respostaFinal }]);
        }, 800);
    };

    const lidarComEscolha = (querSaberMais) => {
        const proximoTema = triggerPendente;

        setMostrarBotoes(false);
        setTriggerPendente(null);

        if (querSaberMais && proximoTema) {
            setMensagens((prev) => [...prev, { user: 'Utilizador', texto: "Sim, quero saber mais." }]);

            setTimeout(() => {
                setMensagens((prev) => [...prev, {
                    user: 'Bot SpaceHub 🤖',
                    texto: `${proximoTema.resposta}`
                }]);
            }, 800);
        } else {
            setMensagens((prev) => [...prev, { user: 'Utilizador', texto: "Já tenho a informação que procurava." }]);

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
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Assistente Virtual SpaceHub 🤖</h2>

            <div style={{ border: '1px solid #ccc', borderRadius: '8px', height: '400px', display: 'flex', flexDirection: 'column', background: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{
                    flex: 1, padding: '15px', overflowY: 'auto',
                    backgroundImage: "linear-gradient(rgba(249, 249, 249, 0.92), rgba(249, 249, 249, 0.92)), url('images/logo/spacehub-logo.png')",
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                    {mensagens.map((msg, index) => (
                        <div key={index} style={{ marginBottom: '12px', textAlign: msg.user === 'Utilizador' ? 'right' : 'left' }}>
                            <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>{msg.user}</span>
                            <span style={{
                                display: 'inline-block',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                background: msg.user === 'Utilizador' ? '#007bff' : '#e9ecef',
                                color: msg.user === 'Utilizador' ? '#fff' : '#000',
                                marginTop: '2px',
                                maxWidth: '80%',
                                whiteSpace: 'pre-line',
                                textAlign: 'left',
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
                        placeholder="Pergunte-me algo (ex: olá, preço, espaço)..."
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '8px' }}
                    />
                    <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}> Enviar </button>
                </form>
            </div>
        </div>
    );
}
