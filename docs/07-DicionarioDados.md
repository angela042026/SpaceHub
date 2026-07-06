# Dicionário de Dados — SpaceHub

## Tabela: roles

| Campo | Tipo | Descrição |
|---|---|---|
| id | bigint | Identificador único do papel |
| nome | varchar(50) | Nome do papel |
| descricao | varchar | Descrição do papel |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

---

## Tabela: users

| Campo | Tipo | Descrição |
|---|---|---|
| id | bigint | Identificador único do utilizador |
| name | varchar | Nome do utilizador |
| email | varchar | Email do utilizador |
| password | varchar | Password encriptada |
| role_id | foreign key | Papel associado ao utilizador |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

---

## Tabela: edificios

Representa os edifícios geridos pelo SpaceHub.

---

## Tabela: pisos

Representa os pisos de cada edifício.

---

## Tabela: setores

Representa zonas físicas dentro de um piso.

---

## Tabela: secretarias

Representa os postos de trabalho reserváveis.

---

## Tabela: reservas

Representa as reservas efetuadas pelos utilizadores.