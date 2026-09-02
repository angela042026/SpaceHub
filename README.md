<div align="center">

🏢 SpaceHub

Sistema de Gestão e Reserva de Espaços Colaborativos

Aplicação web desenvolvida em Laravel 12, React, Inertia.js e MySQL para gestão de espaços, reservas de secretárias, pagamentos simulados, check-in, suporte e monitorização da ocupação.



</div>

📖 Sobre o projeto

O SpaceHub é uma aplicação web destinada à gestão de espaços de trabalho colaborativos e à reserva de postos de trabalho.

O sistema organiza os espaços através da seguinte hierarquia:

Edifício
└── Piso
    └── Setor
        └── Secretária

A plataforma permite consultar a disponibilidade, reservar secretárias, efetuar check-in por QR Code, gerir pagamentos simulados e acompanhar a utilização dos espaços através de dashboards, mapas e estatísticas.

O projeto foi desenvolvido em contexto académico por uma equipa de quatro elementos, com integração através de branches, Pull Requests e merge commits.

✨ Funcionalidades principais

👤 Autenticação e utilizadores

registo;

login e logout;

recuperação e redefinição da palavra-passe;

gestão do perfil;

fotografia de perfil;

contas ativas e inativas;

gestão administrativa de utilizadores;

papéis e permissões;

autenticação da API com Laravel Sanctum;

Single Sign-On.

Papéis existentes:

Administrador;

Gestor;

Colaborador;

Utilizador.

Os papéis são fixos e criados através de seeders. Não existe CRUD de papéis.

🏢 Gestão de espaços

gestão de edifícios;

gestão de pisos;

gestão de setores;

gestão de secretárias;

pesquisa;

filtros;

ordenação;

paginação;

ativação e desativação lógica;

upload e substituição das plantas dos pisos;

características das secretárias;

posicionamento no mapa;

editor gráfico;

QR Code único por secretária.

📅 Reservas

criação;

consulta;

edição;

cancelamento;

histórico;

consulta de disponibilidade;

validação de conflitos;

estados da reserva;

check-in por QR Code;

expiração automática;

atualização do mapa em tempo real;

associação automática a um pagamento.

Durações suportadas:

diária;

semanal;

mensal;

anual.

Períodos suportados:

Manhã;

Tarde;

Dia inteiro.

As reservas longas utilizam o período Dia inteiro, possuem data final calculada e correspondem a um único registo de reserva e a um único pagamento.

Estados principais:

pendente;

confirmada;

cancelada;

expirada.

💳 Pagamentos simulados

criação automática;

cálculo do valor;

referência única;

consulta;

confirmação;

cancelamento;

histórico;

comprovativo;

controlo de acesso.

Métodos suportados:

Cartão;

MB Way;

Transferência Bancária;

PayPal.

Estados:

pendente;

pago;

cancelado.

Os pagamentos são simulados para fins académicos. Não existe movimentação financeira real.

📱 QR Code e check-in

geração de QR Code;

leitura através da câmara;

validação do utilizador;

validação da reserva;

validação da data, período e secretária;

confirmação do check-in;

atualização do estado para confirmada;

atualização do mapa.

📊 Dashboard, estatísticas e mapa

dashboard;

indicadores de utilização;

taxa de ocupação;

reservas por estado;

reservas por período;

reservas por edifício;

próximas reservas;

mapa interativo;

editor gráfico;

atualização em tempo real;

gráficos com Recharts.

⭐ Avaliações

avaliação de reservas elegíveis;

classificação;

comentários;

moderação;

média por setor;

regras de autorização.

🔔 Notificações

notificações persistentes;

estado de leitura;

notificações relacionadas com reservas, pagamentos, check-in, avaliações e suporte;

comunicação em tempo real quando aplicável.

💬 Chat e tempo real

Laravel Reverb;

Laravel Echo;

Broadcasting;

WebSockets;

eventos Laravel;

chat;

atualização do mapa;

notificações em tempo real.

Eventos utilizados incluem:

MapaAtualizado
EnviarMensagem

🆘 Help Center

FAQs;

categorias;

conteúdos ativos;

pedidos de suporte;

reporte de problemas e avarias;

acompanhamento do estado;

resposta administrativa;

associação ao utilizador autenticado.

🏗️ Arquitetura

O SpaceHub utiliza uma arquitetura em camadas baseada no padrão Model-View-Controller.

Utilizador
    ↓
React + Inertia.js
    ↓
Rotas Web / API
    ↓
Middleware
    ↓
Controllers
    ↓
Form Requests / Policies / Services
    ↓
Models Eloquent
    ↓
MySQL

A API utiliza:

Laravel Sanctum;

API Resources;

Form Requests;

Policies;

Gates;

Middleware;

Route Model Binding;

Eloquent ORM;

respostas JSON.

A interface web utiliza:

React;

Inertia.js;

Tailwind CSS;

componentes reutilizáveis;

Controllers Laravel.

🔐 Segurança

A aplicação inclui:

hashing das palavras-passe;

Laravel Sanctum;

autenticação por sessão;

middleware de autenticação;

middleware de conta ativa;

middleware de papel;

Policies;

Gates;

Form Requests;

controlo de propriedade dos recursos;

validação de uploads;

proteção contra mass assignment;

revogação de tokens;

listas seguras de campos de ordenação;

desativação lógica das entidades.

🛠️ Tecnologias

Tecnologia

Utilização

Laravel 12

Backend

PHP 8.2

Linguagem de backend

React 19

Frontend

Inertia.js

Integração Laravel/React

Tailwind CSS

Interface

MySQL

Base de dados

Laravel Sanctum

Autenticação da API

Laravel Reverb

Servidor WebSocket

Laravel Echo

Comunicação em tempo real

Broadcasting

Emissão de eventos

Recharts

Gráficos

Simple QR Code

Geração de QR Codes

html5-qrcode

Leitura de QR Codes

PHPUnit

Testes automatizados

Vite

Desenvolvimento e compilação

Git e GitHub

Controlo de versões e integração

📂 Estrutura do projeto

app/
├── Events/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Notifications/
├── Policies/
├── Providers/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

docs/

public/

resources/
├── css/
└── js/
    ├── Components/
    ├── Layouts/
    └── Pages/

routes/
├── api.php
├── channels.php
├── console.php
└── web.php

storage/

tests/
├── Feature/
└── Unit/

✅ Requisitos

Para executar o projeto são necessários:

PHP 8.2 ou versão compatível;

Composer;

Node.js;

npm;

MySQL ou MariaDB compatível;

extensões PHP exigidas pelo Laravel;

Git, para clonar o repositório.

🚀 Instalação

1. Clonar o projeto

git clone https://github.com/angela042026/SpaceHub.git
cd SpaceHub

2. Instalar as dependências PHP

composer install

3. Instalar as dependências JavaScript

npm install

No Windows:

npm.cmd install

4. Configurar o ambiente

Copiar o ficheiro .env.example para .env.

Windows:

copy .env.example .env

Linux ou macOS:

cp .env.example .env

Gerar a chave da aplicação:

php artisan key:generate

O ficheiro .env não deve ser enviado para o repositório.

5. Configurar a base de dados

A base de dados esperada chama-se:

spacehub

Configuração local exemplificativa:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spacehub
DB_USERNAME=root
DB_PASSWORD=

Os dados reais de acesso devem ser configurados apenas no ficheiro .env.

6. Importar a base de dados entregue

Para avaliação, a estrutura e os dados são entregues separadamente num ficheiro SQL:

spacehub_bd.sql

O ficheiro SQL não deve ser colocado no repositório Git.

Importação através do phpMyAdmin:

criar ou selecionar a base de dados spacehub;

abrir a opção Importar;

selecionar spacehub_bd.sql;

iniciar a importação;

confirmar que as tabelas e os dados foram criados.

Também pode ser utilizado o MySQL:

mysql -u root -p spacehub < spacehub_bd.sql

As migrations e os seeders permanecem no projeto, mas a instalação para avaliação deve utilizar o ficheiro SQL entregue separadamente.

7. Migrations e seeders em desenvolvimento

Num ambiente de desenvolvimento vazio pode ser utilizado:

php artisan migrate --seed

Para recriar completamente a base de dados durante o desenvolvimento:

php artisan migrate:fresh --seed

migrate:fresh elimina todos os dados. Não deve ser utilizado numa base de dados que contenha informação a preservar.

8. Criar o link do Storage

php artisan storage:link

Este comando disponibiliza publicamente:

fotografias dos utilizadores;

plantas dos pisos;

outros ficheiros guardados no disco público.

9. Compilar o frontend

Produção:

npm run build

Windows:

npm.cmd run build

Desenvolvimento:

npm run dev

Windows:

npm.cmd run dev

10. Limpar e preparar a aplicação

php artisan optimize:clear
composer dump-autoload

11. Executar o servidor Laravel

php artisan serve

Endereço local:

http://127.0.0.1:8000

12. Executar o Laravel Reverb

Noutro terminal:

php artisan reverb:start

O Reverb é necessário para as funcionalidades WebSocket, chat e atualizações em tempo real.

13. Executar o Scheduler

Noutro terminal:

php artisan schedule:work

O Scheduler é utilizado para tarefas automáticas, incluindo atualização de reservas expiradas e outros processos agendados.

### Preparação para produção

Use `.env.production.example` como referência e copie os valores necessários para o `.env` do servidor. Nunca versione o `.env` real nem reutilize credenciais de desenvolvimento.

Antes de disponibilizar uma nova versão:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Confirme que `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` usa HTTPS e `SESSION_SECURE_COOKIE=true`. Gere uma chave exclusiva com `php artisan key:generate` caso o ambiente ainda não tenha `APP_KEY`.

O servidor também precisa de processos supervisionados para:

```bash
php artisan queue:work --tries=3
php artisan reverb:start
```

Configure ainda o cron para executar o scheduler a cada minuto:

```cron
* * * * * cd /caminho/do/spacehub && php artisan schedule:run >> /dev/null 2>&1
```

Depois do deploy, confirme `php artisan about`, `php artisan migrate:status`, os logs da aplicação e os fluxos críticos de login, reserva, pagamento e check-in.

▶️ Execução em desenvolvimento

Durante o desenvolvimento podem permanecer ativos quatro terminais.

Terminal 1 — Laravel

php artisan serve

Terminal 2 — Frontend

npm.cmd run dev

Terminal 3 — Reverb

php artisan reverb:start

Terminal 4 — Scheduler

php artisan schedule:work

🖼️ Imagens e uploads

Os recursos estáticos da aplicação encontram-se principalmente em:

public/
resources/

Os uploads efetuados através da aplicação utilizam o Storage público do Laravel, incluindo:

storage/app/public/utilizadores/fotografias
storage/app/public/pisos/plantas

O acesso público é efetuado através do link:

public/storage

Por esse motivo, deve ser executado:

php artisan storage:link

As imagens necessárias ao funcionamento e à demonstração devem estar incluídas no repositório ou na pasta compactada entregue, conforme a sua natureza.

🧪 Testes e validação

Executar a suíte de testes:

php artisan test

A documentação anterior registava 154 testes aprovados. Como foram integradas alterações posteriores, o número final deve ser confirmado através do comando anterior.

Antes de uma integração ou entrega:

php artisan optimize:clear
composer dump-autoload
npm.cmd run build
php artisan test
php artisan route:list

Para confirmar as rotas da API:

php artisan route:list --path=api

📚 Documentação

A documentação técnica encontra-se em docs/.

Documento

Descrição

01-Requisitos.md

Requisitos e regras de negócio

02-CasosDeUso.md

Atores e casos de uso

03-ModeloBaseDados.md

Entidades e relações

04-Arquitetura.md

Arquitetura técnica

05-API.md

Endpoints, autenticação e respostas

06-Roadmap.md

Evolução do projeto e trabalho futuro

07-DicionarioDados.md

Estrutura das tabelas

08-PROJECT_CONTEXT.md

Contexto consolidado do projeto

📦 Entrega do projeto

A entrega deve incluir:

SpaceHub_Entrega/
├── SpaceHub_Projeto.zip
├── spacehub_bd.sql
└── SpaceHub_Credenciais.txt

Repositório Git

O repositório deve conter:

todo o código Laravel;

app;

bootstrap;

config;

database;

public;

resources;

routes;

storage, quando necessário;

tests;

docs;

imagens utilizadas;

composer.json;

composer.lock;

package.json;

package-lock.json;

.env.example;

README.md.

Elementos que não devem ficar no Git

.env;

vendor/;

node_modules/;

credenciais reais;

ficheiros SQL com dados;

logs;

ficheiros temporários;

chaves e segredos.

Base de dados

A estrutura e os dados de demonstração são entregues em:

spacehub_bd.sql

Credenciais

As credenciais devem ser entregues separadamente em:

SpaceHub_Credenciais.txt

O ficheiro deve incluir:

URL da aplicação;

utilizador administrador;

palavra-passe do administrador;

utilizadores de demonstração necessários.

As credenciais não devem ser incluídas no repositório Git.

🌱 Dados iniciais

O projeto inclui migrations e seeders para:

papéis;

utilizadores;

períodos;

estados das reservas;

edifícios;

pisos;

setores;

secretárias;

reservas;

FAQs;

outros módulos definidos na versão atual.

Os dados de avaliação são fornecidos principalmente através do ficheiro SQL entregue.

👥 Equipa

Projeto desenvolvido por:

Ângela Costa;

Eduardo;

Joana Oliveira;

Hanna Sampaio.

Divisão principal:

Pessoa 1 — Joana: reservas e fluxo de utilização;

Pessoa 2 — Ângela: administração, espaços, segurança, integração e documentação;

Pessoa 3 — Eduardo: comunicação em tempo real, Reverb e chat;

Pessoa 4 — Hanna: dashboard, estatísticas, mapa, QR Code e check-in.

O desenvolvimento foi integrado através de branches, Pull Requests e merge commits, preservando a autoria dos commits.

🔀 Git e integração

Branch de funcionalidade
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Revisão e testes
    ↓
Create a merge commit
    ↓
main

Este processo permite:

desenvolvimento paralelo;

revisão das alterações;

preservação da autoria;

histórico completo;

redução do risco nas integrações.

📌 Estado do projeto

O projeto encontra-se em fase de consolidação e preparação da entrega.

Principais módulos concluídos:

autenticação;

Single Sign-On;

utilizadores;

gestão de espaços;

reservas;

reservas longas;

pagamentos simulados;

QR Code;

check-in;

dashboard;

estatísticas;

mapa;

avaliações;

notificações;

chat;

Help Center;

testes;

documentação.

Tarefas finais:

correções pontuais;

testes manuais;

confirmação da suíte de testes;

revisão visual;

revisão das permissões;

remoção de código técnico temporário;

atualização do README;

exportação SQL;

preparação do ZIP;

preparação das credenciais;

apresentação final.

🔮 Trabalho futuro

Possíveis evoluções:

comunicados e mensagem do dia;

exportação PDF dos comprovativos;

relatórios Excel;

dashboard financeiro avançado;

integração com Google Calendar;

integração com Microsoft Outlook;

aplicação móvel;

previsão estatística da ocupação;

evolução da previsão para Inteligência Artificial;

auditoria administrativa;

integração com gateways reais de pagamento;

melhorias no Help Center;

gestão avançada de equipamentos.

O Single Sign-On, as avaliações e as notificações já estão implementados e não devem ser apresentados como funcionalidades pendentes.

📄 Licença

Este projeto foi desenvolvido em contexto académico e destina-se a fins educativos.

<div align="center">

SpaceHub

Sistema de Gestão e Reserva de Espaços Colaborativos

Laravel • React • Inertia.js • Tailwind CSS • MySQL

Sanctum • Reverb • Echo • PHPUnit

Projeto em consolidação e preparação da entrega final

</div>
