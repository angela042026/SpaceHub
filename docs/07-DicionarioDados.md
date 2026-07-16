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