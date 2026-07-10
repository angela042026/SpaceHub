<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Teste de Chat WebSocket</title>
    @vite(['resources/js/app.js'])
</head>
<body>
    <div style="padding: 30px; font-family: sans-serif;">
        <h2>Consola de Teste do Chat (Reverb)</h2>
        <p>Abre a consola do navegador (F12 -> Console) para veres as mensagens a chegar em tempo real!</p>

        <div id="status" style="color: orange; font-weight: bold;">A ligar ao servidor...</div>

        <ul id="lista-mensagens" style="margin-top: 20px; background: #f0f0f0; padding: 20px; border-radius: 5px; min-height: 100px;">
            <li>As mensagens vão aparecer aqui em baixo...</li>
        </ul>
    </div>

    <script>
        // Aguarda que o Vite carregue o ficheiro JS e o Laravel Echo
        window.addEventListener('load', () => {
            if (window.Echo) {
                document.getElementById('status').innerText = "✅ Ligado ao Laravel Echo!";
                document.getElementById('status').style.color = "green";

                // Escuta um canal público chamado 'chat'
                window.Echo.channel('chat')
                    .listen('.MensagemTeste', (dados) => {
                        console.log("Recebido via WebSocket:", dados);

                        // Injeta a mensagem na lista do ecrã
                        const li = document.createElement('li');
                        li.innerText = `${dados.user}: ${dados.texto}`;
                        document.getElementById('lista-mensagens').appendChild(li);
                    });
            } else {
                document.getElementById('status').innerText = "❌ Erro: Laravel Echo não foi detetado.";
                document.getElementById('status').style.color = "red";
            }
        });
    </script>
</body>
</html>
