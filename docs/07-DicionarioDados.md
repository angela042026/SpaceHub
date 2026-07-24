# 7. Dicionário de Dados

# 7.1 Introdução

O presente dicionário de dados descreve a estrutura da base de dados utilizada pelo SpaceHub.

Para cada entidade são apresentados os respetivos atributos, tipo de dados, nulabilidade, chaves e descrição funcional.

A estrutura foi implementada através de migrations do Laravel, utilizando o sistema de migrações e o ORM Eloquent para garantir a integridade e consistência da informação.

---

# 7.2 Tabela `roles`

Finalidade:

Armazena os diferentes papéis atribuídos aos utilizadores da aplicação.

| Campo | Tipo | Nulo | Chave | Descrição |
|--------|------|------|--------|-----------|
| id | bigint | Não | PK | Identificador do papel |
| nome | varchar(50) | Não | UNIQUE | Nome do papel |
| descricao | varchar(255) | Sim | — | Descrição do papel |
| created_at | timestamp | Sim | — | Data de criação |
| updated_at | timestamp | Sim | — | Data da última atualização |

---

# 7.3 Tabela `users`

Finalidade:

Armazena todos os utilizadores autenticados da aplicação.

| Campo | Tipo | Nulo | Chave | Descrição |
|--------|------|------|--------|-----------|
| id | bigint | Não | PK | Identificador do utilizador |
| role_id | bigint | Não | FK | Papel associado ao utilizador |
| name | varchar(255) | Não | — | Nome completo |
| email | varchar(255) | Não | UNIQUE | Endereço de email |
| email_verified_at | timestamp | Sim | — | Data de verificação do email |
| password | varchar(255) | Não | — | Password cifrada |
| fotografia | varchar(255) | Sim | — | Caminho da fotografia de perfil |
| ativo | boolean | Não | — | Estado da conta |
| remember_token | varchar(100) | Sim | — | Token de sessão |
| created_at | timestamp | Sim | — | Data de criação |
| updated_at | timestamp | Sim | — | Data da última atualização |

### Relações

- pertence a um Role;
- possui várias Reservas.

---

# 7.4 Tabela `edificios`

Finalidade:

Representa cada edifício existente na organização.

| Campo | Tipo | Nulo | Chave | Descrição |
|--------|------|------|--------|-----------|
| id | bigint | Não | PK | Identificador do edifício |
| nome | varchar(100) | Não | — | Nome do edifício |
| codigo | varchar(20) | Não | UNIQUE | Código identificador |
| morada | varchar(255) | Não | — | Morada |
| codigo_postal | varchar(20) | Sim | — | Código postal |
| cidade | varchar(100) | Não | — | Cidade |
| pais | varchar(100) | Não | — | País |
| telefone | varchar(20) | Sim | — | Telefone |
| email | varchar(255) | Sim | — | Email |
| imagem | varchar(255) | Sim | — | Imagem do edifício |
| hora_abertura | time | Não | — | Hora de abertura |
| hora_fecho | time | Não | — | Hora de encerramento |
| ativo | boolean | Não | — | Estado do edifício |
| descricao | text | Sim | — | Descrição |
| created_at | timestamp | Sim | — | Data de criação |
| updated_at | timestamp | Sim | — | Data da última atualização |

### Relações

- possui vários Pisos.

---

# 7.5 Tabela `pisos`

Finalidade:

Representa os pisos existentes em cada edifício.

| Campo | Tipo | Nulo | Chave | Descrição |
|--------|------|------|--------|-----------|
| id | bigint | Não | PK | Identificador do piso |
| edificio_id | bigint | Não | FK | Edifício associado |
| nome | varchar(100) | Não | — | Nome do piso |
| codigo | varchar(10) | Não | UNIQUE* | Código do piso |
| numero | integer | Não | — | Número do piso |
| planta | varchar(255) | Sim | — | Caminho da planta |
| descricao | text | Sim | — | Descrição |
| ativo | boolean | Não | — | Estado do piso |
| created_at | timestamp | Sim | — | Data de criação |
| updated_at | timestamp | Sim | — | Data da última atualização |

\* O campo `codigo` é único apenas dentro do mesmo edifício (`unique(edificio_id, codigo)`).

### Relações

- pertence a um Edifício;
- possui vários Setores.

---

# 7.6 Observações

As tabelas descritas anteriormente constituem a estrutura base da organização física dos espaços da aplicação.

A hierarquia implementada é a seguinte:

```text
Edifício
    │
    └── Piso
```

Os restantes níveis da estrutura (Setores e Secretárias) são apresentados na secção seguinte.

---

# 7.7 Tabela `setores`

Finalidade:

Representa as diferentes áreas funcionais existentes em cada piso.

| Campo          | Tipo         | Nulo | Chave | Descrição                          |
| -------------- | ------------ | ---- | ----- | ---------------------------------- |
| id             | bigint       | Não  | PK    | Identificador do setor             |
| piso_id        | bigint       | Não  | FK    | Piso ao qual pertence o setor      |
| nome           | varchar(100) | Não  | —     | Nome do setor                      |
| codigo         | varchar(20)  | Não  | —     | Código identificador do setor      |
| tipo           | varchar(50)  | Não  | —     | Tipo de utilização do setor        |
| reservavel     | boolean      | Não  | —     | Indica se o setor permite reservas |
| capacidade     | integer      | Sim  | —     | Capacidade máxima do setor         |
| planta_x       | decimal      | Sim  | —     | Posição horizontal no mapa         |
| planta_y       | decimal      | Sim  | —     | Posição vertical no mapa           |
| planta_largura | decimal      | Sim  | —     | Largura representada no mapa       |
| planta_altura  | decimal      | Sim  | —     | Altura representada no mapa        |
| ativo          | boolean      | Não  | —     | Estado do setor                    |
| descricao      | text         | Sim  | —     | Descrição do setor                 |
| created_at     | timestamp    | Sim  | —     | Data de criação                    |
| updated_at     | timestamp    | Sim  | —     | Data da última atualização         |

### Relações

* pertence a um Piso;
* possui várias Secretárias.

---

# 7.8 Tabela `secretarias`

Finalidade:

Representa os postos de trabalho existentes nos setores e que podem ser disponibilizados para reserva.

| Campo        | Tipo         | Nulo | Chave  | Descrição                                    |
| ------------ | ------------ | ---- | ------ | -------------------------------------------- |
| id           | bigint       | Não  | PK     | Identificador da secretária                  |
| setor_id     | bigint       | Não  | FK     | Setor ao qual pertence a secretária          |
| codigo       | varchar(50)  | Não  | —      | Código identificador da secretária           |
| planta_x     | decimal      | Sim  | —      | Posição horizontal no mapa                   |
| planta_y     | decimal      | Sim  | —      | Posição vertical no mapa                     |
| angulo       | decimal      | Não  | —      | Ângulo de rotação no mapa                    |
| monitor      | boolean      | Não  | —      | Indica se possui monitor                     |
| dock_usb     | boolean      | Não  | —      | Indica se possui dock USB                    |
| junto_janela | boolean      | Não  | —      | Indica se está localizada junto a uma janela |
| ergonomica   | boolean      | Não  | —      | Indica se possui características ergonómicas |
| reservavel   | boolean      | Não  | —      | Indica se pode receber reservas              |
| ativo        | boolean      | Não  | —      | Estado da secretária                         |
| qr_token     | varchar(255) | Não  | UNIQUE | Token único utilizado no QR Code             |
| descricao    | text         | Sim  | —      | Descrição da secretária                      |
| created_at   | timestamp    | Sim  | —      | Data de criação                              |
| updated_at   | timestamp    | Sim  | —      | Data da última atualização                   |

### Relações

* pertence a um Setor;
* possui várias Reservas.

---

# 7.9 Tabela `periodos`

Finalidade:

Armazena os períodos horários disponíveis para a realização de reservas.

| Campo       | Tipo         | Nulo | Chave | Descrição                  |
| ----------- | ------------ | ---- | ----- | -------------------------- |
| id          | bigint       | Não  | PK    | Identificador do período   |
| nome        | varchar(100) | Não  | —     | Nome do período            |
| hora_inicio | time         | Não  | —     | Hora de início             |
| hora_fim    | time         | Não  | —     | Hora de fim                |
| ativo       | boolean      | Não  | —     | Estado do período          |
| created_at  | timestamp    | Sim  | —     | Data de criação            |
| updated_at  | timestamp    | Sim  | —     | Data da última atualização |

### Relações

* possui várias Reservas.

---

# 7.10 Tabela `estado_reservas`

Finalidade:

Armazena os estados possíveis do ciclo de vida de uma reserva.

| Campo      | Tipo         | Nulo | Chave  | Descrição                     |
| ---------- | ------------ | ---- | ------ | ----------------------------- |
| id         | bigint       | Não  | PK     | Identificador do estado       |
| nome       | varchar(50)  | Não  | UNIQUE | Nome ou código do estado      |
| descricao  | varchar(255) | Sim  | —      | Descrição funcional do estado |
| created_at | timestamp    | Sim  | —      | Data de criação               |
| updated_at | timestamp    | Sim  | —      | Data da última atualização    |

Os principais estados utilizados são:

| Estado     | Descrição                                  |
| ---------- | ------------------------------------------ |
| pendente   | Reserva criada e ainda sem check-in        |
| confirmada | Reserva com check-in efetuado              |
| cancelada  | Reserva cancelada                          |
| expirada   | Reserva que perdeu a validade sem check-in |

### Relações

* possui várias Reservas.

---

# 7.11 Tabela `reservas`

Finalidade:

Armazena as reservas de secretárias efetuadas pelos utilizadores.

| Campo             | Tipo      | Nulo | Chave | Descrição                           |
| ----------------- | --------- | ---- | ----- | ----------------------------------- |
| id                | bigint    | Não  | PK    | Identificador da reserva            |
| user_id           | bigint    | Não  | FK    | Utilizador responsável pela reserva |
| secretaria_id     | bigint    | Não  | FK    | Secretária reservada                |
| periodo_id        | bigint    | Não  | FK    | Período selecionado                 |
| estado_reserva_id | bigint    | Não  | FK    | Estado atual da reserva             |
| data              | date      | Não  | —     | Data da reserva                     |
| check_in_at       | timestamp | Sim  | —     | Data e hora do check-in             |
| cancelada_at      | timestamp | Sim  | —     | Data e hora do cancelamento         |
| observacoes       | text      | Sim  | —     | Observações associadas à reserva    |
| created_at        | timestamp | Sim  | —     | Data de criação                     |
| updated_at        | timestamp | Sim  | —     | Data da última atualização          |

### Relações

* pertence a um User;
* pertence a uma Secretária;
* pertence a um Período;
* pertence a um EstadoReserva;
* pode possuir um Pagamento.

### Regras

* uma secretária não pode possuir mais do que uma reserva ativa para a mesma data e período;
* um utilizador não pode possuir mais do que uma reserva para o mesmo dia e período;
* apenas secretárias ativas e reserváveis podem receber reservas;
* apenas reservas válidas podem realizar check-in;
* reservas sem check-in podem ser automaticamente marcadas como expiradas.

---

# 7.12 Tabela `pagamentos`

Finalidade:

Armazena os pagamentos associados às reservas.

| Campo        | Tipo          | Nulo | Chave      | Descrição                       |
| ------------ | ------------- | ---- | ---------- | ------------------------------- |
| id           | bigint        | Não  | PK         | Identificador do pagamento      |
| reserva_id   | bigint        | Não  | FK, UNIQUE | Reserva associada ao pagamento  |
| valor        | decimal(10,2) | Não  | —          | Valor do pagamento              |
| metodo       | varchar(50)   | Não  | —          | Método de pagamento selecionado |
| estado       | varchar(50)   | Não  | —          | Estado atual do pagamento       |
| referencia   | varchar(255)  | Não  | UNIQUE     | Referência única do pagamento   |
| pago_at      | timestamp     | Sim  | —          | Data e hora da confirmação      |
| cancelado_at | timestamp     | Sim  | —          | Data e hora do cancelamento     |
| created_at   | timestamp     | Sim  | —          | Data de criação                 |
| updated_at   | timestamp     | Sim  | —          | Data da última atualização      |

Os métodos de pagamento suportados incluem:

| Método        | Descrição                                     |
| ------------- | --------------------------------------------- |
| cartao        | Pagamento simulado por cartão                 |
| mbway         | Pagamento simulado por MB Way                 |
| transferencia | Pagamento simulado por transferência bancária |

Os estados possíveis incluem:

| Estado    | Descrição                               |
| --------- | --------------------------------------- |
| pendente  | Pagamento criado e ainda não confirmado |
| pago      | Pagamento confirmado                    |
| cancelado | Pagamento cancelado                     |

### Relações

* pertence a uma Reserva.

### Regras

* uma reserva pode possuir, no máximo, um pagamento;
* cada pagamento pertence obrigatoriamente a uma reserva;
* a referência do pagamento deve ser única;
* o valor não pode ser negativo;
* apenas pagamentos pendentes podem ser confirmados;
* pagamentos cancelados não podem ser confirmados.

---

# 7.13 Tabela `pedido_suportes`

Finalidade:

Armazena os pedidos de suporte submetidos pelos utilizadores através do Help Center.

| Campo         | Tipo         | Nulo | Chave | Descrição                                 |
| ------------- | ------------ | ---- | ----- | ----------------------------------------- |
| id            | bigint       | Não  | PK    | Identificador do pedido de suporte        |
| user_id       | bigint       | Não  | FK    | Utilizador que submeteu o pedido          |
| assunto       | varchar(255) | Não  | —     | Assunto do pedido                         |
| descricao     | text         | Não  | —     | Descrição do problema ou solicitação      |
| estado        | varchar(50)  | Não  | —     | Estado atual do pedido                    |
| prioridade    | varchar(50)  | Sim  | —     | Prioridade atribuída ao pedido            |
| resposta      | text         | Sim  | —     | Resposta ou acompanhamento administrativo |
| respondido_at | timestamp    | Sim  | —     | Data e hora da resposta                   |
| created_at    | timestamp    | Sim  | —     | Data de criação                           |
| updated_at    | timestamp    | Sim  | —     | Data da última atualização                |

Os estados podem incluir:

| Estado        | Descrição                           |
| ------------- | ----------------------------------- |
| aberto        | Pedido criado e ainda não analisado |
| em_tratamento | Pedido em análise                   |
| resolvido     | Pedido concluído                    |
| fechado       | Pedido encerrado                    |

### Relações

* pertence a um User.

---

# 7.14 Tabela `faqs`

Finalidade:

Armazena as perguntas e respostas frequentes apresentadas no Help Center.

| Campo      | Tipo         | Nulo | Chave | Descrição                          |
| ---------- | ------------ | ---- | ----- | ---------------------------------- |
| id         | bigint       | Não  | PK    | Identificador da FAQ               |
| pergunta   | varchar(255) | Não  | —     | Pergunta apresentada ao utilizador |
| resposta   | text         | Não  | —     | Resposta à pergunta                |
| categoria  | varchar(100) | Sim  | —     | Categoria da FAQ                   |
| ordem      | integer      | Sim  | —     | Ordem de apresentação              |
| ativo      | boolean      | Não  | —     | Estado de visibilidade             |
| created_at | timestamp    | Sim  | —     | Data de criação                    |
| updated_at | timestamp    | Sim  | —     | Data da última atualização         |

### Relações

A entidade FAQ não necessita de uma relação obrigatória com as restantes entidades da aplicação.

A sua utilização é independente e destina-se à apresentação de conteúdos de ajuda.

---

# 7.15 Tabela `personal_access_tokens`

Finalidade:

Armazena os tokens de autenticação gerados pelo Laravel Sanctum.

| Campo          | Tipo         | Nulo | Chave  | Descrição                           |
| -------------- | ------------ | ---- | ------ | ----------------------------------- |
| id             | bigint       | Não  | PK     | Identificador do token              |
| tokenable_type | varchar(255) | Não  | INDEX  | Tipo do modelo autenticado          |
| tokenable_id   | bigint       | Não  | INDEX  | Identificador do modelo autenticado |
| name           | varchar(255) | Não  | —      | Nome atribuído ao token             |
| token          | varchar(64)  | Não  | UNIQUE | Token armazenado de forma segura    |
| abilities      | text         | Sim  | —      | Capacidades atribuídas ao token     |
| last_used_at   | timestamp    | Sim  | —      | Data da última utilização           |
| expires_at     | timestamp    | Sim  | —      | Data de expiração                   |
| created_at     | timestamp    | Sim  | —      | Data de criação                     |
| updated_at     | timestamp    | Sim  | —      | Data da última atualização          |

### Relações

A tabela utiliza uma relação polimórfica com o modelo autenticado.

No SpaceHub, os tokens encontram-se normalmente associados aos registos da tabela `users`.

---

# 7.16 Tabela `password_reset_tokens`

Finalidade:

Armazena temporariamente os tokens utilizados no processo de recuperação da password.

| Campo      | Tipo         | Nulo | Chave | Descrição                |
| ---------- | ------------ | ---- | ----- | ------------------------ |
| email      | varchar(255) | Não  | PK    | Email do utilizador      |
| token      | varchar(255) | Não  | —     | Token de recuperação     |
| created_at | timestamp    | Sim  | —     | Data de criação do token |

Os registos desta tabela possuem caráter temporário e são utilizados apenas durante o processo de redefinição da password.

---

# 7.17 Tabela `sessions`

Finalidade:

Armazena as sessões dos utilizadores quando a aplicação utiliza o controlador de sessões da base de dados.

| Campo         | Tipo         | Nulo | Chave | Descrição                                |
| ------------- | ------------ | ---- | ----- | ---------------------------------------- |
| id            | varchar(255) | Não  | PK    | Identificador da sessão                  |
| user_id       | bigint       | Sim  | INDEX | Utilizador associado                     |
| ip_address    | varchar(45)  | Sim  | —     | Endereço IP                              |
| user_agent    | text         | Sim  | —     | Informação do browser ou cliente         |
| payload       | longtext     | Não  | —     | Dados internos da sessão                 |
| last_activity | integer      | Não  | INDEX | Data da última atividade em formato Unix |

### Relações

* pode estar associada a um User.

---

# 7.18 Tabela `cache`

Finalidade:

Armazena dados temporários quando a aplicação utiliza a base de dados como sistema de cache.

| Campo      | Tipo         | Nulo | Chave | Descrição                 |
| ---------- | ------------ | ---- | ----- | ------------------------- |
| key        | varchar(255) | Não  | PK    | Chave do registo de cache |
| value      | mediumtext   | Não  | —     | Valor armazenado          |
| expiration | integer      | Não  | INDEX | Data de expiração         |

---

# 7.19 Tabela `cache_locks`

Finalidade:

Armazena bloqueios temporários associados ao sistema de cache.

| Campo      | Tipo         | Nulo | Chave | Descrição                     |
| ---------- | ------------ | ---- | ----- | ----------------------------- |
| key        | varchar(255) | Não  | PK    | Chave do bloqueio             |
| owner      | varchar(255) | Não  | —     | Identificador do proprietário |
| expiration | integer      | Não  | INDEX | Data de expiração             |

---

# 7.20 Tabela `jobs`

Finalidade:

Armazena tarefas assíncronas quando a aplicação utiliza filas baseadas na base de dados.

| Campo        | Tipo         | Nulo | Chave | Descrição                             |
| ------------ | ------------ | ---- | ----- | ------------------------------------- |
| id           | bigint       | Não  | PK    | Identificador da tarefa               |
| queue        | varchar(255) | Não  | INDEX | Nome da fila                          |
| payload      | longtext     | Não  | —     | Dados necessários à execução          |
| attempts     | tinyint      | Não  | —     | Número de tentativas                  |
| reserved_at  | integer      | Sim  | —     | Momento em que a tarefa foi reservada |
| available_at | integer      | Não  | —     | Momento em que fica disponível        |
| created_at   | integer      | Não  | —     | Momento de criação                    |

---

# 7.21 Tabela `job_batches`

Finalidade:

Armazena informação sobre grupos de tarefas executadas através do sistema de filas.

| Campo          | Tipo         | Nulo | Chave | Descrição                            |
| -------------- | ------------ | ---- | ----- | ------------------------------------ |
| id             | varchar(255) | Não  | PK    | Identificador do grupo               |
| name           | varchar(255) | Não  | —     | Nome do grupo                        |
| total_jobs     | integer      | Não  | —     | Número total de tarefas              |
| pending_jobs   | integer      | Não  | —     | Número de tarefas pendentes          |
| failed_jobs    | integer      | Não  | —     | Número de tarefas falhadas           |
| failed_job_ids | longtext     | Não  | —     | Identificadores das tarefas falhadas |
| options        | mediumtext   | Sim  | —     | Opções do grupo                      |
| cancelled_at   | integer      | Sim  | —     | Momento do cancelamento              |
| created_at     | integer      | Não  | —     | Momento de criação                   |
| finished_at    | integer      | Sim  | —     | Momento de conclusão                 |

---

# 7.22 Tabela `failed_jobs`

Finalidade:

Armazena informação relativa a tarefas que falharam durante a execução.

| Campo      | Tipo         | Nulo | Chave  | Descrição                     |
| ---------- | ------------ | ---- | ------ | ----------------------------- |
| id         | bigint       | Não  | PK     | Identificador do registo      |
| uuid       | varchar(255) | Não  | UNIQUE | Identificador único da tarefa |
| connection | text         | Não  | —      | Ligação utilizada             |
| queue      | text         | Não  | —      | Fila utilizada                |
| payload    | longtext     | Não  | —      | Dados da tarefa               |
| exception  | longtext     | Não  | —      | Informação sobre a exceção    |
| failed_at  | timestamp    | Não  | —      | Data e hora da falha          |

---

# 7.23 Resumo das Relações

As principais relações entre as tabelas podem ser representadas da seguinte forma:

```text
roles
  │
  └── users
        │
        ├── reservas
        │      │
        │      └── pagamentos
        │
        ├── pedido_suportes
        │
        ├── personal_access_tokens
        │
        └── sessions


edificios
   │
   └── pisos
          │
          └── setores
                 │
                 └── secretarias
                        │
                        └── reservas


periodos
   │
   └── reservas


estado_reservas
   │
   └── reservas


faqs
```

---

# 7.24 Observação sobre a Estrutura

As tabelas `personal_access_tokens`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches` e `failed_jobs` pertencem à infraestrutura do Laravel e poderão existir ou não na base de dados, dependendo dos controladores e serviços configurados na aplicação.

Como as migrations não se encontram disponíveis para consulta, os campos apresentados para `pagamentos`, `pedido_suportes` e `faqs` devem ser confirmados através da estrutura real da base de dados antes da entrega final da documentação.

A confirmação pode ser realizada no MySQL através dos seguintes comandos:

```sql
DESCRIBE pagamentos;
DESCRIBE pedido_suportes;
DESCRIBE faqs;
```

Também pode ser utilizada a interface do phpMyAdmin para consultar a estrutura de cada tabela.
