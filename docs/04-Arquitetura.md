4. Arquitetura da Aplicação

4.1 Introdução

O SpaceHub foi desenvolvido segundo uma arquitetura em camadas baseada no padrão Model-View-Controller (MVC), utilizando Laravel 12 no backend e React no frontend, com integração através do Inertia.js.

A solução combina três formas de comunicação:

Interface web com Inertia.jsAs rotas Laravel entregam páginas React e respetivas propriedades, utilizando autenticação baseada em sessão e proteção CSRF.

API RESTDisponibiliza endpoints JSON protegidos por Laravel Sanctum, utilizados em operações autenticadas, testes de integração e possíveis integrações externas.

Comunicação em tempo realOs eventos são transmitidos através de Laravel Reverb, broadcasting e Laravel Echo, permitindo atualizar o mapa, notificações, chat e outros elementos sem recarregar toda a página.

A arquitetura foi organizada para garantir:

separação de responsabilidades;

centralização das regras de negócio;

validação e autorização no backend;

reutilização de componentes;

manutenção e evolução do sistema;

proteção dos dados;

facilidade de teste;

integração entre módulos.

4.2 Tecnologias e responsabilidades

Tecnologia

Responsabilidade

Laravel 12

Rotas, Controllers, autenticação, autorização, validação, Services, eventos e tarefas automáticas

React

Interface gráfica, componentes e interação com o utilizador

Inertia.js

Ligação entre as rotas Laravel e as páginas React

Tailwind CSS

Estilo visual, responsividade e consistência da interface

Vite

Compilação e otimização dos recursos do frontend

MySQL

Persistência relacional dos dados

Eloquent ORM

Acesso aos dados e gestão das relações entre Models

Laravel Sanctum

Autenticação das rotas API

Laravel Reverb

Servidor WebSocket e comunicação em tempo real

Laravel Echo

Subscrição de canais e receção de eventos no frontend

PHPUnit

Testes automatizados

Git e GitHub

Controlo de versões, branches, Pull Requests e integração do trabalho

4.3 Arquitetura geral

A aplicação encontra-se dividida nas seguintes camadas:

Camada

Componentes

Responsabilidade

Apresentação

React, Pages, Components, Layouts

Apresentar dados e recolher ações do utilizador

Comunicação

Inertia.js, HTTP, JSON, formulários

Transportar pedidos e respostas

Encaminhamento

web.php, api.php, channels.php

Associar pedidos às operações da aplicação

Segurança

Sessões, Sanctum, middleware, Policies, CSRF

Autenticar e autorizar operações

Aplicação

Controllers, Form Requests, Resources, Services

Coordenar pedidos e regras de negócio

Domínio

Models, estados, relações e regras

Representar os conceitos centrais do sistema

Persistência

Eloquent ORM e MySQL

Guardar e consultar dados

Tempo real

Events, Broadcasting, Reverb e Echo

Propagar alterações aos clientes ligados

Processamento automático

Commands e Scheduler

Executar tarefas periódicas

Qualidade

PHPUnit, Factories e Seeders

Validar comportamentos e preparar ambientes

Representação gráfica

A imagem seguinte reúne:

Figura 4.1 — Arquitetura Geral do SpaceHub;

Figura 4.2 — Fluxo de Criação de uma Reserva;

Figura 4.3 — Arquitetura MVC do Backend.



A representação é conceptual. Na interface web, as respostas são normalmente entregues pelo Inertia.js; nas rotas API, são devolvidas respostas JSON.

4.4 Padrão Model-View-Controller

4.4.1 Model

Os Models representam as entidades do domínio e a respetiva persistência.

Entre os principais Models encontram-se:

User;

Role;

Edificio;

Piso;

Setor;

Secretaria;

Reserva;

Periodo;

EstadoReserva;

Pagamento;

Avaliacao;

Faq;

PedidoSuporte.

Os Models definem:

atributos preenchíveis;

casts;

relações Eloquent;

scopes de consulta;

métodos auxiliares da entidade;

comportamentos simples relacionados com o domínio.

As relações mais utilizadas são:

belongsTo()
hasMany()
hasOne()

A lógica de negócio complexa não deve ficar concentrada nos Models.

4.4.2 View

A camada de apresentação é construída maioritariamente com React.

As páginas são entregues através do Inertia.js e recebem do backend os dados necessários sob a forma de propriedades.

A interface é responsável por:

apresentar informação;

recolher dados;

controlar estados visuais;

mostrar erros de validação;

executar navegação Inertia;

atualizar componentes;

apresentar tabelas, formulários, mapas e gráficos;

reagir a eventos em tempo real.

A estrutura Blade existente funciona essencialmente como ponto de entrada da aplicação Inertia.

4.4.3 Controller

Os Controllers recebem os pedidos e coordenam as camadas seguintes.

As suas responsabilidades incluem:

obter o utilizador autenticado;

autorizar a operação;

receber dados já validados;

chamar Services;

consultar ou atualizar Models;

carregar relações;

emitir eventos;

devolver páginas Inertia;

devolver Resources ou JSON;

efetuar redirecionamentos;

apresentar mensagens de sucesso ou erro.

Os Controllers devem permanecer focados na coordenação. Regras extensas, reutilizáveis ou com vários efeitos laterais são transferidas para Services.

4.5 Fluxo de uma requisição

4.5.1 Fluxo web com Inertia

Utilizador
    ↓
Página ou componente React
    ↓
Pedido HTTP
    ↓
Rota web
    ↓
Middleware
    ↓
Form Request e Policy
    ↓
Controller
    ↓
Service / Model
    ↓
Eloquent ORM
    ↓
MySQL
    ↓
Inertia::render() ou redirecionamento
    ↓
Página React atualizada

4.5.2 Fluxo API

Cliente
    ↓
Pedido HTTP com JSON
    ↓
Rota API
    ↓
auth:sanctum / active / role
    ↓
Form Request e Policy
    ↓
Controller
    ↓
Service / Model
    ↓
Base de dados
    ↓
API Resource
    ↓
Resposta JSON

4.5.3 Respostas HTTP

As respostas mais relevantes incluem:

Código

Significado

200

Operação concluída

201

Recurso criado

401

Utilizador não autenticado

403

Operação não autorizada

404

Recurso inexistente

422

Dados inválidos

500

Erro interno não previsto

4.6 Organização do projeto

A estrutura principal segue as convenções do Laravel:

app/
├── Console/
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

resources/
├── js/
│   ├── Components/
│   ├── Layouts/
│   ├── Pages/
│   ├── app.jsx
│   └── bootstrap.js
└── views/

routes/
├── api.php
├── channels.php
└── web.php

tests/
├── Feature/
└── Unit/

A estrutura real pode incluir diretórios adicionais criados durante a evolução do projeto, mantendo-se a separação por responsabilidade.

4.7 Componentes do backend

4.7.1 Rotas

As rotas web encontram-se em:

routes/web.php

São utilizadas pela interface React através do Inertia.js e incluem:

dashboard;

perfil;

gestão de espaços;

reservas;

disponibilidade;

mapa;

check-in;

pagamentos;

avaliações;

notificações;

chat;

Help Center;

páginas administrativas.

As rotas API encontram-se em:

routes/api.php

São utilizadas para:

autenticação por token;

operações JSON;

testes de endpoints;

integrações externas;

acesso desacoplado aos recursos.

A autorização dos canais privados é definida em:

routes/channels.php

4.7.2 Middleware

Os principais mecanismos são:

auth — exige autenticação;

auth:sanctum — protege endpoints API;

active — bloqueia contas inativas;

role — restringe rotas por papel;

proteção CSRF — protege os formulários e pedidos web.

A combinação de middleware permite rejeitar pedidos antes de estes chegarem à lógica do Controller.

4.7.3 Form Requests

Os Form Requests centralizam a validação dos dados de entrada.

Permitem definir:

campos obrigatórios;

tipos de dados;

limites;

formatos;

datas;

chaves estrangeiras;

regras de unicidade;

validação de ficheiros;

mensagens de erro.

Exemplo conceptual:

public function rules(): array
{
    return [
        'secretaria_id' => ['required', 'integer', 'exists:secretarias,id'],
        'periodo_id' => ['required', 'integer', 'exists:periodos,id'],
        'data' => ['required', 'date'],
        'tipo_duracao' => ['required', 'string'],
    ];
}

A validação no servidor é obrigatória, mesmo quando existe validação no frontend.

4.7.4 Policies

As Policies centralizam as permissões sobre cada recurso.

Entre as principais encontram-se:

UserPolicy;

EdificioPolicy;

PisoPolicy;

SetorPolicy;

SecretariaPolicy;

ReservaPolicy;

PagamentoPolicy;

Policies associadas a avaliações e suporte.

Os métodos podem incluir:

viewAny
view
create
update
delete
toggleAtivo
cancelar
confirmar
moderar

Exemplo:

Gate::authorize('update', $reserva);

As Policies verificam o papel, a propriedade do recurso, o estado e outras condições da operação.

4.7.5 Services

Os Services concentram regras que não devem permanecer nos Controllers.

O PagamentoService é um exemplo central e pode ser responsável por:

calcular valores;

criar pagamentos;

gerar referências;

confirmar ou cancelar pagamentos;

aplicar transições de estado;

manter coerência entre pagamento e reserva.

A arquitetura também permite utilizar Services para:

dashboard;

disponibilidade;

reservas;

notificações;

relatórios;

integrações futuras.

4.7.6 API Resources

Os Resources controlam a representação JSON dos Models.

Permitem:

selecionar campos;

formatar datas;

apresentar relações;

ocultar informação interna;

manter respostas consistentes.

Os Resources não substituem os Models nem os Services; atuam apenas na serialização das respostas.

4.7.7 Events e Notifications

Os Events representam acontecimentos relevantes, como:

reserva criada;

reserva cancelada;

check-in realizado;

pagamento confirmado;

mapa atualizado;

nova mensagem;

alteração de notificação.

As Notifications permitem guardar ou enviar informação destinada a um utilizador.

4.7.8 Commands e Scheduler

Os Commands executam operações automáticas ou administrativas.

O Scheduler é utilizado em tarefas como:

expiração de reservas sem check-in;

cancelamento de reservas com pagamentos pendentes;

atualização de estados;

limpeza ou manutenção periódica.

Exemplo conceptual:

Schedule::command('reservas:cancelar-expiradas')
    ->everyMinute();

4.8 Organização do frontend

4.8.1 Pages

As Pages representam ecrãs completos da aplicação.

Exemplo conceptual:

Pages/
├── Auth/
├── Dashboard/
├── Profile/
├── Reservas/
├── Pagamentos/
├── Avaliacoes/
├── Notificacoes/
├── HelpCenter/
├── Mapa/
└── Admin/

4.8.2 Components

Os Components representam elementos reutilizáveis, como:

cartões estatísticos;

cabeçalhos;

menu lateral;

formulários;

tabelas;

modais;

paginação;

cartões de reserva;

estados de pagamento;

mapa de secretárias;

indicadores de disponibilidade;

mensagens de erro;

controlos acessíveis.

A componentização reduz duplicação e mantém consistência entre páginas.

4.8.3 Layouts

Os Layouts definem estruturas partilhadas:

cabeçalho;

navegação;

menu lateral;

conteúdo principal;

perfil;

notificações;

chat;

Help Center.

O menu foi preparado para diferentes dimensões de ecrã, incluindo navegação responsiva.

4.8.4 Inertia.js

O Inertia.js permite que o backend devolva diretamente uma página React:

return Inertia::render('Reservas/Index', [
    'reservas' => $reservas,
]);

Esta integração permite:

reutilizar rotas Laravel;

manter autenticação e autorização no backend;

apresentar erros de validação;

utilizar mensagens de sessão;

navegar sem recarregar toda a página;

evitar uma API separada para cada ecrã web.

4.8.5 Tailwind CSS e Vite

O Tailwind CSS é utilizado para:

responsividade;

estados visuais;

acessibilidade;

consistência;

composição rápida de layouts.

O Vite é utilizado para:

compilar React;

processar JavaScript e CSS;

atualização rápida em desenvolvimento;

gerar recursos otimizados para produção.

4.9 Autenticação e controlo de acesso

4.9.1 Autenticação web

A interface web utiliza a autenticação baseada em sessão disponibilizada pelo Laravel.

As funcionalidades incluem:

registo;

login;

logout;

recuperação de palavra-passe;

redefinição de palavra-passe;

gestão do perfil;

alteração de palavra-passe;

Single Sign-On;

bloqueio de contas inativas.

4.9.2 Autenticação da API

O Laravel Sanctum protege as rotas API através de tokens.

Fluxo conceptual:

Credenciais
    ↓
AuthController
    ↓
Validação
    ↓
Token Sanctum
    ↓
Authorization: Bearer <token>
    ↓
Endpoint protegido

4.9.3 Papéis

O SpaceHub utiliza:

Papel

Responsabilidade geral

Administrador

Gestão global e gestão de utilizadores

Gestor

Gestão operacional dos espaços

Colaborador

Consulta e operações autorizadas

Utilizador

Perfil, reservas, pagamentos e funcionalidades próprias

A tabela é apenas um resumo. As permissões efetivas são aplicadas pelas Policies e pelo middleware.

4.9.4 Defesa em profundidade

A segurança é aplicada em várias camadas:

Pedido
  ↓
Autenticação
  ↓
Conta ativa
  ↓
Papel, quando aplicável
  ↓
Policy
  ↓
Validação
  ↓
Controller / Service
  ↓
Model / Base de dados

4.10 Segurança da aplicação

A arquitetura utiliza:

hashing de palavras-passe;

proteção CSRF;

Sanctum;

Policies e Gates;

middleware;

Form Requests;

restrições da base de dados;

proteção contra mass assignment;

validação de ficheiros;

validação de propriedade dos recursos;

tratamento de exceções;

logging técnico.

4.10.1 Mass assignment

Os Models definem explicitamente os campos permitidos:

protected $fillable = [
    // campos autorizados
];

Os campos sensíveis não devem ser preenchidos diretamente a partir do pedido.

4.10.2 Casts

Os casts convertem valores para os tipos esperados:

protected function casts(): array
{
    return [
        'ativo' => 'boolean',
        'data' => 'date',
        'data_fim' => 'date',
    ];
}

4.10.3 Uploads

Os uploads validam:

extensão;

tipo MIME;

tamanho;

presença do ficheiro;

substituição do ficheiro anterior.

Os ficheiros são armazenados através do Laravel Storage:

storage/app/public

e disponibilizados por:

public/storage

4.10.4 Logging e auditoria

O logging técnico regista erros e informação operacional através dos mecanismos do Laravel.

Uma auditoria administrativa completa, com histórico detalhado de todas as alterações realizadas por cada utilizador, mantém-se como evolução futura e não deve ser confundida com os logs técnicos.

4.11 Persistência e acesso aos dados

4.11.1 Eloquent ORM

O Eloquent é utilizado para:

criar;

consultar;

atualizar;

desativar;

carregar relações;

filtrar;

ordenar;

paginar;

executar transações.

Os componentes React nunca acedem diretamente à base de dados.

4.11.2 MySQL e migrations

O MySQL armazena os dados relacionais.

As migrations controlam:

tabelas;

colunas;

índices;

chaves estrangeiras;

restrições;

alterações de estrutura.

Os seeders preparam dados iniciais e de demonstração.

As factories criam dados consistentes para testes.

4.11.3 Eager loading

O eager loading reduz consultas repetidas e evita o problema N+1.

Exemplo conceptual:

Reserva::with([
    'user',
    'secretaria.setor.piso.edificio',
    'periodo',
    'estadoReserva',
    'pagamento',
])->paginate();

4.11.4 Pesquisa, filtros e paginação

As listagens com crescimento potencial aplicam os filtros no backend antes da paginação.

$query
    ->when($request->filled('estado'), function ($query) use ($request) {
        $query->where('estado', $request->estado);
    })
    ->paginate(10)
    ->withQueryString();

4.11.5 Transações

Operações que atualizam vários registos relacionados devem utilizar transações.

Exemplo:

DB::transaction(function () {
    // criar reserva
    // criar pagamento
    // emitir alterações dependentes
});

A transação evita que a reserva e o pagamento fiquem num estado parcial.

4.12 Arquitetura dos módulos principais

4.12.1 Gestão de utilizadores

O módulo combina:

Rotas
→ Middleware
→ UserController
→ Form Requests
→ UserPolicy
→ User
→ MySQL
→ Página React ou UserResource

Inclui gestão de papéis, estado ativo, perfil e fotografia.

4.12.2 Gestão de espaços

A hierarquia é:

Edifício
└── Piso
    └── Setor
        └── Secretária

Cada módulo possui Model, Controller, Form Requests, Policy, rotas, interface e testes.

O mapa utiliza coordenadas, dimensões e características armazenadas nos setores e secretárias.

4.12.3 Reservas

O módulo de reservas integra:

disponibilidade;

duração diária, semanal, mensal e anual;

período Manhã, Tarde ou Dia inteiro;

cálculo da data final;

validação de sobreposições;

estados;

pagamento;

check-in;

mapa;

eventos;

tarefas automáticas.

Uma reserva longa corresponde a um único registo de reserva e a um único pagamento.

4.12.4 Pagamentos

O pagamento é criado automaticamente após a reserva.

O módulo utiliza:

PagamentoController
→ PagamentoPolicy
→ Form Request
→ PagamentoService
→ Pagamento / Reserva
→ Base de dados

Os métodos simulados são:

Cartão;

MB Way;

Transferência Bancária;

PayPal.

O processamento não movimenta dinheiro real.

4.12.5 Mapa e check-in

O mapa combina:

estrutura física;

posições;

reservas;

estados;

disponibilidade.

O check-in utiliza um qr_token único associado à secretária.

QR Code
→ Secretaria
→ Reserva elegível
→ Utilizador autenticado
→ Validação
→ Check-in
→ Reserva confirmada
→ Evento de atualização

4.12.6 Dashboard

O dashboard agrega informação de vários módulos.

Pode utilizar:

Services;

consultas agregadas;

eager loading;

cache;

eventos em tempo real.

Apresenta indicadores, próximas reservas, ocupação, estados e informação financeira autorizada.

4.12.7 Avaliações

As avaliações são associadas a reservas elegíveis.

A arquitetura inclui:

autorização;

validação;

persistência;

moderação;

cálculo de médias por setor;

atualização da interface.

4.12.8 Notificações

As notificações podem ser persistidas na base de dados e apresentadas no frontend.

São utilizadas para acontecimentos como:

reservas;

pagamentos;

check-in;

avaliações;

suporte.

4.12.9 Chat

O chat combina persistência e comunicação em tempo real:

Mensagem
→ Controller
→ Validação e autorização
→ Base de dados
→ Evento
→ Reverb
→ Echo
→ Participantes autorizados

4.12.10 Help Center

O Help Center integra:

FAQs;

pedidos de suporte;

validação;

Policies;

interface React;

acompanhamento de estados.

4.13 Comunicação em tempo real

4.13.1 Laravel Reverb

O Reverb funciona como servidor WebSocket.

Permite que o backend envie eventos sem aguardar um novo pedido do cliente.

4.13.2 Laravel Echo

O Echo subscreve canais e recebe eventos no frontend.

Exemplo conceptual:

window.Echo
    .channel('mapa')
    .listen('MapaAtualizado', () => {
        router.reload({
            only: ['secretarias'],
        });
    });

4.13.3 Canais

Podem existir:

canais públicos;

canais privados;

canais de presença.

Informação associada a utilizadores ou conversas deve utilizar canais autenticados.

4.13.4 Evento de atualização do mapa

Reserva criada, alterada ou cancelada
    ↓
Evento MapaAtualizado
    ↓
Broadcast
    ↓
Laravel Reverb
    ↓
Laravel Echo
    ↓
Componente React
    ↓
Mapa atualizado

Este mecanismo reduz inconsistências visuais entre utilizadores ligados em simultâneo.

4.14 Fluxos técnicos principais

4.14.1 Criação de uma reserva

Utilizador autenticado
    ↓
Seleciona data, duração, período e secretária
    ↓
StoreReservaRequest
    ↓
ReservaPolicy
    ↓
Validação de disponibilidade e conflitos
    ├── conflito → operação rejeitada
    └── sem conflito
            ↓
       Reserva criada
            ↓
       PagamentoService
            ↓
       Pagamento criado
            ↓
       Evento emitido
            ↓
       Interface atualizada

4.14.2 Confirmação do pagamento

Pagamento pendente
    ↓
Utilizador seleciona o método
    ↓
PagamentoPolicy
    ↓
Validação
    ↓
PagamentoService
    ↓
Processamento simulado
    ├── erro → estado mantido ou falhado, conforme a regra
    └── sucesso
            ↓
       Pagamento confirmado
            ↓
       Reserva atualizada
            ↓
       Histórico disponível

4.14.3 Check-in

Leitura do QR Code
    ↓
Identificação da secretária
    ↓
Pesquisa da reserva elegível
    ↓
Validação do utilizador, data, período e estado
    ├── inválido → check-in rejeitado
    └── válido
            ↓
       Reserva confirmada
            ↓
       Mapa e dashboard atualizados

4.14.4 Autorização

Pedido
    ↓
Autenticação
    ├── falha → 401 ou redirecionamento
    ↓
Middleware active
    ├── conta inativa → 403
    ↓
Middleware role, quando aplicável
    ├── papel inválido → 403
    ↓
Policy
    ├── operação não autorizada → 403
    ↓
Form Request
    ├── dados inválidos → 422
    ↓
Controller / Service

4.15 Desempenho e otimização

As principais medidas incluem:

eager loading;

paginação;

índices na base de dados;

filtros executados no backend;

seleção dos campos necessários;

consultas agregadas;

cache no dashboard;

componentes React reutilizáveis;

recarregamento parcial com Inertia;

atualização por eventos;

build otimizado com Vite.

A cache deve ser invalidada quando os dados que alimentam o dashboard ou as estatísticas são alterados.

4.16 Tratamento de erros

A aplicação trata os erros em diferentes níveis:

validação com Form Requests;

autorização com Policies;

exceções do Laravel;

respostas HTTP adequadas;

mensagens de sessão;

mensagens de validação no React;

logs técnicos;

rollback de transações.

Os erros apresentados ao utilizador não devem expor dados internos, queries, tokens ou configurações sensíveis.

4.17 Testes automatizados

Os testes são desenvolvidos com PHPUnit.

Tipos de teste

Feature Tests — validam fluxos HTTP, autenticação, autorização e integração entre camadas;

Unit Tests — validam Services e comportamentos isolados.

Áreas cobertas

autenticação e recuperação de palavra-passe;

utilizadores inativos;

papéis, middleware e Policies;

gestão de utilizadores;

edifícios, pisos, setores e secretárias;

reservas e disponibilidade;

reservas longas;

conflitos;

pagamentos;

mapa;

QR Code e check-in;

dashboard;

uploads;

avaliações;

notificações;

Help Center;

filtros e paginação;

regras de negócio.

Na versão de referência da documentação, encontravam-se registados 154 testes aprovados. Antes da entrega final, a contagem deve ser confirmada com:

php artisan test

Processo de validação

php artisan optimize:clear
composer dump-autoload
php artisan test
php artisan route:list
npm.cmd run build

Quando existirem alterações de dependências:

composer install
npm.cmd install

4.18 Boas práticas adotadas

separação de responsabilidades;

Controllers focados em coordenação;

Services para lógica complexa;

Form Requests para validação;

Policies para autorização;

Resources para respostas JSON;

Eloquent para relações e persistência;

componentes React reutilizáveis;

eager loading;

paginação;

transações;

eventos para desacoplamento;

testes automatizados;

Git com branches e Pull Requests;

merges que preservam a autoria dos elementos da equipa.

4.19 Decisões arquiteturais

As principais decisões foram:

utilizar Laravel 12 como framework principal;

adotar o padrão MVC;

utilizar React como camada de apresentação;

utilizar Inertia.js na interface web;

manter uma API REST protegida por Sanctum;

utilizar Policies e middleware para autorização;

utilizar Form Requests para validação;

utilizar Services para regras de negócio complexas;

utilizar Eloquent e MySQL para persistência;

utilizar Reverb e Echo para tempo real;

utilizar QR Code para check-in;

associar pagamentos às reservas;

representar reservas longas num único registo;

utilizar testes automatizados;

preservar a arquitetura existente durante a evolução do projeto.

4.20 Limitações atuais

As limitações assumidas incluem:

pagamentos simulados, sem movimentação financeira real;

dependência do Scheduler para tarefas automáticas;

dependência do Reverb para comunicação em tempo real;

ausência de integração final com Google Calendar e Outlook;

ausência de uma aplicação móvel;

auditoria administrativa completa ainda não implementada;

necessidade de configuração adequada do ambiente para filas, Scheduler e WebSockets.

Estas limitações não impedem a demonstração das funcionalidades previstas para o projeto académico.

4.21 Considerações finais

A arquitetura do SpaceHub combina Laravel, React e Inertia.js numa solução híbrida, mantendo a lógica, a validação e a segurança centralizadas no backend.

A separação entre Controllers, Form Requests, Policies, Services, Models e Resources reduz o acoplamento e facilita os testes.

O Eloquent e o MySQL asseguram a persistência dos dados, enquanto o Reverb e o Echo permitem refletir alterações em tempo real.

A organização por módulos possibilitou integrar reservas, pagamentos, avaliações, notificações, chat, Help Center, dashboard, mapas e check-in sem substituir a arquitetura inicial.

Desta forma, o SpaceHub apresenta uma arquitetura modular, segura, testável e adequada aos objetivos do projeto académico.