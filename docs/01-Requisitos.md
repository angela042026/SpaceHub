SpaceHub — Requisitos, Regras de Negócio e Funcionalidades

1. Enquadramento e objetivo

O SpaceHub é uma aplicação web destinada à gestão e reserva de postos de trabalho em espaços colaborativos.

A plataforma centraliza a administração de edifícios, pisos, setores e secretárias, permitindo aos utilizadores consultar a disponibilidade dos espaços, efetuar reservas, realizar check-in através de QR Code e acompanhar o respetivo histórico.

O sistema inclui ainda gestão de utilizadores e permissões, pagamentos simulados, indicadores estatísticos, notificações, avaliações, apoio ao utilizador e funcionalidades de comunicação em tempo real.

O principal objetivo do projeto é simplificar a utilização de espaços partilhados, reduzir conflitos de ocupação e disponibilizar informação fiável sobre reservas, pagamentos e utilização dos recursos.

2. Arquitetura e tecnologias

O projeto segue uma arquitetura baseada no padrão Model-View-Controller (MVC), mantendo uma separação clara entre interface, regras de negócio, acesso a dados e mecanismos de segurança.

Backend

Laravel 12;

PHP;

API REST;

Laravel Sanctum;

Laravel Reverb;

Services;

Controllers;

Form Requests;

Resources;

Policies;

Middleware;

Events e notificações;

Migrations e Seeders.

Frontend

React;

Inertia.js;

Tailwind CSS;

componentes reutilizáveis;

interface responsiva.

Dados, testes e versionamento

MySQL;

PHPUnit;

Git;

GitHub;

desenvolvimento por branches;

integração através de Pull Requests e merge commits.

3. Atores e permissões

O SpaceHub define quatro perfis de utilizador.

Perfil

Responsabilidades e permissões principais

Administrador

Gestão global da plataforma, utilizadores, papéis, espaços, reservas, pagamentos, avaliações, estatísticas e ativação ou desativação de entidades.

Gestor

Administração operacional dos espaços, incluindo edifícios, pisos, setores e secretárias, bem como consulta de reservas, ocupação e dashboard.

Colaborador

Consulta dos espaços, disponibilidade e reservas, sem acesso às operações administrativas reservadas ao Administrador e ao Gestor.

Utilizador

Gestão do próprio perfil, consulta de disponibilidade, criação e gestão das próprias reservas, pagamentos, check-in e consulta do histórico.

As permissões são aplicadas através de Policies, middleware e validações específicas em cada operação.

4. Requisitos funcionais

RF01 — Registo e autenticação

O sistema deve permitir:

registo de novos utilizadores;

login e logout;

recuperação da palavra-passe;

alteração da palavra-passe;

gestão do próprio perfil.

No registo é atribuído, por defeito, o papel Utilizador.

A autenticação da API é efetuada através de Laravel Sanctum.

RF02 — Gestão de utilizadores e papéis

O Administrador deve poder:

criar e consultar utilizadores;

editar dados de utilizadores;

ativar ou desativar contas;

associar um papel;

consultar informação relevante sobre a atividade do utilizador.

Cada utilizador pode possuir uma fotografia de perfil.

Os papéis disponíveis são:

Administrador;

Gestor;

Colaborador;

Utilizador.

RF03 — Gestão de edifícios

Administradores e Gestores devem poder:

criar edifícios;

consultar edifícios;

editar edifícios;

ativar ou desativar edifícios.

RF04 — Gestão de pisos

Administradores e Gestores devem poder:

criar pisos;

consultar pisos;

editar pisos;

ativar ou desativar pisos;

associar uma planta ao piso.

RF05 — Gestão de setores

Administradores e Gestores devem poder:

criar setores;

consultar setores;

editar setores;

ativar ou desativar setores;

definir a respetiva posição e dimensão na planta;

configurar preços de utilização.

RF06 — Gestão de secretárias

Administradores e Gestores devem poder:

criar secretárias;

consultar secretárias;

editar secretárias;

ativar ou desativar secretárias;

configurar características e condições de utilização;

definir a posição da secretária no mapa.

Cada secretária possui um QR Code único.

RF07 — Mapa dos espaços

O sistema deve disponibilizar uma representação visual dos pisos, setores e secretárias.

O mapa deve permitir:

identificar a localização das secretárias;

distinguir estados de disponibilidade;

editar posições quando o perfil possui autorização;

refletir alterações relevantes em tempo real.

RF08 — Consulta de disponibilidade

O sistema deve apresentar apenas secretárias que estejam:

ativas;

configuradas como reserváveis;

disponíveis para a data, duração e período selecionados.

A disponibilidade deve considerar reservas de um único dia e reservas com vários dias de duração.

RF09 — Criação de reservas

Os utilizadores autenticados devem poder criar reservas para uma secretária disponível.

A reserva deve registar, entre outros dados:

utilizador;

secretária;

data de início;

data de fim, quando aplicável;

período;

tipo de duração;

estado da reserva.

RF10 — Períodos e durações

O sistema suporta os seguintes períodos:

Manhã;

Tarde;

Dia inteiro.

As reservas podem ter as seguintes durações:

diária;

semanal;

mensal;

anual.

As reservas semanais, mensais e anuais utilizam o período Dia inteiro e originam uma única reserva com data de início e data de fim.

RF11 — Gestão das reservas

Os utilizadores devem poder:

consultar reservas futuras;

consultar o histórico;

editar reservas elegíveis;

cancelar reservas elegíveis;

consultar o respetivo estado.

Os Administradores podem consultar todas as reservas.

RF12 — Estados e validação das reservas

O sistema deve gerir os estados das reservas e impedir:

sobreposição de reservas para a mesma secretária;

reservas incompatíveis com outras reservas do mesmo utilizador;

alterações a reservas canceladas ou expiradas;

operações não autorizadas pelo perfil do utilizador.

RF13 — Check-in por QR Code e na receção

O sistema deve permitir realizar o check-in através da leitura do QR Code da secretária. Deve também permitir o check-in presencial assistido por um Administrador, Gestor ou Colaborador através da área de receção.

Durante o processo devem ser validados:

utilizador autenticado;

reserva associada;

data e período;

secretária reservada;

QR Code apresentado;

estado atual da reserva.

No check-in presencial devem ainda ser validados o perfil do funcionário e a janela horária. A operação deve identificar no registo de atividade o funcionário que confirmou a chegada do utilizador.

RF14 — Pagamentos

O sistema deve criar automaticamente um pagamento associado à reserva quando aplicável.

O módulo deve permitir:

consultar o valor;

selecionar o método de pagamento;

confirmar o pagamento;

consultar o histórico;

consultar o detalhe;

acompanhar o estado do pagamento.

Métodos simulados disponíveis:

Cartão;

MB Way;

Transferência;

PayPal.

RF15 — Cálculo de preços

O preço deve ser calculado de acordo com:

setor da secretária;

período selecionado;

tipo de duração;

número de dias úteis considerado.

Regras aplicadas às reservas longas:

semanal: 5 dias úteis;

mensal: 22 dias úteis, com desconto de 10%;

anual: 264 dias úteis, com desconto de 20%.

RF16 — Dashboard e estatísticas

O sistema deve disponibilizar indicadores de utilização, incluindo, quando aplicável:

número de reservas;

taxa de ocupação;

reservas por período;

reservas por edifício;

reservas por estado;

utilização dos espaços;

informação associada a pagamentos e avaliações.

RF17 — Notificações e comunicação

O sistema deve disponibilizar mecanismos de comunicação e atualização do utilizador, incluindo:

notificações persistentes;

atualização de informação relevante;

atualização do mapa em tempo real através de Laravel Reverb;

assistente virtual integrado, baseado nas FAQs administráveis.

RF18 — Avaliações

Os utilizadores elegíveis devem poder avaliar reservas concluídas.

O sistema deve permitir:

registar avaliações;

consultar avaliações;

moderar avaliações quando o perfil possui autorização;

calcular indicadores médios por setor.

RF19 — Ajuda e suporte

O sistema deve disponibilizar uma área de apoio ao utilizador, incluindo:

perguntas frequentes;

pedidos de suporte;

consulta de informação de ajuda.

RF20 — Pesquisa, filtros, ordenação e paginação

As listagens administrativas devem suportar, de acordo com a entidade:

pesquisa por texto;

filtros específicos;

ordenação;

paginação;

seleção do número de registos por página.

5. Requisitos não funcionais

RNF01 — Segurança

O sistema deve garantir:

autenticação através de Laravel Sanctum;

autorização baseada em Policies;

proteção das rotas privadas;

hashing seguro das palavras-passe;

validação através de Form Requests;

controlo de acesso por papel;

prevenção de operações sobre recursos de outros utilizadores;

validação de redirecionamentos e dados introduzidos.

RNF02 — Performance

A aplicação deve responder de forma eficiente às operações mais frequentes.

Devem ser aplicadas, quando adequadas:

paginação;

consultas otimizadas;

redução de pedidos redundantes;

reutilização de dados;

cache;

atualização em tempo real apenas quando necessária.

RNF03 — Usabilidade e acessibilidade

A interface deve ser:

clara;

consistente;

intuitiva;

responsiva;

utilizável em diferentes dimensões de ecrã;

compatível com boas práticas de acessibilidade.

RNF04 — Escalabilidade

A arquitetura deve suportar o crescimento do sistema, nomeadamente:

múltiplos edifícios;

múltiplos pisos;

múltiplos setores;

elevado número de secretárias;

elevado número de utilizadores;

elevado volume de reservas e pagamentos.

RNF05 — Disponibilidade

A aplicação deve permanecer acessível durante o período normal de funcionamento da organização, garantindo o acesso às funcionalidades essenciais de consulta, reserva e administração.

RNF06 — Manutenibilidade

O código deve manter uma separação clara de responsabilidades através de:

Models;

Controllers;

Services;

Form Requests;

Resources;

Policies;

Middleware;

Events;

Notifications;

Seeders;

Migrations;

componentes React reutilizáveis.

RNF07 — Qualidade do software

O projeto deve possuir testes automatizados que cubram as áreas críticas, incluindo:

autenticação;

autorização;

utilizadores e papéis;

gestão de espaços;

reservas;

pagamentos;

avaliações;

dashboard;

mapas;

uploads;

check-in;

regras de negócio.

A contagem final de testes deve corresponder ao resultado obtido na execução da versão entregue através do comando php artisan test.

RNF08 — Armazenamento de ficheiros

As fotografias dos utilizadores e as plantas dos pisos são armazenadas através do sistema de ficheiros do Laravel, em storage/app/public, e disponibilizadas através do link simbólico para public/storage.

RNF09 — Versionamento e integração

O desenvolvimento deve utilizar Git e GitHub, com:

branches por funcionalidade ou correção;

commits identificáveis;

Pull Requests;

revisão e integração na branch principal;

preservação do histórico através de merge commits.

6. Regras de negócio

RN01 — Disponibilidade da secretária

Uma secretária apenas pode possuir uma reserva ativa para o mesmo intervalo de datas e período.

RN02 — Reservas do utilizador

Um utilizador não pode possuir reservas incompatíveis ou sobrepostas no mesmo período.

RN03 — Elegibilidade da secretária

Apenas secretárias ativas e configuradas como reserváveis podem ser reservadas.

RN04 — Reservas de longa duração

As reservas semanais, mensais e anuais:

utilizam o período Dia inteiro;

possuem data de início e data de fim;

originam apenas um registo de reserva;

originam apenas um pagamento.

RN05 — Cálculo da data final

A data final é calculada automaticamente de acordo com o tipo de duração selecionado.

RN06 — Cálculo do preço

O valor da reserva é determinado pelos preços configurados no setor, pelo período e pela duração selecionada.

RN07 — Pagamento e confirmação

A confirmação do pagamento deve atualizar o estado da reserva de acordo com o fluxo definido pela aplicação.

Reservas com pagamento pendente podem ser canceladas automaticamente quando ultrapassam o prazo estabelecido.

RN08 — Check-in

O check-in por QR Code apenas pode ser realizado pelo utilizador proprietário da reserva e para a secretária efetivamente reservada. Como exceção controlada, Administradores, Gestores e Colaboradores podem confirmar presencialmente, na receção, o check-in de uma reserva elegível de outro utilizador. Esta operação deve ficar auditada.

RN09 — Validação do QR Code

O sistema deve confirmar que o QR Code apresentado identifica a secretária associada à reserva.

RN10 — Estados da reserva

Reservas canceladas ou expiradas não podem ser alteradas.

Reservas confirmadas apenas podem ser canceladas quando as regras de negócio o permitirem.

RN11 — Utilizadores inativos

Utilizadores inativos não podem autenticar-se nem executar operações protegidas.

RN12 — Gestão de utilizadores

A gestão administrativa de utilizadores é reservada ao perfil Administrador.

RN13 — Gestão de espaços

Administradores e Gestores podem gerir edifícios, pisos, setores e secretárias, de acordo com as Policies aplicadas.

RN14 — Controlo por perfil

Colaboradores e Utilizadores apenas podem executar as operações autorizadas para o respetivo papel.

RN15 — Desativação lógica

As entidades principais utilizam o campo ativo para preservar o histórico e a integridade dos dados, evitando eliminações físicas desnecessárias.

RN16 — Avaliações

Uma avaliação apenas pode ser registada quando o utilizador e a reserva cumprem os critérios definidos pelo sistema.

7. Funcionalidades implementadas

A versão atual do SpaceHub integra os seguintes módulos:

Autenticação e perfis — registo, login, logout, recuperação de palavra-passe, perfil, Single Sign-On e controlo de utilizadores ativos ou inativos.

Google Calendar — ligação opcional da conta e sincronização dos eventos associados às reservas.

Gestão de utilizadores e permissões — papéis, Policies e acessos diferenciados.

Gestão de espaços — edifícios, pisos, plantas, setores, secretárias, características e mapas.

Reservas — disponibilidade, criação, edição, cancelamento, histórico, estados e reservas de longa duração.

Check-in — validação de reservas através de QR Code ou confirmação presencial assistida na receção.

Pagamentos simulados — cálculo automático, métodos de pagamento, confirmação, histórico e detalhe.

Dashboard e estatísticas — indicadores de ocupação e utilização dos espaços.

Relatórios — consulta e impressão de reservas, ocupação, espaços, cancelamentos e ausências, utilizadores e suporte.

Notificações e tempo real — notificações persistentes, eventos e comunicação através de Laravel Reverb.

Avaliações — registo, consulta, moderação e médias por setor.

Ajuda e comunicação — Help Center, gestão de FAQs, pedidos de suporte e assistente virtual baseado nas FAQs.

Ferramentas administrativas — pesquisa, filtros, ordenação, paginação e ativação ou desativação de entidades.

API e segurança — API REST, Laravel Sanctum, Policies, middleware, Form Requests e Resources.

Qualidade e integração — testes automatizados, Git, GitHub, branches e Pull Requests.

8. Considerações finais

O SpaceHub apresenta uma arquitetura modular baseada em Laravel e React, com separação de responsabilidades entre backend, frontend, regras de negócio, persistência de dados e segurança.

A estrutura adotada facilita a manutenção, os testes e a evolução da aplicação, permitindo acrescentar novas funcionalidades sem alterar os princípios arquiteturais definidos para o projeto.

A documentação deve ser validada juntamente com a versão final da aplicação, garantindo que os requisitos, as regras de negócio e a contagem de testes correspondem ao estado efetivamente entregue.
