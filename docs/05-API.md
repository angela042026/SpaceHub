POST /login

POST /register

GET /edificios

POST /reservas

DELETE /reservas/{id}

POST /checkin
# API

## Autenticação

POST /api/login

POST /api/register

POST /api/logout

---

## Edifícios

GET /api/edificios

POST /api/edificios

PUT /api/edificios/{id}

DELETE /api/edificios/{id}

---

## Pisos

GET /api/pisos

...

---

## Setores

GET /api/setores

...

---

## Secretárias

GET /api/secretarias

...

---

## Reservas

GET /api/reservas

POST /api/reservas

DELETE /api/reservas/{id}

POST /api/reservas/checkin

# API

## Autenticação

### Registar utilizador

**POST** `/api/register`

Cria um novo utilizador com o perfil "Utilizador" e devolve um token de autenticação.

---

### Login

**POST** `/api/login`

Autentica um utilizador e devolve um token de acesso.

---

### Logout

**POST** `/api/logout`

Revoga o token utilizado no pedido.

> Requer autenticação com Laravel Sanctum.

---

### Utilizador autenticado

**GET** `/api/me`

Devolve os dados do utilizador autenticado.

> Requer autenticação com Laravel Sanctum.

### Recuperação de password

**POST** `/api/forgot-password`

Envia um link de recuperação de password para o email do utilizador.

**POST** `/api/reset-password`

Permite definir uma nova password usando o token recebido por email.

# Gestão de Utilizadores

> Todas as rotas requerem autenticação com Bearer Token e permissões de Administrador.

---

## Listar utilizadores

**GET** `/api/users`

Lista todos os utilizadores.

### Resposta

```json
[
  {
    "id": 1,
    "name": "Administrador",
    "email": "admin@spacehub.pt",
    "role": "Administrador",
    "ativo": true,
    "created_at": "2026-07-07 15:00:00"
  }
]
```

---

## Consultar utilizador

**GET** `/api/users/{id}`

Devolve os dados de um utilizador.

---

## Criar utilizador

**POST** `/api/users`

Cria um novo utilizador.

### Body

```json
{
  "name": "Novo Utilizador",
  "email": "novo@spacehub.pt",
  "password": "password123",
  "role_id": 4,
  "ativo": true
}
```

---

## Atualizar utilizador

**PUT** `/api/users/{id}`

Atualiza os dados de um utilizador.

### Body

```json
{
  "name": "Novo Nome",
  "email": "novo.email@spacehub.pt",
  "role_id": 3,
  "ativo": true
}
```

A password é opcional. Se for enviada, será atualizada.

---

## Ativar / Desativar utilizador

**PATCH** `/api/users/{id}/toggle-ativo`

Alterna o estado do utilizador entre ativo e inativo.

GET    /api/edificios
GET    /api/edificios/{id}
POST   /api/edificios
PUT    /api/edificios/{id}
PATCH  /api/edificios/{id}/toggle-ativo

## Reservas

GET /api/reservas
Lista todas as reservas.

GET /api/reservas/{id}
Obtém uma reserva.

POST /api/reservas
Cria uma nova reserva.

PUT /api/reservas/{id}
Atualiza uma reserva.

PATCH /api/reservas/{id}/cancelar
Cancela uma reserva.

GET /api/reservas/disponibilidade
Lista as secretárias disponíveis para uma data e período.