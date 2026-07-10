import React, { useEffect, useState } from 'react';

export default function TesteChat() {
    const [status, setStatus] = useState('A ligar ao Laravel Echo...');
    const [statusColor, setStatusColor] = useState('orange');
    const [mensagens, setMensagens] = useState([]);
    const [inputMensagem, setInputMensagem] = useState('');

    useEffect(() => {
        if (window.Echo) {
            setStatus('✅ Ligado ao Reverb (Modo Sandbox)!');
            setStatusColor('green');

            const canal = window.Echo.channel('chat');

            // Continua a ouvir se vier algo do backend
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

    // Simulação no Frontend (Ignora o bloqueio do servidor PHP)
    const enviarParaOBackend = (e) => {
        e.preventDefault();
        if (!inputMensagem.trim()) return;

        const pergunta = inputMensagem;

        // 1. Adiciona a tua mensagem instantaneamente no ecrã
        setMensagens((prev) => [...prev, { user: 'Tu', texto: pergunta }]);
        setInputMensagem('');

        // 2. Simula a resposta do Bot diretamente no React após 800ms
        setTimeout(() => {
            let respostaBot = "Desculpa, ainda sou um robô em treino no SpaceHub. Podes perguntar por 'olá', 'preço' ou 'espaço'!";
            const termo = pergunta.toLowerCase().trim();

            if (termo === 'olá' || termo === 'oi') {
                respostaBot = "Olá! Bem-vindo ao suporte do SpaceHub. Como posso ajudar-te hoje? 👋";
            } else if (termo === 'preço' || termo === 'preços' || termo === 'valor') {
                respostaBot = "Os nossos planos de Coworking começam em 49€/mês! 💼";
            } else if (termo === 'espaço' || termo === 'local') {
                respostaBot = "Temos salas de reunião modernas, internet ultra-rápida e café grátis à discrição! ☕";
            }

            // Injeta a resposta do bot diretamente no estado do chat
            setMensagens((prev) => [...prev, { user: 'Bot SpaceHub 🤖', texto: respostaBot }]);
        }, 800);
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
            <h2>SpaceHub Chat Bot 🤖 (Sandbox)</h2>
            <div style={{ color: statusColor, fontWeight: 'bold', marginBottom: '15px' }}>{status}</div>

            {/* Janela de Chat */}
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', height: '350px', display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
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
                                marginTop: '2px'
                            }}>
                                {msg.texto}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Formulário de Envio */}
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
