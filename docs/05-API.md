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