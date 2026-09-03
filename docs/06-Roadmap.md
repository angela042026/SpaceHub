6. Evolução do Projeto e Trabalho Futuro

6.1 Introdução

O desenvolvimento do SpaceHub foi realizado de forma incremental e colaborativa, permitindo implementar, testar e integrar cada módulo por fases.

Esta abordagem possibilitou validar continuamente as funcionalidades, corrigir problemas identificados durante o desenvolvimento e adaptar a aplicação às necessidades do projeto, sem alterar a arquitetura inicialmente definida.

Ao longo do trabalho foram introduzidas melhorias ao nível da:

arquitetura;

segurança;

organização do código;

base de dados;

experiência do utilizador;

comunicação em tempo real;

cobertura de testes;

documentação técnica.

O resultado é uma aplicação modular, funcional e preparada para manutenção e evolução futura.

6.2 Fases de evolução do projeto

6.2.1 Estrutura inicial

A primeira fase foi dedicada à criação da estrutura base da aplicação.

Foram implementados:

projeto Laravel com React e Inertia.js;

configuração da base de dados MySQL;

autenticação;

registo;

login e logout;

recuperação e alteração da palavra-passe;

gestão do perfil;

papéis de utilizador;

controlo de utilizadores ativos e inativos;

estrutura inicial de rotas, Controllers, Models e migrations.

Foram definidos quatro papéis:

Administrador;

Gestor;

Colaborador;

Utilizador.

6.2.2 Gestão dos espaços

Numa segunda fase foi implementada a organização física dos espaços.

A estrutura adotada foi:

Edifício
└── Piso
    └── Setor
        └── Secretária

Foram desenvolvidas funcionalidades de:

criação e atualização das entidades;

pesquisa, filtros, ordenação e paginação;

ativação e desativação lógica;

upload da planta dos pisos;

posicionamento de setores e secretárias;

configuração das características das secretárias;

geração de QR Codes;

visualização dos espaços através do mapa interativo.

6.2.3 Sistema de reservas

Após a gestão dos espaços, foi implementado o módulo central de reservas.

O sistema passou a permitir:

consulta de disponibilidade;

criação de reservas;

edição;

cancelamento;

histórico;

estados da reserva;

validação de conflitos;

check-in através de QR Code;

atualização do mapa;

expiração automática de reservas.

Foram definidas regras para impedir:

reservas sobrepostas;

reservas incompatíveis do mesmo utilizador;

utilização de secretárias inativas;

utilização de secretárias não reserváveis;

alterações a reservas canceladas, expiradas ou já confirmadas.

6.2.4 Segurança e organização da aplicação

Durante a evolução do projeto foram reforçadas a segurança e a separação de responsabilidades.

Foram introduzidos ou consolidados:

autenticação da API através de Laravel Sanctum;

autorização baseada em Policies;

middleware para contas ativas;

middleware de restrição por papel;

Form Requests para validação;

API Resources para respostas JSON;

proteção contra mass assignment;

validação de uploads;

separação entre rotas web e rotas API;

Services para regras de negócio mais complexas;

eager loading para reduzir consultas redundantes;

transações em operações relacionadas.

6.2.5 Interface e comunicação em tempo real

O frontend foi desenvolvido com React, Inertia.js e Tailwind CSS.

Ao longo do projeto foram efetuadas melhorias em:

dashboard;

navegação;

responsividade;

acessibilidade;

formulários;

tabelas;

mapas;

estados visuais;

apresentação de erros;

consistência entre módulos.

A integração com Laravel Reverb e Laravel Echo permitiu acrescentar comunicação em tempo real, utilizada em funcionalidades como:

atualização do mapa;

atualização de indicadores;

notificações;

atualizações do mapa.

6.2.6 Pagamentos e reservas de longa duração

Numa fase posterior foi implementado o módulo de pagamentos simulados.

Foram acrescentadas as seguintes funcionalidades:

criação automática de um pagamento por reserva;

cálculo do valor;

geração de referência;

confirmação;

cancelamento;

consulta do histórico;

consulta do detalhe;

diferentes métodos de pagamento.

Os métodos atualmente suportados são:

Cartão;

MB Way;

Transferência Bancária;

PayPal.

Foi também implementado suporte para reservas:

diárias;

semanais;

mensais;

anuais.

As reservas longas:

utilizam o período Dia inteiro;

geram apenas uma reserva;

geram apenas um pagamento;

possuem data final calculada automaticamente.

6.2.7 Expansão funcional

A aplicação foi posteriormente expandida com novos módulos e melhorias, incluindo:

Help Center;

FAQs;

pedidos de suporte;

notificações persistentes;

notificações por email, quando aplicável;

sistema de avaliações;

moderação de avaliações;

cálculo da média por setor;

assistente virtual baseado nas FAQs e em palavras-chave bilingues;

Single Sign-On;

melhorias no dashboard;

cache e otimização de consultas;

cancelamento automático de reservas com pagamento pendente;

melhorias de segurança e acessibilidade.

6.2.8 Integração e estabilização

O desenvolvimento foi realizado através de branches e Pull Requests.

O processo de integração incluiu:

desenvolvimento numa branch própria;

commit das alterações;

push para o GitHub;

criação de Pull Request;

revisão e resolução de conflitos;

execução de testes;

merge através de Create a merge commit;

atualização da branch main.

Esta abordagem permitiu preservar a autoria dos diferentes elementos do grupo e manter um histórico claro da evolução do projeto.

6.3 Melhorias técnicas introduzidas

As principais melhorias técnicas implementadas ao longo do projeto incluem:

Backend

utilização consistente do padrão MVC;

Controllers focados na coordenação dos pedidos;

utilização de Services para lógica de negócio;

utilização de Form Requests;

utilização de Policies e Gates;

middleware de autenticação, conta ativa e papel;

API Resources;

utilização de Eloquent ORM;

transações em operações relacionadas;

eventos e broadcasting;

tarefas automáticas através do Scheduler;

organização das rotas web e API;

validação de regras de reserva e pagamento.

Base de dados

normalização das entidades;

utilização de chaves estrangeiras;

utilização de índices;

restrições de unicidade;

relações Eloquent;

ativação lógica;

suporte para reservas de vários dias;

separação entre reservas e pagamentos;

preservação do histórico.

Frontend

componentes React reutilizáveis;

layouts partilhados;

navegação responsiva;

melhorias de acessibilidade;

atualização parcial através do Inertia.js;

estados visuais consistentes;

integração com Laravel Echo;

redução de duplicação;

melhoria do desempenho.

Qualidade

testes automatizados;

testes de autenticação e autorização;

testes das regras de negócio;

testes de reservas e pagamentos;

testes das entidades administrativas;

build do frontend;

revisão da documentação;

utilização de Git e GitHub.

6.4 Funcionalidades implementadas

Na versão atual encontram-se implementadas as seguintes funcionalidades.

Autenticação e perfil

registo;

login;

logout;

recuperação da palavra-passe;

redefinição da palavra-passe;

alteração da palavra-passe;

gestão do perfil;

fotografia do utilizador;

utilizador ativo/inativo;

Laravel Sanctum;

Single Sign-On.

Utilizadores e permissões

gestão de utilizadores;

gestão de papéis;

Administrador, Gestor, Colaborador e Utilizador;

middleware de papel;

Policies;

proteção de recursos;

controlo de propriedade das reservas e pagamentos.

Gestão de espaços

edifícios;

pisos;

setores;

secretárias;

ativação e desativação;

upload de plantas;

características das secretárias;

editor gráfico;

mapa interativo;

QR Codes.

Reservas

disponibilidade;

reservas diárias;

reservas semanais;

reservas mensais;

reservas anuais;

cálculo da data final;

edição;

cancelamento;

histórico;

estados;

validação de conflitos;

check-in por QR Code e check-in presencial assistido na receção;

expiração automática;

cancelamento automático associado a pagamentos pendentes.

Pagamentos

criação automática;

cálculo do valor;

confirmação;

cancelamento;

histórico;

detalhe;

referência única;

Cartão;

MB Way;

Transferência Bancária;

PayPal;

ambiente simulado.

Dashboard e estatísticas

indicadores de utilização;

próximas reservas;

ocupação;

estados;

mapa;

informação financeira autorizada;

consultas agregadas;

cache;

atualização em tempo real.

Comunicação e apoio

notificações persistentes;

notificações por email, quando aplicável;

assistente virtual baseado nas FAQs;

atualizações do mapa através de Laravel Reverb e Laravel Echo;

Help Center;

FAQs;

pedidos de suporte.

Avaliações

avaliação de reservas elegíveis;

classificação;

comentários;

moderação;

média por setor;

regras de autorização.

Qualidade e suporte técnico

pesquisa;

filtros;

ordenação;

paginação;

uploads;

API REST;

testes automatizados;

documentação técnica;

controlo de versões com Git.

Na validação final, a suíte PHP apresenta 349 testes aprovados e 1916 asserções. O frontend apresenta 20 testes aprovados em 3 ficheiros. As contagens podem ser novamente confirmadas através de:

php artisan test
npm run test:frontend

6.5 Tarefas finais imediatas

O projeto encontra-se numa fase de consolidação.

As tarefas imediatas não correspondem ao desenvolvimento de grandes módulos, mas sim a:

execução da suíte completa de testes;

testes manuais dos principais fluxos;

correção de pequenas anomalias;

verificação das permissões por papel;

validação da responsividade;

revisão da acessibilidade;

confirmação do build de produção;

revisão das migrations e seeders;

atualização da documentação;

preparação da base de dados para entrega;

preparação das credenciais de demonstração;

preparação da apresentação final.

Comandos de validação recomendados:

composer install
npm.cmd install
php artisan optimize:clear
php artisan migrate
npm.cmd run build
php artisan test
php artisan route:list

6.6 Trabalho futuro

As funcionalidades seguintes não fazem parte das tarefas finais imediatas. Representam possíveis evoluções posteriores do projeto.

6.6.1 Comunicados e mensagem do dia

Criação de um módulo administrativo para apresentar informações após o início de sessão.

Poderá incluir:

título;

conteúdo;

prioridade;

período de validade;

público-alvo por papel;

confirmação de leitura;

opção de não voltar a mostrar no mesmo dia.

6.6.2 Exportação de documentos e relatórios

Os relatórios administrativos de reservas, ocupação, espaços, cancelamentos e ausências, utilizadores e suporte já estão implementados para consulta e impressão. Como evolução futura, podem ser acrescentados mecanismos de exportação para:

comprovativos em PDF;

relatórios financeiros e de pagamentos;

estatísticas;

ficheiros Excel;

informação para análise administrativa.

6.6.3 Dashboard financeiro

Evolução da informação financeira através de:

receitas simuladas por período;

valores pendentes;

distribuição por método;

valores por edifício ou setor;

comparação mensal;

exportação de resultados.

6.6.4 Integração com calendários

A integração com Google Calendar já permite ao utilizador ligar a conta e sincronizar eventos associados às reservas. Como evolução futura mantém-se a integração com Microsoft Outlook e o aprofundamento da sincronização entre calendários.

6.6.5 Aplicação móvel

Desenvolvimento de uma aplicação para Android e iOS.

A aplicação móvel poderá permitir:

consultar disponibilidade;

criar reservas;

receber notificações;

efetuar check-in;

consultar pagamentos;

utilizar o assistente virtual.

6.6.6 Previsão de ocupação

Criação de uma primeira versão estatística baseada no histórico das reservas.

Poderá incluir:

previsão por dia da semana;

previsão por período;

previsão por edifício;

identificação das áreas mais utilizadas;

sugestão de horários com menor ocupação.

Numa evolução posterior, esta funcionalidade poderá utilizar técnicas de Inteligência Artificial.

6.6.7 Auditoria administrativa

Implementação de um sistema próprio de auditoria, separado dos logs técnicos.

Poderá registar:

utilizador responsável;

ação executada;

entidade afetada;

valores anteriores;

novos valores;

data e hora;

endereço IP, quando adequado.

6.6.8 Pagamentos reais

Substituição do ambiente simulado por gateways reais, como:

Stripe;

PayPal;

MB Way;

referências Multibanco.

Esta evolução exigirá requisitos adicionais de segurança, tratamento de webhooks e proteção de dados financeiros.

6.6.9 Melhorias no Help Center

Possíveis evoluções incluem:

anexos nos pedidos;

categorias;

atribuição a responsáveis;

histórico de respostas;

notificações de atualização;

métricas de resolução;

base de conhecimento mais completa.

6.6.10 Gestão avançada de equipamentos

As secretárias já possuem características como monitor, dock USB, proximidade de janela e ergonomia.

Uma evolução futura poderá criar um módulo próprio para:

inventário de equipamentos;

número de série;

estado;

manutenção;

avarias;

associação temporária a secretárias;

histórico de intervenções.

6.7 Escalabilidade

A arquitetura atual permite uma evolução gradual, sem obrigar a substituir a estrutura existente.

Possíveis cenários de crescimento incluem:

maior número de edifícios;

novas localizações;

múltiplas organizações;

maior volume de utilizadores;

maior número de reservas;

APIs para integrações externas;

armazenamento externo;

filas de processamento;

Redis;

cache distribuída;

múltiplos workers;

monitorização;

infraestrutura cloud;

balanceamento de carga.

Uma arquitetura de microsserviços não é necessária para a dimensão atual do projeto. Só deverá ser considerada caso o crescimento, a carga ou a independência dos módulos justifiquem essa complexidade.

O Single Sign-On já se encontra implementado e, por esse motivo, não é apresentado como trabalho futuro.

6.8 Lições aprendidas

O desenvolvimento do SpaceHub permitiu aplicar conhecimentos relacionados com:

levantamento de requisitos;

modelação de bases de dados;

arquitetura MVC;

desenvolvimento backend;

desenvolvimento frontend;

autenticação;

autorização;

regras de negócio;

APIs REST;

comunicação em tempo real;

testes automatizados;

integração de código;

resolução de conflitos;

trabalho em equipa;

documentação técnica;

apresentação de um produto de software.

O desenvolvimento incremental demonstrou a importância de testar continuamente, preservar a arquitetura e integrar as alterações de forma controlada.

6.9 Considerações finais

A evolução do SpaceHub permitiu transformar uma estrutura inicial de autenticação e gestão de espaços numa plataforma integrada de reservas de postos de trabalho.

A aplicação reúne:

gestão de utilizadores;

gestão de espaços;

reservas de diferentes durações;

pagamentos simulados;

check-in por QR Code e na receção;

mapa interativo;

dashboard;

avaliações;

notificações;

assistente virtual;

Help Center;

comunicação em tempo real.

A utilização de Laravel, React, Inertia.js, MySQL, Sanctum, Reverb e PHPUnit permitiu desenvolver uma solução modular e tecnicamente consistente.

O projeto encontra-se na fase final de estabilização, sendo as tarefas seguintes sobretudo correções pontuais, testes, revisão da documentação e preparação da entrega.

As funcionalidades apresentadas como trabalho futuro representam possíveis evoluções posteriores e não fazem parte dos objetivos imediatos da versão académica atual.
