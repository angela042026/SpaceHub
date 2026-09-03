7. Dicionário de Dados

7.1 Introdução

O presente dicionário de dados descreve a estrutura persistente utilizada pelo SpaceHub.

Para cada tabela são apresentados:

finalidade;

campos principais;

tipo de dados;

nulabilidade;

chaves;

descrição funcional;

relações relevantes;

restrições de integridade.

A estrutura é gerida através das migrations do Laravel e acedida pela aplicação através do ORM Eloquent.

Os tipos e campos apresentados devem corresponder às migrations da versão final entregue. Sempre que existirem alterações posteriores na base de dados, este documento deve ser atualizado a partir das migrations e não apenas da interface da aplicação.

7.2 Convenções

Símbolo

Significado

PK

Chave primária

FK

Chave estrangeira

UNIQUE

Valor ou combinação de valores não repetível

INDEX

Campo indexado

—

Campo sem chave especial indicada

Por convenção:

os identificadores principais utilizam bigint;

os campos created_at e updated_at são geridos pelo Laravel;

os valores booleanos representam normalmente estados de ativação ou configuração;

os ficheiros não são guardados diretamente na base de dados, sendo armazenado apenas o respetivo caminho;

a desativação lógica através do campo ativo preserva o histórico.

7.3 Tabelas de identidade e autenticação

7.3.1 Tabela roles

Finalidade

Armazena os papéis atribuídos aos utilizadores.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do papel

nome

varchar(50)

Não

UNIQUE

Nome do papel

descricao

varchar(255)

Sim

—

Descrição funcional

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Valores principais

Administrador;

Gestor;

Colaborador;

Utilizador.

Relações

um papel possui vários utilizadores;

cada utilizador pertence a um papel.

7.3.2 Tabela users

Finalidade

Armazena os utilizadores da aplicação e os dados necessários à autenticação, perfil e controlo de acesso.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do utilizador

role_id

bigint

Não

FK

Papel associado

name

varchar(255)

Não

—

Nome do utilizador

email

varchar(255)

Não

UNIQUE

Endereço de email

email_verified_at

timestamp

Sim

—

Data de verificação do email

password

varchar(255)

Não

—

Palavra-passe protegida por hashing

fotografia

varchar(255)

Sim

—

Caminho da fotografia de perfil

ativo

boolean

Não

INDEX

Estado da conta

remember_token

varchar(100)

Sim

—

Token de sessão persistente

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Relações

Um utilizador:

pertence a um Role;

pode possuir várias Reservas;

pode possuir vários Pagamentos através das reservas;

pode submeter Avaliacoes;

pode criar PedidoSuportes;

pode receber notificações;

pode utilizar o assistente virtual, sem persistência da pergunta.

Regras

o email deve ser único;

a palavra-passe nunca é armazenada em texto simples;

utilizadores inativos não podem executar operações protegidas;

a desativação não elimina reservas nem o histórico associado.

7.4 Tabelas de gestão de espaços

7.4.1 Tabela edificios

Finalidade

Representa os edifícios disponíveis para gestão e reserva de espaços.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do edifício

nome

varchar(100)

Não

—

Nome

codigo

varchar(20)

Não

UNIQUE

Código identificador

morada

varchar(255)

Não

—

Morada

codigo_postal

varchar(20)

Sim

—

Código postal

cidade

varchar(100)

Não

INDEX

Cidade

pais

varchar(100)

Não

INDEX

País

telefone

varchar(20)

Sim

—

Contacto telefónico

email

varchar(255)

Sim

—

Email de contacto

imagem

varchar(255)

Sim

—

Caminho da imagem

hora_abertura

time

Não

—

Hora de abertura

hora_fecho

time

Não

—

Hora de encerramento

ativo

boolean

Não

INDEX

Estado do edifício

descricao

text

Sim

—

Descrição

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Relações

possui vários Pisos.

7.4.2 Tabela pisos

Finalidade

Representa os pisos pertencentes a cada edifício.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do piso

edificio_id

bigint

Não

FK, INDEX

Edifício associado

nome

varchar(100)

Não

—

Nome

codigo

varchar(10)

Não

UNIQUE*

Código do piso

numero

integer

Não

INDEX

Número do piso

planta

varchar(255)

Sim

—

Caminho da planta

descricao

text

Sim

—

Descrição

ativo

boolean

Não

INDEX

Estado do piso

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

* A unicidade é composta:

unique(edificio_id, codigo)

Relações

pertence a um Edificio;

possui vários Setores.

7.4.3 Tabela setores

Finalidade

Representa as áreas funcionais existentes em cada piso.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do setor

piso_id

bigint

Não

FK, INDEX

Piso associado

nome

varchar(100)

Não

—

Nome

codigo

varchar(20)

Não

INDEX

Código identificador

tipo

varchar(50)

Não

INDEX

Tipo de utilização

reservavel

boolean

Não

INDEX

Permite reservas

capacidade

integer

Sim

—

Capacidade máxima

planta_x

decimal

Sim

—

Posição horizontal no mapa

planta_y

decimal

Sim

—

Posição vertical no mapa

planta_largura

decimal

Sim

—

Largura no mapa

planta_altura

decimal

Sim

—

Altura no mapa

preco_meio_dia

decimal(10,2)

Sim

—

Preço para Manhã ou Tarde

preco_dia_inteiro

decimal(10,2)

Sim

—

Preço diário de dia inteiro

preco_semanal

decimal(10,2)

Sim

—

Preço de referência semanal

preco_mensal

decimal(10,2)

Sim

—

Preço de referência mensal

preco_anual

decimal(10,2)

Sim

—

Preço de referência anual

ativo

boolean

Não

INDEX

Estado do setor

descricao

text

Sim

—

Descrição

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Relações

pertence a um Piso;

possui várias Secretarias;

é utilizado indiretamente no cálculo dos preços das reservas.

Regras

apenas setores ativos e reserváveis podem disponibilizar novas reservas;

os preços são armazenados no setor e não nos períodos;

campos removidos pelas migrations mais recentes não devem permanecer neste documento.

7.4.4 Tabela secretarias

Finalidade

Representa os postos de trabalho existentes nos setores.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador da secretária

setor_id

bigint

Não

FK, INDEX

Setor associado

codigo

varchar(50)

Não

INDEX

Código identificador

planta_x

decimal

Sim

—

Posição horizontal

planta_y

decimal

Sim

—

Posição vertical

angulo

decimal

Não

—

Rotação no mapa

monitor

boolean

Não

INDEX

Possui monitor

dock_usb

boolean

Não

INDEX

Possui dock USB

junto_janela

boolean

Não

INDEX

Localização junto a janela

ergonomica

boolean

Não

INDEX

Possui características ergonómicas

reservavel

boolean

Não

INDEX

Pode receber reservas

ativo

boolean

Não

INDEX

Estado da secretária

qr_token

varchar(255)

Não

UNIQUE

Token utilizado no QR Code

descricao

text

Sim

—

Descrição

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Relações

pertence a um Setor;

possui várias Reservas.

Regras

o qr_token deve ser único;

apenas secretárias ativas e reserváveis podem ser selecionadas;

a disponibilidade depende de todo o intervalo da reserva;

a secretária deve pertencer a um setor válido.

7.4.5 Hierarquia dos espaços

edificios
└── pisos
    └── setores
        └── secretarias
            └── reservas

7.5 Tabelas de reservas

7.5.1 Tabela periodos

Finalidade

Armazena os períodos horários utilizados nas reservas diárias.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do período

nome

varchar(100)

Não

UNIQUE*

Nome do período

hora_inicio

time

Não

—

Hora de início

hora_fim

time

Não

—

Hora de fim

ativo

boolean

Não

INDEX

Estado do período

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

* Confirmar a restrição de unicidade na migration.

Valores utilizados

Manhã;

Tarde;

Dia inteiro.

Relações

possui várias Reservas.

Observação

Semanal, mensal e anual são durações armazenadas na reserva e não registos da tabela periodos.

7.5.2 Tabela estado_reservas

Finalidade

Centraliza os estados possíveis do ciclo de vida das reservas.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do estado

nome

varchar(50)

Não

UNIQUE

Nome ou código

descricao

varchar(255)

Sim

—

Descrição funcional

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Estados principais

Estado

Descrição

pendente

Reserva criada e ainda sem check-in

confirmada

Check-in efetuado

cancelada

Reserva cancelada

expirada

Reserva que perdeu validade

Relações

possui várias Reservas.

7.5.3 Tabela reservas

Finalidade

Armazena as reservas de secretárias efetuadas pelos utilizadores.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador da reserva

user_id

bigint

Não

FK, INDEX

Utilizador responsável

secretaria_id

bigint

Não

FK, INDEX

Secretária reservada

periodo_id

bigint

Não

FK, INDEX

Período associado

estado_reserva_id

bigint

Não

FK, INDEX

Estado atual

data

date

Não

INDEX

Data de início

tipo_duracao

varchar(30)

Não

INDEX

Duração da reserva

data_fim

date

Não

INDEX

Data final calculada

check_in_at

timestamp

Sim

—

Data e hora do check-in

cancelada_at

timestamp

Sim

—

Data e hora do cancelamento

observacoes

text

Sim

—

Observações

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Valores de tipo_duracao

diaria;

semanal;

mensal;

anual.

Relações

Uma reserva:

pertence a um User;

pertence a uma Secretaria;

pertence a um Periodo;

pertence a um EstadoReserva;

pode possuir um Pagamento;

pode possuir uma Avaliacao.

Regras

reservas longas utilizam o período Dia inteiro;

a data_fim é calculada automaticamente;

uma reserva longa corresponde a um único registo;

os conflitos devem considerar todo o intervalo entre data e data_fim;

apenas secretárias ativas e reserváveis podem ser utilizadas;

reservas canceladas ou expiradas não podem ser alteradas;

apenas reservas elegíveis podem efetuar check-in;

o check-in altera o estado para confirmada;

uma reserva gera, no máximo, um pagamento.

7.6 Tabela de pagamentos

7.6.1 Tabela pagamentos

Finalidade

Armazena os pagamentos simulados associados às reservas.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do pagamento

reserva_id

bigint

Não

FK, UNIQUE

Reserva associada

valor

decimal(10,2)

Não

—

Valor calculado

metodo

varchar(50)

Sim*

INDEX

Método selecionado

estado

varchar(50)

Não

INDEX

Estado atual

referencia

varchar(255)

Não

UNIQUE

Referência única

pago_at

timestamp

Sim

—

Data de confirmação

cancelado_at

timestamp

Sim

—

Data de cancelamento

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

* A nulabilidade do método deve ser confirmada na migration, pois o pagamento pode ser criado antes da escolha do método.

Métodos suportados

Valor

Descrição

cartao

Cartão

mbway

MB Way

transferencia

Transferência Bancária

paypal

PayPal

Estados principais

Estado

Descrição

pendente

Criado e ainda não confirmado

pago

Confirmado

cancelado

Cancelado

Relações

pertence a uma Reserva.

Regras

cada reserva possui, no máximo, um pagamento;

a referência deve ser única;

o valor não pode ser negativo;

apenas pagamentos elegíveis podem ser confirmados ou cancelados;

o valor é calculado a partir do setor, período, duração e regras de desconto;

o processamento atual é simulado.

7.7 Tabelas de apoio ao utilizador

7.7.1 Tabela pedido_suportes

Finalidade

Armazena os pedidos submetidos através do Help Center.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador do pedido

user_id

bigint

Não

FK, INDEX

Utilizador responsável

assunto

varchar(255)

Não

—

Assunto

descricao

text

Não

—

Descrição

estado

varchar(50)

Não

INDEX

Estado atual

prioridade

varchar(50)

Sim

INDEX

Prioridade

resposta

text

Sim

—

Resposta ou acompanhamento

respondido_at

timestamp

Sim

—

Data da resposta

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Estados possíveis

aberto;

em_tratamento;

resolvido;

fechado.

Relações

pertence a um User.

Os nomes exatos dos estados e campos devem ser confirmados na migration e no Model.

7.7.2 Tabela faqs

Finalidade

Armazena perguntas e respostas frequentes.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador da FAQ

pergunta

varchar(255)

Não

—

Pergunta

resposta

text

Não

—

Resposta

pergunta_en

varchar(255)

Sim

—

Pergunta em inglês, com fallback para português

resposta_en

text

Sim

—

Resposta em inglês, com fallback para português

keywords_pt

text

Sim

—

Palavras-chave portuguesas utilizadas pelo assistente virtual

keywords_en

text

Sim

—

Palavras-chave inglesas utilizadas pelo assistente virtual

categoria

varchar(100)

Não

INDEX

Categoria

ordem

integer

Não

INDEX

Ordem de apresentação

ativo

boolean

Não

INDEX

Estado de visibilidade

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da última atualização

Relações

não possui obrigatoriamente relações com outras tabelas.

7.8 Módulos adicionais

A versão atual do projeto inclui avaliações, notificações persistentes, registo de atividade e um assistente virtual baseado nas FAQs.

As estruturas descritas nesta secção foram verificadas nas migrations da versão final. Não existem tabelas de mensagens ou conversas.

7.8.1 Avaliações

Relações funcionais confirmadas:

uma avaliação pertence a um utilizador;

uma avaliação encontra-se associada a uma reserva;

uma reserva pode possuir, no máximo, uma avaliação;

a classificação contribui para o cálculo da média do setor;

pode existir moderação.

Comando de verificação:

php artisan migrate:status

e, no MySQL:

SHOW CREATE TABLE avaliacoes;

7.8.2 Notificações

As notificações persistentes utilizam normalmente a tabela Laravel:

notifications

A estrutura exata deve ser confirmada na migration instalada.

Comando:

SHOW CREATE TABLE notifications;

7.8.3 Assistente virtual

O assistente virtual não possui tabela própria nem persiste conversas. O ChatController consulta a tabela faqs e utiliza os campos pergunta, resposta, keywords_pt e keywords_en para selecionar uma resposta relevante.

Não existem, na versão atual, tabelas de mensagens, conversas ou participantes.

7.8.4 Tabela activity_logs

Finalidade

Regista ações administrativas, tarefas automáticas e operações sensíveis para auditoria funcional.

Campos principais

id — identificador do registo;

actor_id — utilizador responsável, quando aplicável;

actor_name e actor_email — identificação preservada do ator;

category e action — classificação da operação;

description — descrição legível;

subject_type e subject_id — entidade afetada;

metadata — contexto adicional em JSON, incluindo os intervenientes no check-in presencial;

result e ip_address — resultado e origem da operação;

created_at e updated_at — datas do registo.

7.8.5 Campos de integração com Google Calendar

A tabela users possui google_calendar_access_token, google_calendar_refresh_token e google_calendar_token_expira_em. A tabela reservas possui google_event_id para associar a reserva ao evento sincronizado. Os tokens são dados sensíveis e não devem ser expostos em respostas, logs ou documentação de credenciais.

7.9 Tabelas de autenticação e infraestrutura Laravel

7.9.1 Tabela personal_access_tokens

Finalidade

Armazena os tokens emitidos pelo Laravel Sanctum.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador

tokenable_type

varchar(255)

Não

INDEX

Tipo do Model

tokenable_id

bigint

Não

INDEX

Identificador do Model

name

varchar(255)

Não

—

Nome do token

token

varchar(64)

Não

UNIQUE

Hash do token

abilities

text

Sim

—

Capacidades

last_used_at

timestamp

Sim

—

Última utilização

expires_at

timestamp

Sim

—

Expiração

created_at

timestamp

Sim

—

Data de criação

updated_at

timestamp

Sim

—

Data da atualização

A relação é polimórfica e encontra-se normalmente associada a users.

7.9.2 Tabela password_reset_tokens

Finalidade

Armazena temporariamente os tokens de redefinição da palavra-passe.

Campo

Tipo

Nulo

Chave

Descrição

email

varchar(255)

Não

PK

Email do utilizador

token

varchar(255)

Não

—

Token de recuperação

created_at

timestamp

Sim

—

Data de criação

7.9.3 Tabela sessions

Finalidade

Armazena sessões quando o controlador de sessão utiliza a base de dados.

Campo

Tipo

Nulo

Chave

Descrição

id

varchar(255)

Não

PK

Identificador da sessão

user_id

bigint

Sim

INDEX

Utilizador associado

ip_address

varchar(45)

Sim

—

Endereço IP

user_agent

text

Sim

—

Cliente utilizado

payload

longtext

Não

—

Dados internos

last_activity

integer

Não

INDEX

Última atividade em Unix time

7.9.4 Tabelas de cache

cache

Campo

Tipo

Nulo

Chave

Descrição

key

varchar(255)

Não

PK

Chave

value

mediumtext

Não

—

Conteúdo

expiration

integer

Não

INDEX

Expiração

cache_locks

Campo

Tipo

Nulo

Chave

Descrição

key

varchar(255)

Não

PK

Chave

owner

varchar(255)

Não

—

Proprietário

expiration

integer

Não

INDEX

Expiração

Estas tabelas apenas são utilizadas quando o cache está configurado para a base de dados.

7.9.5 Tabelas de filas

jobs

Armazena tarefas assíncronas pendentes.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador

queue

varchar(255)

Não

INDEX

Fila

payload

longtext

Não

—

Dados da tarefa

attempts

tinyint

Não

—

Tentativas

reserved_at

integer

Sim

—

Reserva da tarefa

available_at

integer

Não

INDEX

Disponibilidade

created_at

integer

Não

—

Criação

job_batches

Armazena grupos de tarefas.

Campo

Tipo

Nulo

Chave

Descrição

id

varchar(255)

Não

PK

Identificador do lote

name

varchar(255)

Não

—

Nome

total_jobs

integer

Não

—

Total

pending_jobs

integer

Não

—

Pendentes

failed_jobs

integer

Não

—

Falhadas

failed_job_ids

longtext

Não

—

IDs falhados

options

mediumtext

Sim

—

Opções

cancelled_at

integer

Sim

—

Cancelamento

created_at

integer

Não

—

Criação

finished_at

integer

Sim

—

Conclusão

failed_jobs

Armazena tarefas cuja execução falhou.

Campo

Tipo

Nulo

Chave

Descrição

id

bigint

Não

PK

Identificador

uuid

varchar(255)

Não

UNIQUE

Identificador único

connection

text

Não

—

Ligação

queue

text

Não

—

Fila

payload

longtext

Não

—

Dados

exception

longtext

Não

—

Exceção

failed_at

timestamp

Não

—

Data da falha

Estas tabelas apenas são necessárias quando a aplicação utiliza o sistema de filas baseado na base de dados.

7.10 Resumo das relações

roles
└── users
    ├── reservas
    │   ├── pagamentos
    │   └── avaliacoes
    ├── pedido_suportes
    ├── avaliacoes
    ├── notifications
    ├── personal_access_tokens
    └── sessions

edificios
└── pisos
    └── setores
        └── secretarias
            └── reservas

periodos
└── reservas

estado_reservas
└── reservas

faqs

As notificações e avaliações utilizam as tabelas notifications e avaliacoes. O assistente virtual reutiliza faqs e não introduz relações de conversação.

7.11 Índices e restrições recomendados

As migrations devem garantir, quando aplicável:

users.email                                  UNIQUE
edificios.codigo                             UNIQUE
pisos(edificio_id, codigo)                   UNIQUE
secretarias.qr_token                         UNIQUE
pagamentos.reserva_id                        UNIQUE
pagamentos.referencia                        UNIQUE

Devem possuir índices os campos utilizados frequentemente em:

relações;

disponibilidade;

conflitos;

estados;

filtros;

ordenação;

autenticação.

Exemplos:

reservas.user_id
reservas.secretaria_id
reservas.periodo_id
reservas.estado_reserva_id
reservas.data
reservas.data_fim
reservas.tipo_duracao
pagamentos.estado
pagamentos.metodo
users.ativo
setores.ativo
setores.reservavel
secretarias.ativo
secretarias.reservavel

7.12 Regras de integridade

A estrutura deve garantir:

Um utilizador pertence a um papel existente.

Um piso pertence a um edifício existente.

Um setor pertence a um piso existente.

Uma secretária pertence a um setor existente.

Uma reserva referencia utilizador, secretária, período e estado válidos.

Um pagamento pertence a uma reserva.

Uma reserva possui, no máximo, um pagamento.

Uma reserva longa possui uma data final.

Apenas secretárias ativas e reserváveis podem receber novas reservas.

As reservas incompatíveis não podem sobrepor-se.

As entidades desativadas preservam o histórico.

Os ficheiros armazenam apenas caminhos relativos.

Os tokens e palavras-passe são guardados de forma segura.

Uma avaliação apenas pode ser associada a uma reserva elegível.

As notificações apenas podem ser consultadas pelos utilizadores autorizados; o assistente virtual não persiste mensagens.

As regras que dependem de intervalos de datas ou estados são validadas na aplicação através de Form Requests, Policies, Services e Controllers, além das restrições existentes na base de dados.

7.13 Verificação da estrutura real

Antes da entrega, deve ser gerado um inventário das migrations:

php artisan migrate:status

A estrutura real pode ser consultada com:

SHOW TABLES;

SHOW CREATE TABLE reservas;
SHOW CREATE TABLE pagamentos;
SHOW CREATE TABLE avaliacoes;
SHOW CREATE TABLE notifications;

ou:

DESCRIBE roles;
DESCRIBE users;
DESCRIBE edificios;
DESCRIBE pisos;
DESCRIBE setores;
DESCRIBE secretarias;
DESCRIBE periodos;
DESCRIBE estado_reservas;
DESCRIBE reservas;
DESCRIBE pagamentos;
DESCRIBE pedido_suportes;
DESCRIBE faqs;

A documentação final deve ser corrigida caso algum nome, tipo, nulabilidade ou restrição seja diferente do definido nas migrations.

7.14 Considerações finais

O dicionário de dados do SpaceHub organiza a informação em quatro grupos principais:

identidade e autenticação;

gestão dos espaços;

reservas e pagamentos;

apoio e infraestrutura.

A hierarquia entre edifícios, pisos, setores e secretárias representa a organização física dos espaços.

A entidade reservas liga utilizadores, secretárias, períodos, estados, duração e intervalo de datas.

A entidade pagamentos mantém os dados financeiros separados da reserva, enquanto o Help Center utiliza FAQs e pedidos de suporte.

As tabelas de avaliações, notificações e atividade devem corresponder às migrations da versão final. O assistente virtual utiliza faqs e não possui tabelas de mensagens.
