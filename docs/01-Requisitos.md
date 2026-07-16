# 1. Objetivo do Projeto

O **SpaceHub** é uma aplicação web desenvolvida para a gestão e reserva de postos de trabalho em espaços colaborativos.

O sistema permite administrar edifícios, pisos, setores e secretárias, possibilitando aos utilizadores efetuar reservas para um determinado dia e período, realizar o respetivo check-in através de QR Code e consultar o histórico das suas reservas.

A aplicação disponibiliza ainda funcionalidades de administração, gestão de utilizadores, monitorização da ocupação dos espaços e um dashboard com indicadores estatísticos de utilização.

O projeto foi desenvolvido recorrendo ao framework **Laravel**, com frontend em **React** e **Inertia.js**, disponibilizando uma API REST protegida por autenticação através de **Laravel Sanctum**.

---

# 2. Atores do Sistema

O SpaceHub define quatro tipos de utilizadores, cada um com diferentes níveis de acesso.

## 2.1 Administrador

O Administrador possui acesso total ao sistema.

Pode:

- gerir utilizadores;
- gerir papéis;
- gerir edifícios;
- gerir pisos;
- gerir setores;
- gerir secretárias;
- consultar todas as reservas;
- consultar estatísticas;
- aceder ao dashboard;
- ativar ou desativar entidades do sistema.

---

## 2.2 Gestor

O Gestor é responsável pela administração operacional dos espaços.

Pode:

- gerir pisos;
- gerir setores;
- gerir secretárias;
- consultar reservas;
- consultar a ocupação dos espaços;
- consultar o dashboard.

---

## 2.3 Colaborador

O Colaborador apoia a operação diária dos espaços.

Pode:

- consultar ocupação;
- consultar secretárias disponíveis;
- consultar reservas;
- apoiar operações de manutenção.

Não possui permissões de administração.

---

## 2.4 Utilizador

O Utilizador representa o colaborador que utiliza os espaços.

Pode:

- registar-se;
- iniciar sessão;
- gerir o próprio perfil;
- reservar secretárias;
- consultar as suas reservas;
- cancelar reservas permitidas;
- realizar check-in através de QR Code.

---

# 3. Requisitos Funcionais

## RF01 — Registo de Utilizador

O sistema deve permitir o registo de novos utilizadores.

Durante o registo é automaticamente atribuído o papel **Utilizador**.

---

## RF02 — Autenticação

O sistema deve permitir:

- login;
- logout;
- recuperação de password;
- alteração de password.

A autenticação da API é efetuada através de **Laravel Sanctum**.

---

## RF03 — Gestão de Utilizadores

O Administrador deve poder:

- criar utilizadores;
- consultar utilizadores;
- editar utilizadores;
- ativar ou desativar utilizadores;
- associar um papel.

Cada utilizador pode possuir uma fotografia de perfil.

---

## RF04 — Gestão de Papéis

O sistema deve permitir associar cada utilizador a um dos seguintes papéis:

- Administrador;
- Gestor;
- Colaborador;
- Utilizador.

---

## RF05 — Gestão de Edifícios

O Administrador pode:

- criar;
- editar;
- consultar;
- ativar ou desativar edifícios.

---

## RF06 — Gestão de Pisos

Administradores e Gestores podem:

- criar pisos;
- editar pisos;
- consultar pisos;
- ativar ou desativar pisos.

Cada piso pode possuir uma planta associada.

---

## RF07 — Gestão de Setores

Administradores e Gestores podem:

- criar;
- editar;
- consultar;
- ativar ou desativar setores.

Os setores possuem posicionamento gráfico na planta do piso.

---

## RF08 — Gestão de Secretárias

Administradores e Gestores podem:

- criar;
- editar;
- consultar;
- ativar ou desativar secretárias.

Cada secretária possui um QR Code único.

---

## RF09 — Reserva de Secretárias

Os utilizadores autenticados podem reservar secretárias para uma determinada data e período.

---

## RF10 — Períodos de Reserva

O sistema suporta reservas para os períodos:

- Manhã;
- Tarde.

---

## RF11 — Disponibilidade

O sistema apresenta apenas secretárias:

- ativas;
- reserváveis;
- livres para a data e período selecionados.

---

## RF12 — Validação de Reservas

O sistema impede:

- reservas duplicadas da mesma secretária;
- mais de uma reserva por utilizador no mesmo período.

---

## RF13 — Consulta de Reservas

Os utilizadores podem consultar:

- reservas futuras;
- reservas anteriores.

Os Administradores podem consultar todas as reservas.

---

## RF14 — Cancelamento de Reservas

As reservas podem ser canceladas apenas quando respeitam as regras de negócio definidas pelo sistema.

---

## RF15 — Check-in por QR Code

O sistema permite realizar o check-in através da leitura do QR Code existente na secretária.

---

## RF16 — Validação do Check-in

Durante o check-in o sistema valida:

- utilizador;
- reserva;
- data;
- período;
- secretária;
- estado da reserva.

---

## RF17 — Dashboard

O sistema disponibiliza um dashboard com indicadores estatísticos, incluindo:

- número de reservas;
- taxa de ocupação;
- reservas por período;
- reservas por edifício;
- reservas por estado.

---

## RF18 — Pesquisa

As áreas administrativas suportam pesquisa por texto.

---

## RF19 — Filtros

As listagens permitem aplicar filtros específicos por entidade.

---

## RF20 — Ordenação e Paginação

As listagens administrativas suportam:

- ordenação;
- paginação;
- número configurável de registos por página.
# 4. Requisitos Não Funcionais

## RNF01 — Segurança

O sistema deve garantir:

- autenticação através de Laravel Sanctum;
- autorização baseada em Policies;
- proteção das rotas da API;
- armazenamento seguro das passwords através de hashing;
- validação de dados através de Form Requests;
- controlo de permissões de acordo com o papel do utilizador.

---

## RNF02 — Performance

A API deve responder de forma eficiente às operações mais frequentes.

As listagens devem suportar:

- pesquisa;
- filtros;
- ordenação;
- paginação.

Sempre que possível devem ser evitadas consultas redundantes à base de dados.

---

## RNF03 — Usabilidade

A interface deve apresentar uma navegação simples e intuitiva, permitindo que utilizadores com pouca experiência técnica consigam utilizar o sistema sem necessidade de formação especializada.

---

## RNF04 — Escalabilidade

A arquitetura da aplicação deve permitir o crescimento do sistema, suportando:

- múltiplos edifícios;
- múltiplos pisos;
- múltiplos setores;
- elevado número de secretárias;
- elevado número de utilizadores;
- elevado número de reservas.

---

## RNF05 — Disponibilidade

O sistema deve manter-se disponível durante o horário normal de funcionamento da organização, garantindo o acesso às funcionalidades de reserva e consulta.

---

## RNF06 — Manutenibilidade

O código encontra-se organizado segundo a arquitetura MVC disponibilizada pelo Laravel.

A aplicação utiliza uma separação clara de responsabilidades através de:

- Models;
- Controllers;
- Form Requests;
- Resources;
- Policies;
- Middleware;
- Seeders;
- Migrations.

---

## RNF07 — Qualidade do Software

O projeto possui uma suíte de testes automatizados que valida as principais funcionalidades da aplicação.

À data da conclusão do projeto, a suíte é composta por **111 testes automatizados**, cobrindo, entre outras, as seguintes áreas:

- autenticação;
- autorização;
- gestão de utilizadores;
- gestão de edifícios;
- gestão de pisos;
- gestão de setores;
- gestão de secretárias;
- reservas;
- dashboard;
- mapa dos setores;
- uploads de fotografias e plantas;
- check-in por QR Code.

A existência desta suíte permite reduzir regressões e aumentar a fiabilidade da aplicação.

---

## RNF08 — Armazenamento de Ficheiros

As fotografias dos utilizadores e as plantas dos pisos são armazenadas no diretório público da aplicação utilizando o sistema de armazenamento do Laravel (`storage/app/public`), sendo disponibilizadas através do respetivo link simbólico para `public/storage`.

---

# 5. Regras de Negócio

## RN01

Uma secretária apenas pode possuir uma reserva ativa para a mesma data e período.

---

## RN02

Um utilizador apenas pode possuir uma reserva por período e por dia.

---

## RN03

Apenas secretárias ativas e configuradas como reserváveis podem ser reservadas.

---

## RN04

O check-in apenas pode ser realizado pelo utilizador proprietário da reserva.

---

## RN05

O sistema valida que o QR Code pertence à secretária reservada antes de confirmar o check-in.

---

## RN06

Reservas canceladas ou expiradas não podem ser alteradas.

---

## RN07

Reservas confirmadas não podem ser canceladas pelo utilizador.

---

## RN08

Apenas reservas futuras e elegíveis podem ser canceladas pelo respetivo utilizador.

---

## RN09

Utilizadores inativos não podem autenticar-se nem executar operações protegidas.

---

## RN10

Cada QR Code identifica unicamente uma secretária.

---

## RN11

Apenas Administradores podem gerir utilizadores.

---

## RN12

Administradores e Gestores podem gerir edifícios, pisos, setores e secretárias.

---

## RN13

Colaboradores e Utilizadores apenas possuem acesso às funcionalidades previstas para o respetivo papel.

---

## RN14

As entidades principais da aplicação utilizam desativação lógica através do campo **ativo**, preservando o histórico de utilização e a integridade dos dados.

---

# 6. Funcionalidades Implementadas

Na versão atual do SpaceHub encontram-se implementadas as seguintes funcionalidades:

- Gestão de utilizadores;
- Gestão de papéis;
- Gestão de edifícios;
- Gestão de pisos;
- Upload da planta dos pisos;
- Gestão de setores;
- Gestão de secretárias;
- Upload da fotografia dos utilizadores;
- Reserva de secretárias;
- Consulta de disponibilidade;
- Check-in através de QR Code;
- Dashboard estatístico;
- Pesquisa nas listagens;
- Filtros;
- Ordenação;
- Paginação;
- API REST;
- Autenticação com Laravel Sanctum;
- Autorização baseada em Policies;
- Validação através de Form Requests;
- Resources para serialização das respostas;
- Upload de ficheiros;
- Testes automatizados.

- Editor gráfico do mapa dos setores;
- Atualização em tempo real do mapa através de eventos;
- Upload da fotografia dos utilizadores;
- Upload da planta dos pisos;
- API REST protegida por Laravel Sanctum;
- Suíte com 111 testes automatizados.
---

# 7. Considerações Finais

O SpaceHub foi desenvolvido segundo uma arquitetura modular baseada em Laravel e React, privilegiando a separação de responsabilidades, a reutilização de componentes e a segurança da aplicação.

A estrutura adotada facilita a manutenção e evolução futura do sistema, permitindo a introdução de novas funcionalidades com reduzido impacto na arquitetura existente.