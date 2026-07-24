<div align="center">

# 🏢 SpaceHub

### Sistema de Gestão e Reserva de Espaços Colaborativos

Aplicação web desenvolvida em **Laravel 12**, **React** e **Inertia.js** para gestão de espaços colaborativos, reservas de secretárias, pagamentos, suporte e monitorização da ocupação.

![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8-blue?logo=php)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Inertia.js](https://img.shields.io/badge/Inertia.js-SPA-purple)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql)
![Sanctum](https://img.shields.io/badge/Auth-Sanctum-success)
![Reverb](https://img.shields.io/badge/WebSockets-Reverb-purple)
![PHPUnit](https://img.shields.io/badge/Tests-154%20Passed-brightgreen)

</div>

---

# 📖 Sobre o Projeto

O **SpaceHub** é uma aplicação web destinada à gestão de espaços de trabalho colaborativos e à reserva de secretárias.

O sistema permite organizar edifícios, pisos, setores e secretárias, possibilitando aos utilizadores consultar a disponibilidade dos espaços e reservar postos de trabalho de forma simples, segura e centralizada.

Além da gestão dos espaços e das reservas, a aplicação disponibiliza:

* autenticação e recuperação de password;
* autorização baseada em papéis;
* gestão de utilizadores;
* dashboard com estatísticas;
* mapa interativo dos espaços;
* check-in através de QR Code;
* pagamentos simulados associados às reservas;
* Help Center e pedidos de suporte;
* upload de fotografias e plantas;
* comunicação e atualizações em tempo real;
* expiração automática de reservas sem check-in.

---

# ✨ Funcionalidades

## 👤 Utilizadores e autenticação

* Registo de utilizadores
* Login e logout
* Recuperação e redefinição de password
* Consulta do perfil autenticado
* Gestão administrativa de utilizadores
* Alteração do papel do utilizador
* Ativação e desativação de contas
* Upload e substituição da fotografia de perfil
* Bloqueio de utilizadores inativos

Os papéis disponíveis são:

* Administrador
* Gestor
* Colaborador
* Utilizador

Os papéis são fixos e criados através de seeders. Não existe CRUD de papéis.

---

## 🏢 Gestão de espaços

* Gestão de edifícios
* Gestão de pisos
* Gestão de setores
* Gestão de secretárias
* Pesquisa
* Filtros
* Ordenação
* Paginação
* Ativação e desativação lógica
* Upload e substituição das plantas dos pisos
* Configuração das características das secretárias
* Posicionamento de setores e secretárias no mapa

A hierarquia dos espaços é:

```text
Edifício
    ↓
Piso
    ↓
Setor
    ↓
Secretária
```

---

## 📅 Reservas

* Criação de reservas
* Consulta das reservas
* Atualização de reservas elegíveis
* Histórico de reservas
* Consulta de disponibilidade
* Cancelamento de reservas
* Validação de conflitos
* Validação da disponibilidade da secretária
* Controlo dos estados da reserva
* Expiração automática de reservas sem check-in
* Atualização do mapa após alterações relevantes

Os estados implementados são:

* `pendente`
* `confirmada`
* `cancelada`
* `expirada`

O sistema impede:

* duas reservas ativas para a mesma secretária, data e período;
* mais do que uma reserva do mesmo utilizador para a mesma data e período;
* reservas em secretárias inativas ou não reserváveis;
* alterações a reservas canceladas, expiradas ou com check-in;
* cancelamentos de reservas não elegíveis.

---

## 💳 Pagamentos

* Associação de pagamentos às reservas
* Criação de pagamentos
* Geração de referência única
* Consulta do estado
* Confirmação de pagamentos
* Cancelamento de pagamentos
* Histórico de pagamentos
* Validação das transições de estado
* Controlo de acesso aos pagamentos

Os estados utilizados são:

* `pendente`
* `pago`
* `cancelado`

Os pagamentos são simulados para fins académicos, não existindo comunicação com bancos ou fornecedores externos.

---

## 📱 QR Code e check-in

* Geração de QR Code único para cada secretária
* Leitura do QR Code através da câmara
* Validação do utilizador autenticado
* Validação da reserva
* Validação da data e do período
* Validação da secretária
* Confirmação do check-in
* Alteração da reserva para o estado `confirmada`
* Atualização do mapa após o check-in

---

## 📊 Dashboard e estatísticas

* Dashboard principal
* Taxa de ocupação
* Reservas por período
* Reservas por estado
* Reservas por edifício
* Indicadores gerais de utilização
* Próximas reservas
* Visualização gráfica através de Recharts

---

## 🗺️ Mapa interativo

* Visualização dos pisos
* Visualização dos setores
* Visualização das secretárias
* Identificação dos estados de ocupação
* Editor gráfico dos setores
* Posicionamento dos elementos
* Atualização em tempo real
* Integração com Laravel Echo e Laravel Reverb

---

## 🆘 Help Center e suporte

* Consulta de perguntas frequentes
* Organização de FAQs
* Apresentação de conteúdos ativos
* Submissão de pedidos de suporte
* Reporte de problemas e avarias
* Associação do pedido ao utilizador autenticado
* Acompanhamento do estado do pedido
* Resposta administrativa

---

## 💬 Comunicação em tempo real

* Laravel Reverb
* Laravel Echo
* Broadcasting
* Eventos Laravel
* WebSockets
* Atualização do mapa em tempo real
* Funcionalidade de chat
* Evento `MapaAtualizado`
* Evento `EnviarMensagem`

---

## 📁 Uploads

A aplicação permite:

* upload de fotografias dos utilizadores;
* substituição da fotografia existente;
* upload de plantas dos pisos;
* substituição da planta existente;
* validação do tipo e tamanho do ficheiro;
* remoção segura dos ficheiros antigos;
* prevenção de ficheiros órfãos em caso de erro.

---

# 🏗️ Arquitetura

O SpaceHub utiliza uma arquitetura em camadas baseada no padrão **Model-View-Controller**.

O backend é desenvolvido em Laravel e o frontend utiliza React com Inertia.js.

```text
Utilizador
    │
    ▼
React + Inertia.js
    │
    ▼
Rotas Web / API
    │
    ▼
Controllers
    │
    ▼
Form Requests
    │
    ▼
Policies / Gates / Middleware
    │
    ▼
Services
    │
    ▼
Models Eloquent
    │
    ▼
MySQL
```

A API utiliza:

* Laravel Sanctum
* API Resources
* Form Requests
* Policies
* Gates
* Middleware
* Route Model Binding
* Eloquent ORM
* Respostas JSON

As páginas web utilizam:

* React
* Inertia.js
* Tailwind CSS
* Controllers Laravel
* Componentes reutilizáveis

---

# 🔐 Segurança

A segurança da aplicação inclui:

* autenticação com Laravel Sanctum;
* passwords protegidas por hashing;
* Policies;
* Gates;
* middleware de autenticação;
* middleware de utilizador ativo;
* middleware de papéis;
* autorização por recurso;
* validação através de Form Requests;
* limitação de operações por papel;
* bloqueio de utilizadores inativos;
* prevenção de alterações a recursos de outros utilizadores;
* revogação de tokens após redefinição da password.

---

# 🛠️ Tecnologias

| Tecnologia      | Utilização                               |
| --------------- | ---------------------------------------- |
| Laravel 12      | Backend                                  |
| PHP 8           | Linguagem de backend                     |
| React 19        | Frontend                                 |
| Inertia.js      | Comunicação entre Laravel e React        |
| Tailwind CSS    | Interface                                |
| MySQL           | Base de dados                            |
| Laravel Sanctum | Autenticação da API                      |
| Laravel Reverb  | Servidor WebSocket                       |
| Laravel Echo    | Comunicação em tempo real                |
| Broadcasting    | Emissão de eventos                       |
| Recharts        | Gráficos estatísticos                    |
| Simple QR Code  | Geração de QR Codes                      |
| html5-qrcode    | Leitura de QR Codes                      |
| PHPUnit         | Testes automatizados                     |
| Vite            | Desenvolvimento e compilação do frontend |

---

# 📂 Estrutura do Projeto

```text
app/
├── Events/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
├── Providers/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

docs/

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
```

---

# 🚀 Instalação

## 1. Clonar o projeto

```bash
git clone https://github.com/angela042026/SpaceHub.git
cd SpaceHub
```

---

## 2. Instalar as dependências PHP

```bash
composer install
```

---

## 3. Instalar as dependências JavaScript

```bash
npm install
```

No Windows, caso a execução de scripts PowerShell esteja bloqueada, pode ser utilizado:

```bash
npm.cmd install
```

---

## 4. Configurar o ambiente

Copiar o ficheiro:

```text
.env.example
```

para:

```text
.env
```

No Windows:

```bash
copy .env.example .env
```

Em Linux ou macOS:

```bash
cp .env.example .env
```

Gerar a chave da aplicação:

```bash
php artisan key:generate
```

---

## 5. Configurar a base de dados

Criar uma base de dados MySQL e configurar as seguintes variáveis no ficheiro `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spacehub
DB_USERNAME=root
DB_PASSWORD=
```

---

## 6. Executar migrations e seeders

Para criar a base de dados:

```bash
php artisan migrate --seed
```

Para recriar toda a base de dados durante o desenvolvimento:

```bash
php artisan migrate:fresh --seed
```

Os principais seeders incluem:

```text
RoleSeeder
PeriodoSeeder
EstadoReservaSeeder
UserSeeder
SpaceHubEstruturaSeeder
ReservaSeeder
FaqSeeder
```

---

## 7. Criar o link do storage

```bash
php artisan storage:link
```

Este comando permite disponibilizar publicamente:

* fotografias dos utilizadores;
* plantas dos pisos;
* outros ficheiros guardados no disco público.

---

## 8. Limpar e preparar a aplicação

```bash
php artisan optimize:clear
composer dump-autoload
```

---

## 9. Executar o frontend

Durante o desenvolvimento:

```bash
npm run dev
```

No Windows:

```bash
npm.cmd run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

No Windows:

```bash
npm.cmd run build
```

---

## 10. Executar o servidor Laravel

```bash
php artisan serve
```

A aplicação ficará disponível em:

```text
http://127.0.0.1:8000
```

---

## 11. Executar o Laravel Reverb

Noutro terminal:

```bash
php artisan reverb:start
```

O Reverb é necessário para as funcionalidades de WebSockets, comunicação em tempo real, mapa e chat.

---

## 12. Executar o Scheduler

Para executar localmente as tarefas agendadas:

```bash
php artisan schedule:work
```

Também é possível executar manualmente o comando responsável pela expiração das reservas:

```bash
php artisan reservas:cancelar-expiradas
```

O Scheduler verifica periodicamente as reservas pendentes e atualiza as que perderam a validade sem check-in.

---

# ▶️ Execução em desenvolvimento

Durante o desenvolvimento devem permanecer ativos, em terminais separados:

### Terminal 1 — Laravel

```bash
php artisan serve
```

### Terminal 2 — Frontend

```bash
npm.cmd run dev
```

### Terminal 3 — Laravel Reverb

```bash
php artisan reverb:start
```

### Terminal 4 — Scheduler

```bash
php artisan schedule:work
```

---

# 🧪 Testes

Executar todos os testes:

```bash
php artisan test
```

Estado atual:

✅ **154 testes automatizados aprovados**

Os testes cobrem:

* autenticação;
* registo;
* login;
* logout;
* recuperação de password;
* redefinição de password;
* autorização;
* Policies;
* Gates;
* Middleware;
* utilizadores inativos;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* pesquisa;
* filtros;
* ordenação;
* paginação;
* uploads;
* reservas;
* disponibilidade;
* atualização de reservas;
* cancelamento;
* expiração automática;
* QR Code;
* check-in;
* pagamentos;
* dashboard;
* estatísticas;
* mapa interativo;
* Help Center;
* pedidos de suporte;
* validação;
* regras de negócio;
* integridade das relações;
* performance de queries.

Antes de uma integração ou entrega devem ser executados:

```bash
php artisan optimize:clear
composer dump-autoload
npm.cmd run build
php artisan test
php artisan route:list
```

---

# 📚 Documentação

A documentação técnica encontra-se na pasta `docs`.

| Documento               | Descrição                                                 |
| ----------------------- | --------------------------------------------------------- |
| `01-Requisitos.md`      | Requisitos funcionais, não funcionais e regras de negócio |
| `02-CasosDeUso.md`      | Atores, interações e casos de uso                         |
| `03-ModeloBaseDados.md` | Entidades, relações e modelo da base de dados             |
| `04-Arquitetura.md`     | Arquitetura técnica da aplicação                          |
| `05-API.md`             | Endpoints, autenticação, autorização e respostas          |
| `06-EvolucaoProjeto.md` | Evolução do projeto e trabalho futuro                     |
| `07-DicionarioDados.md` | Estrutura das tabelas e respetivos campos                 |
| `08-DocumentoMestre.md` | Contexto permanente e decisões consolidadas               |

---

# 🌱 Seeders e dados iniciais

A aplicação inclui dados iniciais para facilitar a instalação e demonstração.

São criados:

* papéis;
* utilizadores;
* períodos;
* estados das reservas;
* edifícios;
* pisos;
* setores;
* secretárias;
* reservas de exemplo;
* FAQs.

Os períodos principais são:

* Manhã
* Tarde

Os estados das reservas são:

* pendente
* confirmada
* cancelada
* expirada

---

# 🔄 Estados e regras principais

## Reservas

```text
pendente
    ├── confirmada
    ├── cancelada
    └── expirada
```

## Pagamentos

```text
pendente
    ├── pago
    └── cancelado
```

As alterações de estado respeitam regras de negócio e autorização.

---

# 👥 Equipa

Projeto desenvolvido por:

* Ângela Costa
* Eduardo
* Joana Oliveira
* Hanna Sampaio

Divisão principal do trabalho:

* **Pessoa 1 — Joana:** Reservas
* **Pessoa 2 — Ângela:** Administração, espaços, segurança, integração e documentação
* **Pessoa 3 — Eduardo:** Comunicação em tempo real, Laravel Reverb e chat
* **Pessoa 4 — Hanna:** Dashboard, estatísticas, mapa, QR Code e check-in

Formadores:

* Sara
* Rui

O trabalho foi integrado através de branches de funcionalidade e Pull Requests, preservando a autoria dos commits dos diferentes elementos da equipa.

---

# 🔀 Git e integração

O processo de integração utilizado foi:

```text
Branch de funcionalidade
        ↓
Commit
        ↓
Push
        ↓
Pull Request
        ↓
Create a merge commit
        ↓
main
```

Este processo permite:

* preservar a autoria dos commits;
* manter o histórico do projeto;
* facilitar a revisão;
* identificar as contribuições individuais;
* reduzir o risco durante as integrações.

---

# 📌 Estado do Projeto

O projeto encontra-se em fase de revisão final e preparação da entrega.

Funcionalidades concluídas:

* autenticação;
* autorização;
* gestão de utilizadores;
* gestão de espaços;
* reservas;
* disponibilidade;
* pagamentos simulados;
* QR Code;
* check-in;
* dashboard;
* estatísticas;
* mapa interativo;
* uploads;
* Help Center;
* pedidos de suporte;
* Laravel Reverb;
* comunicação em tempo real;
* testes automatizados;
* documentação técnica.

Tarefas finais:

* revisão visual do frontend;
* confirmação do número final de rotas;
* remoção de código e rotas técnicas;
* atualização final da documentação;
* preparação da apresentação;
* preparação da entrega.

---

# 🔮 Trabalho Futuro

Possíveis evoluções:

* integração com pagamentos reais;
* integração com Google Calendar;
* integração com Microsoft Outlook;
* notificações por email;
* notificações em tempo real;
* auditoria persistente;
* aplicação mobile;
* Single Sign-On;
* integração com sistemas de controlo de acessos;
* histórico persistente de mensagens;
* relatórios avançados;
* previsão de ocupação através de Inteligência Artificial;
* novo estado `concluida` para as reservas, após definição formal do respetivo ciclo de vida.

---

# 📄 Licença

Este projeto foi desenvolvido no âmbito académico e destina-se a fins educativos.

---

<div align="center">

# SpaceHub

### Sistema de Gestão e Reserva de Espaços Colaborativos

Laravel • React • Inertia.js • Tailwind CSS • MySQL

Sanctum • Reverb • Echo • PHPUnit

---

**154 testes automatizados aprovados**

**Projeto revisto, documentado e em preparação para a entrega final**

</div>
