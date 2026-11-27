# Deploy do SpaceHub no Render

## Arquitetura inicial

O Blueprint `render.yaml` cria:

- um Web Service Docker para Laravel, Apache e o scheduler;
- uma base PostgreSQL ligada ao serviço pela variável `DB_URL`.

Para reduzir custos na demonstração, as filas usam o modo `sync` e o
broadcasting usa o modo `log`. As operações continuam funcionais, mas as
atualizações em tempo real exigem recarregar a página.

## Criar o Blueprint

1. Abrir o painel do Render e escolher **New > Blueprint**.
2. Ligar o repositório GitHub do SpaceHub.
3. Selecionar a branch que contém a preparação do deploy.
4. Confirmar que o caminho do Blueprint é `render.yaml`.
5. Informar `APP_KEY` quando o Render solicitar.

Gerar a chave localmente sem a guardar no Git:

```bash
php artisan key:generate --show
```

O primeiro arranque executa as migrations. Depois do primeiro deploy bem
sucedido, o `initialDeployHook` carrega os dados de demonstração uma única vez.

## Variáveis importantes

- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_CONNECTION=pgsql`
- `QUEUE_CONNECTION=sync`
- `BROADCAST_CONNECTION=log`
- `RUN_MIGRATIONS=true`
- `RUN_SEEDERS=false`
- `RUN_SCHEDULER=true`

Nunca guardar `APP_KEY`, palavras-passe da base de dados ou credenciais Google
no repositório.

## Limitações do plano gratuito

- O serviço pode adormecer depois de um período sem pedidos.
- O scheduler não corre enquanto o serviço estiver adormecido; recupera o
  processamento depois de o serviço acordar.
- O sistema de ficheiros é temporário. Uploads realizados em produção podem
  desaparecer após reinício ou novo deploy.
- A base PostgreSQL gratuita é indicada apenas para demonstração temporária.

Para uma instalação permanente, configurar armazenamento S3 compatível,
PostgreSQL pago, worker de filas e um serviço Reverb separado.

## Verificação após o deploy

1. Abrir `/up` e confirmar a resposta de sucesso.
2. Entrar com as contas de demonstração.
3. Criar e pagar uma reserva.
4. Confirmar o check-in pela receção.
5. Testar os relatórios e a troca de idioma.
6. Consultar **Logs** no Render se alguma operação falhar.
