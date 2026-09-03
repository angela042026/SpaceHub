Documento Mestre do Projeto — SpaceHub

Versão: 4.0

Estado: versão final integrada e validada

Backend: Laravel 12

Frontend: React 18.2 + Inertia.js + Tailwind CSS

Base de dados: MySQL

Autenticação: Laravel Sanctum + autenticação web + Single Sign-On

Tempo real: Laravel Reverb + Laravel Echo para atualizações do mapa

Testes: 349 testes PHP com 1916 asserções e 20 testes frontend

1. Finalidade do documento

Este documento funciona como contexto técnico e funcional permanente do projeto SpaceHub.

Deve ser utilizado para:

contextualizar novas conversas sobre o projeto;

preservar decisões funcionais e arquiteturais;

evitar alterações incompatíveis com a estrutura existente;

acompanhar o estado atual da aplicação;

registar convenções de desenvolvimento;

orientar correções, testes e preparação da entrega;

complementar a documentação existente na pasta docs.

Este documento não substitui os capítulos detalhados de requisitos, casos de uso, base de dados, arquitetura, API e dicionário de dados.

2. Objetivo do projeto

O SpaceHub é uma aplicação web destinada à gestão e reserva de postos de trabalho em espaços colaborativos.

A plataforma permite:

gerir utilizadores e permissões;

gerir edifícios, pisos, setores e secretárias;

consultar a disponibilidade dos espaços;

visualizar plantas e mapas interativos;

criar reservas de diferentes durações;

editar ou cancelar reservas elegíveis;

efetuar check-in através de QR Code ou presencialmente na receção;

gerir pagamentos simulados;

consultar dashboards e estatísticas;

receber notificações;

obter apoio através de um assistente virtual baseado nas FAQs;

avaliar reservas e espaços;

consultar FAQs e submeter pedidos de suporte.

O projeto foi desenvolvido em contexto académico, com foco em:

arquitetura MVC;

desenvolvimento full-stack;

segurança;

bases de dados;

regras de negócio;

APIs REST;

testes automatizados;

trabalho colaborativo com Git e GitHub.

3. Tecnologias utilizadas

3.1 Backend

Laravel 12;

PHP;

Eloquent ORM;

Laravel Sanctum;

Form Requests;

API Resources;

Policies;

Gates;

Middleware;

Services;

Events;

Notifications;

Broadcasting;

Scheduler;

Commands Artisan;

Storage;

PHPUnit.

3.2 Frontend

React;

Inertia.js;

Tailwind CSS;

Vite;

Recharts;

Laravel Echo;

bibliotecas de QR Code;

leitor de QR Code com acesso à câmara.

3.3 Persistência e infraestrutura

MySQL;

migrations;

seeders;

factories;

sessões em base de dados, quando configuradas;

cache;

filas, quando configuradas;

Laravel Reverb para WebSockets.

3.4 Colaboração e controlo de versões

Git;

GitHub;

branches de funcionalidade;

Pull Requests;

merge commits;

preservação da autoria dos commits.

4. Arquitetura geral

O SpaceHub utiliza uma arquitetura em camadas baseada no padrão Model-View-Controller.

4.1 Interface web

A interface web utiliza React e Inertia.js.

Fluxo principal:

Utilizador
    ↓
Página ou componente React
    ↓
Pedido Inertia / HTTP
    ↓
Rota web
    ↓
Middleware
    ↓
Controller
    ↓
Form Request / Policy / Service
    ↓
Model / Eloquent
    ↓
MySQL
    ↓
Resposta Inertia ou redirecionamento
    ↓
Interface atualizada

4.2 API REST

A API utiliza respostas JSON e autenticação através de Laravel Sanctum.

Fluxo principal:

Cliente
    ↓
Pedido HTTP / JSON
    ↓
Rota API
    ↓
auth:sanctum / active / role
    ↓
Form Request
    ↓
Policy / Gate
    ↓
Controller / Service
    ↓
Model / Eloquent
    ↓
MySQL
    ↓
API Resource
    ↓
Resposta JSON

4.3 Comunicação em tempo real

Alteração no backend
    ↓
Event
    ↓
Broadcasting
    ↓
Laravel Reverb
    ↓
Laravel Echo
    ↓
Componente React

Esta comunicação é utilizada principalmente no mapa e noutros componentes que necessitam de atualização dinâmica.

5. Estrutura principal do projeto

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

docs/
├── 01-Requisitos.md
├── 02-CasosDeUso.md
├── 03-ModeloBaseDados.md
├── 04-Arquitetura.md
├── 05-API.md
├── 06-EvolucaoProjeto.md
├── 07-DicionarioDados.md
└── 08-DocumentoMestre.md

A estrutura real pode incluir diretórios adicionais, desde que mantenha a separação de responsabilidades.

6. Decisões funcionais consolidadas

6.1 Edifício substitui Localidade

A entidade inicialmente designada por Localidade foi substituída por Edificio.

Hierarquia final:

Edifício
└── Piso
    └── Setor
        └── Secretária

Regras:

não criar um novo módulo de Localidades;

migrations antigas de localidades são consideradas legado;

toda a lógica deve utilizar a hierarquia atual.

6.2 Papéis fixos

Os papéis existentes são:

Administrador;

Gestor;

Colaborador;

Utilizador.

Os papéis são criados através de seeders.

Não existe CRUD de papéis.

6.3 Ativação e desativação lógica

As entidades principais utilizam o campo:

ativo

Esta regra aplica-se, entre outras, a:

utilizadores;

edifícios;

pisos;

setores;

secretárias;

FAQs.

A desativação:

preserva o histórico;

impede novas operações;

evita perda de relações;

permite reativação futura.

Não devem ser adicionadas eliminações físicas sem análise prévia do impacto.

6.4 Estados das reservas

Estados implementados:

pendente;

confirmada;

cancelada;

expirada.

O estado concluida não está implementado.

Não deve ser acrescentado sem definir:

momento da transição;

processo responsável;

impacto no dashboard;

impacto nas avaliações;

impacto nas estatísticas;

testes necessários.

6.5 Períodos e durações

Os períodos existentes são:

Manhã;

Tarde;

Dia inteiro.

As durações existentes são:

diária;

semanal;

mensal;

anual.

Semanal, mensal e anual não são períodos.

As reservas longas:

utilizam sempre o período Dia inteiro;

possuem tipo_duracao;

possuem data_fim;

geram uma única reserva;

geram um único pagamento.

6.6 Preços

Os preços são armazenados nos setores.

Campos principais:

preco_meio_dia
preco_dia_inteiro
preco_semanal
preco_mensal
preco_anual

Regras atuais:

semanal: cinco dias úteis;

mensal: vinte e dois dias úteis e desconto de 10%;

anual: duzentos e sessenta e quatro dias úteis e desconto de 20%.

Os períodos não armazenam preços.

6.7 Pagamentos simulados

Cada pagamento:

pertence a uma reserva;

possui valor;

possui referência única;

possui estado;

pode possuir método;

pode ser confirmado ou cancelado;

mantém as datas relevantes do ciclo de vida.

Estados principais:

pendente;

pago;

cancelado.

Métodos suportados:

Cartão;

MB Way;

Transferência Bancária;

PayPal.

O sistema não movimenta dinheiro real.

6.8 Single Sign-On

O Single Sign-On já se encontra implementado.

Não deve voltar a ser listado como funcionalidade pendente.

7. Autenticação e autorização

7.1 Funcionalidades

registo;

login;

logout;

recuperação de palavra-passe;

redefinição de palavra-passe;

alteração de palavra-passe;

gestão do perfil;

Single Sign-On;

consulta do utilizador autenticado;

bloqueio de contas inativas.

7.2 Autenticação web

As páginas privadas utilizam autenticação baseada em sessão:

auth

7.3 Autenticação da API

As rotas privadas utilizam:

auth:sanctum

7.4 Middleware

Principais mecanismos:

auth;

auth:sanctum;

active;

role;

proteção CSRF.

7.5 Policies

Principais Policies:

UserPolicy;

EdificioPolicy;

PisoPolicy;

SetorPolicy;

SecretariaPolicy;

ReservaPolicy;

PagamentoPolicy;

Policies associadas a avaliações e suporte.

As Policies devem considerar:

papel;

propriedade do recurso;

estado da entidade;

utilizador ativo;

regras específicas da operação.

8. Organização do backend

8.1 Controllers

Os Controllers devem:

receber pedidos;

coordenar operações;

chamar Policies;

receber dados validados;

chamar Services;

carregar relações;

devolver páginas Inertia;

devolver Resources ou JSON;

emitir mensagens e eventos.

Os Controllers não devem concentrar lógica de negócio complexa.

8.2 Form Requests

Os CRUDs utilizam classes:

StoreXXXXXRequest
UpdateXXXXXRequest

Exemplos:

StoreUserRequest;

UpdateUserRequest;

StoreEdificioRequest;

UpdateEdificioRequest;

StorePisoRequest;

UpdatePisoRequest;

StoreSetorRequest;

UpdateSetorRequest;

StoreSecretariaRequest;

UpdateSecretariaRequest;

StoreReservaRequest;

UpdateReservaRequest.

8.3 Resources

Os endpoints API devem utilizar Resources quando aplicável.

Exemplos:

UserResource;

EdificioResource;

PisoResource;

SetorResource;

SecretariaResource;

ReservaResource;

PagamentoResource.

Evitar a exposição direta de Models em respostas JSON.

8.4 Services

Os Services são utilizados para regras de negócio reutilizáveis.

O PagamentoService é responsável, entre outras operações, por:

calcular preços;

criar pagamentos;

gerar referências;

confirmar pagamentos;

cancelar pagamentos;

manter coerência entre reserva e pagamento.

Outros módulos podem utilizar Services para:

reservas;

disponibilidade;

dashboard;

notificações;

relatórios.

8.5 Route Model Binding

Preferir:

public function show(User $user)

Evitar queries repetidas como:

$user = User::findOrFail($id);

quando o Route Model Binding for adequado.

8.6 Palavras-passe

Utilizar:

Hash::make($password)

ou o cast:

'password' => 'hashed'

Nunca armazenar palavras-passe em texto simples.

9. Entidades principais

Role
User
Edificio
Piso
Setor
Secretaria
Periodo
EstadoReserva
Reserva
Pagamento
Avaliacao
Faq
PedidoSuporte

Existem também estruturas associadas a:

notificações;

registo de atividade;

tokens;

sessões;

cache;

filas.

As tabelas de avaliações, notificações e atividade correspondem às migrations avaliacoes, notifications e activity_logs. O assistente virtual reutiliza faqs e não possui tabelas de mensagens.

10. Gestão de utilizadores

Funcionalidades implementadas:

listar;

consultar;

criar;

atualizar;

pesquisar;

filtrar;

ordenar;

paginar;

alterar papel;

ativar ou desativar;

carregar fotografia;

substituir fotografia;

editar o próprio perfil;

alterar palavra-passe.

Regras:

apenas o Administrador gere utilizadores;

um Administrador não deve desativar a própria conta;

a desativação preserva o histórico;

a fotografia deve ser validada;

o email deve ser único.

Armazenamento das fotografias:

storage/app/public/utilizadores/fotografias

11. Gestão de espaços

11.1 Edifícios

listar;

consultar;

criar;

atualizar;

pesquisar;

filtrar;

ordenar;

paginar;

ativar ou desativar.

11.2 Pisos

listar;

consultar;

criar;

atualizar;

pesquisar;

filtrar;

ordenar;

paginar;

ativar ou desativar;

carregar planta;

substituir planta.

Armazenamento:

storage/app/public/pisos/plantas

11.3 Setores

listar;

consultar;

criar;

atualizar;

pesquisar;

filtrar;

ordenar;

paginar;

ativar ou desativar;

configurar reservabilidade;

definir preços;

posicionar no mapa.

11.4 Secretárias

listar;

consultar;

criar;

atualizar;

filtrar;

ordenar;

paginar;

ativar ou desativar;

configurar posição;

configurar características;

gerar QR Code.

Características principais:

monitor;

dock USB;

junto à janela;

ergonómica;

reservável;

ativa.

12. Reservas

12.1 Funcionalidades

consulta de disponibilidade;

criação;

atualização;

cancelamento;

histórico;

estados;

reservas diárias;

reservas semanais;

reservas mensais;

reservas anuais;

cálculo automático da data final;

validação de conflitos;

check-in;

expiração automática;

integração com pagamentos;

atualização do mapa;

emissão de eventos.

12.2 Regras principais

Uma reserva só pode ser criada quando:

o utilizador está ativo;

a secretária existe;

a secretária está ativa;

a secretária é reservável;

o setor está ativo e reservável;

o período é válido;

a duração é válida;

não existe conflito com outra reserva;

não existe conflito com outra reserva do utilizador.

As reservas canceladas, expiradas ou com check-in não podem ser alteradas de forma incompatível com o estado atual.

12.3 Disponibilidade

A disponibilidade considera:

data inicial;

data final;

duração;

período;

estado da secretária;

estado do setor;

reservabilidade;

reservas existentes em todo o intervalo.

12.4 Tarefas automáticas

O Scheduler pode executar:

expiração de reservas sem check-in;

cancelamento de reservas com pagamento pendente;

atualização de estados;

libertação de secretárias;

notificações associadas.

13. Pagamentos

13.1 Funcionalidades

criação automática;

associação à reserva;

cálculo do valor;

referência única;

consulta;

histórico;

confirmação;

cancelamento;

seleção do método;

atualização da reserva;

autorização;

testes.

13.2 Fluxo

Reserva criada
    ↓
PagamentoService
    ↓
Cálculo do valor
    ↓
Pagamento pendente
    ↓
Escolha do método
    ↓
Confirmação simulada
    ↓
Pagamento pago
    ↓
Reserva atualizada

13.3 Natureza académica

Não existe integração real com:

bancos;

redes de cartões;

MB Way;

PayPal;

gateways externos.

Uma integração real permanece como evolução futura.

14. QR Code e check-in presencial

Cada secretária possui um qr_token único.

Durante o check-in são validados:

utilizador autenticado;

propriedade da reserva;

data;

período;

duração;

secretária;

token;

estado da reserva;

inexistência de cancelamento.

Após o check-in:

é preenchido check_in_at;

a reserva passa a confirmada;

o mapa é atualizado;

podem ser emitidos eventos e notificações.

Administradores, Gestores e Colaboradores dispõem ainda de uma área de receção para pesquisar reservas do dia e confirmar presencialmente a chegada do utilizador. Este fluxo respeita a janela horária, o pagamento e o estado da reserva, registando em activity_logs o funcionário responsável.

15. Dashboard, estatísticas e mapa

Funcionalidades implementadas:

dashboard;

cartões de indicadores;

próximas reservas;

taxa de ocupação;

reservas por período;

reservas por estado;

reservas por edifício;

informação financeira autorizada;

mapa interativo;

editor gráfico;

atualização em tempo real;

cache;

consultas agregadas.

Evento utilizado na atualização do mapa:

MapaAtualizado

16. Avaliações

Funcionalidades implementadas:

avaliação de reservas elegíveis;

classificação;

comentário;

moderação;

cálculo da média por setor;

autorização;

notificações associadas.

Regras:

uma reserva apenas pode ser avaliada quando elegível;

não devem existir avaliações duplicadas para a mesma reserva;

a moderação depende das permissões;

a média deve ser calculada a partir dos dados reais.

17. Notificações

O sistema inclui notificações persistentes e, quando aplicável, notificações por email.

Podem ser geradas por:

criação de reserva;

alteração de reserva;

cancelamento;

expiração;

pagamento;

check-in;

avaliação;

pedido de suporte.

As notificações podem possuir estado de leitura.

18. Assistente virtual e comunicação em tempo real

O assistente virtual utiliza o ChatController e a tabela faqs. A pergunta é normalizada e comparada com perguntas, respostas e palavras-chave bilingues, sendo devolvida a FAQ mais relevante. Não existem conversas nem mensagens persistidas.

Laravel Reverb, Laravel Echo, Broadcasting e Events são utilizados nas atualizações em tempo real do mapa. Uma indisponibilidade do broadcasting é registada nos logs sem invalidar a operação principal já concluída.

19. Help Center

O Help Center inclui:

FAQs;

categorias;

conteúdos ativos;

pesquisa;

pedidos de suporte;

reporte de problemas;

acompanhamento do estado;

resposta administrativa;

associação ao utilizador autenticado.

Estados de suporte podem incluir:

aberto;

em tratamento;

resolvido;

fechado.

Os nomes finais devem corresponder ao Model e à migration.

20. Uploads

Uploads principais:

Fotografias

storage/app/public/utilizadores/fotografias

Plantas

storage/app/public/pisos/plantas

Link público:

php artisan storage:link

Regras:

validar tipo MIME;

validar extensão;

validar tamanho;

gerar nomes seguros;

substituir o ficheiro anterior;

remover ficheiros órfãos em caso de falha;

guardar apenas o caminho relativo na base de dados.

21. API

Grupos principais:

autenticação;

utilizadores;

edifícios;

pisos;

setores;

secretárias;

reservas;

disponibilidade;

pagamentos;

operações administrativas.

As funcionalidades web não devem ser automaticamente documentadas como endpoints API.

Confirmar as rotas reais com:

php artisan route:list --path=api

Operações normais de atualização utilizam preferencialmente:

PUT

Operações específicas podem utilizar:

PATCH

Exemplos:

PATCH /api/users/{user}/toggle-ativo
PATCH /api/reservas/{reserva}/cancelar
PATCH /api/pagamentos/{pagamento}/confirmar

Rotas técnicas de teste devem ser removidas antes da entrega, caso já não sejam necessárias.

22. Seeders e dados iniciais

Seeders principais conhecidos:

RoleSeeder;

PeriodoSeeder;

EstadoReservaSeeder;

SpaceHubEstruturaSeeder;

UserSeeder;

ReservaSeeder;

FaqSeeder.

Podem existir seeders adicionais para pagamentos, avaliações ou outros módulos.

A lista final deve ser confirmada em:

database/seeders

O projeto deve ser testado num ambiente de desenvolvimento com:

php artisan migrate:fresh --seed

Este comando apaga os dados e só deve ser utilizado num ambiente em que essa operação seja segura.

23. Testes automatizados

O projeto utiliza PHPUnit.

Áreas cobertas:

registo;

login;

logout;

recuperação de palavra-passe;

autenticação da API;

utilizadores inativos;

middleware;

Policies;

Gates;

gestão de utilizadores;

gestão de espaços;

uploads;

reservas;

reservas longas;

disponibilidade;

conflitos;

cancelamento;

expiração;

QR Code;

check-in;

pagamentos;

avaliações;

notificações;

dashboard;

mapa;

Help Center;

filtros;

pesquisa;

ordenação;

paginação;

Services;

regras de negócio.

Na validação final foram registados:

349 testes PHP aprovados, com 1916 asserções;

20 testes frontend aprovados em 3 ficheiros.

As contagens podem ser confirmadas com:

php artisan test
npm run test:frontend

24. Processo de validação

Depois de atualizar a branch main:

composer install
npm.cmd install
php artisan optimize:clear
php artisan migrate
npm.cmd run build
php artisan test
php artisan route:list

Para executar a aplicação:

php artisan serve

Frontend em desenvolvimento:

npm.cmd run dev

Tempo real:

php artisan reverb:start

Scheduler, quando necessário:

php artisan schedule:work

Não utilizar migrate:fresh numa base de dados com dados que devam ser preservados.

25. Git e integração

Fluxo utilizado:

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

Regras:

preservar a autoria;

evitar squash quando a autoria individual deve ser mantida;

testar antes do merge;

atualizar a main após a integração;

não alterar o histórico das branches dos colegas;

resolver conflitos numa branch de integração quando necessário.

Atualização da main:

git switch main
git fetch origin --prune
git pull --ff-only origin main

26. Estado atual

26.1 Concluído

backend Laravel;

frontend React com Inertia.js;

autenticação;

Single Sign-On;

recuperação de palavra-passe;

perfis;

utilizadores ativos e inativos;

gestão de utilizadores;

papéis;

Policies;

middleware;

gestão de edifícios;

gestão de pisos;

gestão de setores;

gestão de secretárias;

uploads;

mapa;

editor gráfico;

QR Codes;

reservas;

reservas longas;

disponibilidade;

histórico;

edição;

cancelamento;

check-in;

expiração automática;

pagamentos simulados;

dashboard;

estatísticas;

avaliações;

notificações;

assistente virtual;

Help Center;

FAQs;

pedidos de suporte;

comunicação em tempo real;

testes automatizados;

documentação técnica.

26.2 Fase atual

A fase atual é dedicada a:

pequenos ajustes;

correções;

testes manuais;

execução da suíte completa;

revisão das permissões;

validação do frontend;

validação da responsividade;

atualização do README;

revisão da documentação;

preparação da apresentação;

preparação da entrega.

Não devem ser iniciados grandes módulos nesta fase, salvo requisito obrigatório.

27. Trabalho futuro

As próximas funcionalidades possíveis são:

27.1 Comunicados e mensagem do dia

título;

conteúdo;

prioridade;

validade;

público-alvo;

confirmação de leitura.

27.2 Exportação de relatórios

comprovativos em PDF;

exportação de relatórios financeiros e de pagamentos;

exportação Excel;

estatísticas exportáveis.

27.3 Dashboard financeiro avançado

receitas por período;

pagamentos pendentes;

distribuição por método;

comparação mensal.

27.4 Integração com calendários

O Google Calendar já se encontra integrado. Mantêm-se como evoluções possíveis o Microsoft Outlook e melhorias adicionais de sincronização.

27.5 Aplicação móvel

Android;

iOS;

reservas;

notificações;

check-in;

pagamentos;

assistente virtual.

27.6 Previsão de ocupação

Primeira fase:

análise estatística do histórico;

previsão por dia;

previsão por período;

previsão por edifício;

identificação das áreas mais utilizadas.

Evolução posterior:

Inteligência Artificial;

recomendação de secretárias;

otimização da ocupação.

27.7 Auditoria administrativa

utilizador responsável;

ação;

entidade;

valor anterior;

valor novo;

data e hora;

endereço IP, quando adequado.

27.8 Pagamentos reais

Stripe;

PayPal;

MB Way;

Multibanco;

webhooks;

requisitos adicionais de segurança.

27.9 Melhorias no Help Center

anexos;

categorias;

atribuição de responsáveis;

histórico de respostas;

métricas de resolução.

O Single Sign-On, as notificações e as avaliações já estão implementados e não devem aparecer como funcionalidades pendentes.

28. Regras de continuidade

Ao continuar o projeto:

não alterar a arquitetura sem explicar o impacto;

não refatorar globalmente sem aprovação;

não renomear classes, ficheiros, métodos ou rotas sem necessidade;

manter compatibilidade com os testes;

fornecer ficheiros completos quando forem alterados;

utilizar Route Model Binding;

utilizar Form Requests;

utilizar Resources na API;

utilizar Policies e Gates;

preservar a desativação lógica;

não criar CRUD de papéis;

não recriar Localidade;

não adicionar concluida sem definir o ciclo de vida;

confirmar nomes reais das rotas e campos;

executar testes após cada alteração;

evitar novas funcionalidades durante a fase final;

manter os preços nos setores;

manter reservas longas num único registo;

manter um pagamento por reserva.

29. Documentação técnica

Documento

Finalidade

01-Requisitos.md

Requisitos e regras de negócio

02-CasosDeUso.md

Interações entre atores e sistema

03-ModeloBaseDados.md

Entidades, relações e decisões de modelação

04-Arquitetura.md

Estrutura técnica da aplicação

05-API.md

Endpoints, autenticação e respostas

06-EvolucaoProjeto.md

Evolução e trabalho futuro

07-DicionarioDados.md

Tabelas e campos

08-DocumentoMestre.md

Contexto consolidado e regras de continuidade

A documentação deve ser atualizada sempre que existirem alterações estruturais relevantes.

30. Estado técnico resumido

Backend:
Laravel 12
PHP
Laravel Sanctum
Eloquent ORM
Policies
Gates
Middleware
Form Requests
Resources
Services
Events
Notifications
Broadcasting
Scheduler
Commands Artisan

Frontend:
React
Inertia.js
Tailwind CSS
Vite
Recharts
Laravel Echo
QR Code

Tempo real:
Laravel Reverb
Broadcasting
MapaAtualizado
Assistente virtual de FAQs
Notificações

Base de dados:
MySQL

Módulos:
Autenticação
Single Sign-On
Utilizadores
Espaços
Reservas
Reservas longas
Pagamentos
QR Code
Check-in
Dashboard
Mapa
Avaliações
Notificações
Assistente virtual
Help Center

Testes:
349 testes PHP aprovados, com 1916 asserções
20 testes frontend aprovados em 3 ficheiros

Estado:
Projeto integrado e em fase de correções, validação e preparação da entrega

31. Considerações finais

O SpaceHub evoluiu de uma estrutura inicial de autenticação e gestão de espaços para uma plataforma completa de gestão e reserva de postos de trabalho.

A aplicação integra:

segurança;

gestão de utilizadores;

gestão hierárquica dos espaços;

reservas de curta e longa duração;

pagamentos simulados;

check-in;

mapas;

dashboards;

avaliações;

notificações;

assistente virtual;

suporte ao utilizador;

comunicação em tempo real.

A arquitetura mantém a lógica e a segurança no backend, utiliza React e Inertia.js na interface e garante persistência através de MySQL e Eloquent.

O projeto encontra-se integrado e validado para entrega. As tarefas restantes devem limitar-se à confirmação do ambiente, preparação das credenciais fictícias e materiais da apresentação.
