3. Modelo da Base de Dados

3.1 Introdução

O modelo da base de dados do SpaceHub segue o modelo relacional e foi concebido para garantir:

integridade referencial;

normalização dos dados;

consistência entre entidades;

preservação do histórico;

suporte às regras de negócio;

facilidade de manutenção e evolução.

A implementação utiliza o ORM Eloquent do Laravel, migrations, seeders, chaves primárias, chaves estrangeiras, índices e restrições de unicidade.

A estrutura suporta a gestão de utilizadores, espaços, reservas, pagamentos, avaliações, notificações, comunicação e apoio ao utilizador.

3.2 Organização por módulos

As entidades encontram-se organizadas por domínio funcional.

Identidade e controlo de acesso

Entidade

Finalidade

roles

Define os papéis existentes na aplicação

users

Armazena os utilizadores e os respetivos dados de autenticação e perfil

Gestão de espaços

Entidade

Finalidade

edificios

Representa os edifícios disponíveis

pisos

Representa os pisos pertencentes a cada edifício

setores

Divide os pisos em áreas funcionais

secretarias

Representa os postos de trabalho reserváveis

Reservas e pagamentos

Entidade

Finalidade

periodos

Define os períodos diários disponíveis

estado_reservas

Centraliza os estados possíveis das reservas

reservas

Regista as reservas efetuadas

pagamentos

Regista os pagamentos simulados associados às reservas

avaliacoes

Regista as avaliações submetidas após reservas elegíveis

Apoio, notificações e comunicação

Entidade

Finalidade

pedido_suportes

Regista pedidos de apoio submetidos pelos utilizadores

faqs

Armazena perguntas e respostas frequentes

notifications

Mantém notificações persistentes associadas aos utilizadores

activity_logs

Regista ações administrativas, automáticas e operações sensíveis, incluindo o check-in presencial

3.3 Organização hierárquica dos espaços

Os espaços físicos são representados através da seguinte hierarquia:

Edifício
└── Piso
    └── Setor
        └── Secretária

Esta estrutura permite:

associar vários pisos a um edifício;

associar vários setores a um piso;

associar várias secretárias a um setor;

aplicar filtros por localização;

representar os espaços no mapa interativo;

calcular disponibilidade e ocupação por nível hierárquico.

3.4 Relações principais

Relação

Cardinalidade

Role → Users

1 : N

Edifício → Pisos

1 : N

Piso → Setores

1 : N

Setor → Secretárias

1 : N

User → Reservas

1 : N

Secretária → Reservas

1 : N

Período → Reservas

1 : N

EstadoReserva → Reservas

1 : N

Reserva → Pagamento

1 : 0..1

Reserva → Avaliação

1 : 0..1

User → Avaliações

1 : N

User → Pedidos de suporte

1 : N

User → Notificações

1 : N

As relações são implementadas através dos métodos Eloquent:

belongsTo;

hasMany;

hasOne.

3.5 Entidade users

A entidade users representa todos os utilizadores da aplicação.

Cada utilizador encontra-se associado a um papel e pode possuir:

nome;

email;

palavra-passe protegida por hashing;

fotografia de perfil;

estado ativo/inativo;

dados de verificação e recuperação de acesso;

datas de criação e atualização.

Relações principais

Um utilizador:

pertence a um papel;

pode possuir várias reservas;

pode efetuar avaliações;

pode criar pedidos de suporte;

pode receber notificações;

pode utilizar o assistente virtual, sem que a pergunta seja persistida.

O email deve ser único.

A desativação da conta impede a autenticação e o acesso a operações protegidas, sem eliminar o histórico associado.

3.6 Entidades de gestão de espaços

Edifícios

A entidade edificios representa as localizações físicas principais da aplicação.

Pode armazenar, entre outros:

nome;

código;

morada;

código postal;

cidade;

país;

contactos;

horário;

descrição;

estado ativo.

Pisos

Cada piso pertence obrigatoriamente a um edifício.

Pode armazenar:

edifício associado;

nome;

código;

planta;

descrição;

estado ativo.

O código do piso deve ser único dentro do respetivo edifício.

Setores

Cada setor pertence obrigatoriamente a um piso.

Pode armazenar:

piso associado;

nome e código;

tipo;

capacidade;

estado ativo;

indicação de reservável;

posição e dimensões na planta;

preços aplicáveis às reservas.

Os preços permanecem armazenados no setor:

preco_meio_dia;

preco_dia_inteiro;

preco_semanal;

preco_mensal;

preco_anual.

Secretárias

Cada secretária pertence obrigatoriamente a um setor.

Pode armazenar:

setor associado;

código;

características e equipamentos;

posição e rotação no mapa;

estado ativo;

indicação de reservável;

token QR único.

A secretária apenas pode ser utilizada numa reserva quando se encontra ativa e configurada como reservável.

3.7 Entidade reservas

A entidade reservas constitui o elemento central do sistema.

Cada reserva associa:

um utilizador;

uma secretária;

um período;

um estado;

uma data de início;

uma duração;

uma data final.

Entre os campos relevantes encontram-se:

user_id;

secretaria_id;

periodo_id;

estado_reserva_id;

data;

tipo_duracao;

data_fim;

data de cancelamento;

data de check-in;

observações;

datas de criação e atualização.

A reserva permite acompanhar todo o seu ciclo de vida, desde a criação até à confirmação, cancelamento ou expiração.

3.8 Períodos e durações

Os períodos e as durações representam conceitos diferentes.

Períodos

A tabela periodos mantém apenas:

Manhã;

Tarde;

Dia inteiro.

Durações

A duração é armazenada na própria reserva através de tipo_duracao.

Os valores suportados são:

diária;

semanal;

mensal;

anual.

As reservas semanais, mensais e anuais utilizam sempre o período Dia inteiro.

A data final é calculada automaticamente:

semanal: cinco dias úteis;

mensal: vinte e dois dias úteis;

anual: duzentos e sessenta e quatro dias úteis.

Cada reserva longa gera apenas:

um registo em reservas;

um pagamento associado.

3.9 Estados das reservas

Os estados são centralizados na tabela estado_reservas.

Estado

Significado

pendente

Reserva criada e ainda não confirmada por check-in

confirmada

Check-in efetuado com sucesso

cancelada

Reserva cancelada

expirada

Reserva que perdeu validade por incumprimento das condições

A utilização de uma entidade própria para os estados permite:

evitar valores inconsistentes;

centralizar a gestão do ciclo de vida;

facilitar filtros e relatórios;

suportar alterações futuras.

3.10 Entidade pagamentos

A entidade pagamentos foi separada da reserva para isolar a informação financeira e permitir evolução futura.

Cada pagamento pertence obrigatoriamente a uma reserva e pode armazenar:

reserva associada;

valor;

método;

estado;

referência;

data de confirmação;

datas de criação e atualização.

Métodos suportados

Cartão;

MB Way;

Transferência Bancária;

PayPal.

Estados

Estado

Significado

pendente

Pagamento criado e ainda não confirmado

pago

Pagamento confirmado

cancelado

Pagamento cancelado

O pagamento é criado automaticamente quando a reserva é registada.

Na versão atual, o processo é simulado e não envolve movimentação financeira real.

Cálculo do valor

O valor é calculado de acordo com:

setor da secretária;

período, nas reservas diárias;

duração selecionada;

regras de desconto aplicáveis.

Regras atuais:

semanal: cinco dias úteis;

mensal: vinte e dois dias úteis, com 10% de desconto;

anual: duzentos e sessenta e quatro dias úteis, com 20% de desconto.

A referência do pagamento deve ser única.

3.11 Entidade avaliacoes

A entidade avaliacoes permite registar a opinião do utilizador após uma reserva elegível.

Uma avaliação encontra-se associada:

ao utilizador;

à reserva;

indiretamente à secretária e ao setor reservados.

Pode armazenar:

classificação;

comentário;

estado de moderação;

datas de criação e atualização.

Cada reserva pode possuir, no máximo, uma avaliação.

A média por setor é calculada através da relação entre:

Avaliação → Reserva → Secretária → Setor

Esta estrutura evita guardar valores médios duplicados e permite recalculá-los a partir dos dados reais.

3.12 Help Center

Pedidos de suporte

A entidade pedido_suportes regista os pedidos de ajuda submetidos pelos utilizadores.

Pode armazenar:

utilizador;

assunto;

descrição;

estado;

prioridade;

resposta ou acompanhamento;

datas de criação e atualização.

Cada pedido pertence a um utilizador, enquanto um utilizador pode criar vários pedidos.

FAQs

A entidade faqs armazena perguntas e respostas frequentes.

Pode incluir:

pergunta;

resposta;

pergunta e resposta em inglês;

palavras-chave em português e inglês utilizadas pelo assistente virtual;

estado ativo;

ordem de apresentação;

datas de criação e atualização.

As FAQs podem ser desativadas sem eliminação física.

3.13 Notificações e assistente virtual

Notificações

As notificações persistentes permitem informar os utilizadores sobre acontecimentos como:

criação ou alteração de reservas;

confirmação ou cancelamento;

expiração;

alterações de pagamentos;

eventos relacionados com avaliações ou suporte.

A estrutura pode guardar:

destinatário;

tipo;

conteúdo serializado;

data de leitura;

datas de criação e atualização.

Assistente virtual

O assistente virtual recebe uma pergunta, normaliza os termos introduzidos e procura a FAQ mais relevante através das perguntas, respostas e palavras-chave bilingues. A resposta é devolvida imediatamente ao utilizador.

Não existem tabelas de conversas, participantes ou mensagens na versão atual. O módulo reutiliza a tabela faqs e não preserva histórico de conversação.

3.14 Integridade referencial

A base de dados utiliza chaves estrangeiras para impedir associações a registos inexistentes.

Exemplos:

um utilizador pertence a um papel válido;

um piso pertence a um edifício;

um setor pertence a um piso;

uma secretária pertence a um setor;

uma reserva referencia utilizador, secretária, período e estado;

um pagamento pertence a uma reserva;

uma avaliação pertence a uma reserva e a um utilizador;

um pedido de suporte pertence a um utilizador.

As ações de eliminação ou desativação devem preservar o histórico e respeitar as relações existentes.

3.15 Restrições e campos únicos

Entre os campos ou combinações que devem ser únicos encontram-se:

users.email
secretarias.qr_token
pagamentos.referencia
pisos(edificio_id, codigo)

Outras restrições podem ser aplicadas de acordo com as migrations, por exemplo:

códigos únicos dentro da respetiva entidade superior;

uma avaliação por reserva;

um pagamento por reserva.

As regras de conflito de reservas são validadas principalmente na aplicação, porque dependem de intervalos de datas, duração, período e estado.

3.16 Ativação lógica

As principais entidades utilizam o atributo ativo.

Esta abordagem permite:

preservar o histórico;

evitar perda de informação;

impedir novas operações com entidades desativadas;

manter relações antigas;

permitir reativação futura.

A ativação lógica aplica-se, entre outras, a:

utilizadores;

edifícios;

pisos;

setores;

secretárias;

FAQs.

A desativação não equivale a eliminação física.

3.17 Upload de ficheiros

O modelo suporta ficheiros associados aos utilizadores e aos pisos.

Entidade

Campo

users

fotografia

pisos

planta

Os ficheiros são armazenados através do sistema de armazenamento público do Laravel:

storage/app/public

A disponibilização pública é efetuada através do link simbólico:

public/storage

Na base de dados é guardado apenas o caminho relativo do ficheiro, evitando o armazenamento de dados binários.

Esta abordagem facilita:

substituição;

eliminação segura;

geração de URLs;

mudança futura de sistema de armazenamento.

3.18 QR Code das secretárias

Cada secretária possui um token único:

qr_token

O token é utilizado para:

identificar a secretária;

localizar a reserva correspondente;

validar o utilizador;

validar a data e o período;

confirmar o check-in.

A utilização de um token evita expor diretamente o identificador numérico da secretária.

3.19 Regras de integridade e negócio

A estrutura da base de dados e a lógica da aplicação garantem, entre outras, as seguintes regras:

Uma secretária não pode possuir reservas incompatíveis no mesmo intervalo.

Um utilizador não pode possuir reservas incompatíveis entre si.

Apenas secretárias ativas e reserváveis podem ser reservadas.

Reservas longas utilizam o período Dia inteiro.

A data final é calculada a partir da duração.

Cada reserva gera, no máximo, um pagamento.

Cada pagamento pertence a uma única reserva.

Cada reserva pode receber, no máximo, uma avaliação.

Apenas reservas elegíveis podem ser avaliadas.

O check-in por QR Code apenas pode ser efetuado pelo proprietário da reserva. Administradores, Gestores e Colaboradores podem efetuar um check-in presencial assistido, ficando o funcionário identificado em activity_logs.

O QR Code deve pertencer à secretária reservada.

Reservas canceladas ou expiradas não podem ser alteradas.

Utilizadores inativos não podem executar operações protegidas.

Entidades desativadas não podem ser utilizadas em novas reservas.

A hierarquia Edifício → Piso → Setor → Secretária deve permanecer válida.

Estas regras são reforçadas através de:

migrations;

Models;

Form Requests;

Policies;

Services;

Controllers;

comandos e tarefas agendadas.

3.20 Índices e desempenho

Devem possuir índices os campos utilizados frequentemente em:

relações;

filtros;

pesquisa;

ordenação;

verificação de conflitos.

Entre os principais encontram-se:

chaves estrangeiras;

email;

estado;

data inicial e final da reserva;

tipo de duração;

período;

secretária;

utilizador;

referência do pagamento;

token QR;

data de leitura das notificações.

Os índices melhoram o desempenho das consultas de disponibilidade, dashboard, relatórios e listagens administrativas.

3.21 Normalização

O modelo segue princípios de normalização para reduzir redundâncias.

Exemplos:

os papéis são armazenados em roles;

os períodos são armazenados em periodos;

os estados são armazenados em estado_reservas;

os espaços são divididos entre edifícios, pisos, setores e secretárias;

os pagamentos são separados das reservas;

as avaliações são armazenadas separadamente;

os ficheiros são guardados no sistema de armazenamento, mantendo apenas o caminho na base de dados.

A separação das entidades facilita a manutenção e evita inconsistências.

3.22 Diagrama conceptual

erDiagram
    ROLES ||--o{ USERS : atribui
    EDIFICIOS ||--o{ PISOS : possui
    PISOS ||--o{ SETORES : possui
    SETORES ||--o{ SECRETARIAS : possui

    USERS ||--o{ RESERVAS : efetua
    SECRETARIAS ||--o{ RESERVAS : recebe
    PERIODOS ||--o{ RESERVAS : define
    ESTADO_RESERVAS ||--o{ RESERVAS : classifica

    RESERVAS ||--o| PAGAMENTOS : gera
    RESERVAS ||--o| AVALIACOES : recebe
    USERS ||--o{ AVALIACOES : submete

    USERS ||--o{ PEDIDO_SUPORTES : cria
    USERS ||--o{ NOTIFICATIONS : recebe

O diagrama físico final deve ser gerado a partir das migrations e refletir todas as tabelas, campos, chaves estrangeiras e restrições efetivamente existentes na versão entregue.

3.23 Considerações finais

O modelo da base de dados do SpaceHub encontra-se organizado por módulos e representa de forma coerente:

os utilizadores e respetivas permissões;

a hierarquia física dos espaços;

o ciclo completo das reservas;

os pagamentos simulados;

as avaliações;

o Help Center;

as notificações;

a comunicação em tempo real.

A utilização do Eloquent ORM, migrations, seeders, índices e relações explícitas facilita a manutenção e reduz o risco de inconsistências.

A estrutura adotada permite acrescentar novas funcionalidades sem comprometer a organização existente, mantendo a separação de responsabilidades e a integridade dos dados.
