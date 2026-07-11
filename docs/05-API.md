# API

## Autenticação

**POST** `/api/register`

Regista um novo utilizador.

---

**POST** `/api/login`

Autentica um utilizador.

---

**POST** `/api/logout`

Termina a sessão.

> Requer autenticação com Laravel Sanctum.

---

**GET** `/api/me`

Devolve o utilizador autenticado.

> Requer autenticação com Laravel Sanctum.

---

**POST** `/api/forgot-password`

Envia um email de recuperação de password.

---

**POST** `/api/reset-password`

Redefine a password.

---

# Gestão de Utilizadores

> Todas as rotas requerem autenticação (`auth:sanctum`) e permissões de Administrador.

| Método | Endpoint |
|--------|----------|
| GET | `/api/users` |
| GET | `/api/users/{id}` |
| POST | `/api/users` |
| PUT | `/api/users/{id}` |
| PATCH | `/api/users/{id}/toggle-ativo` |

---

# Edifícios

| Método | Endpoint |
|--------|----------|
| GET | `/api/edificios` |
| GET | `/api/edificios/{id}` |
| POST | `/api/edificios` |
| PUT | `/api/edificios/{id}` |
| PATCH | `/api/edificios/{id}/toggle-ativo` |

---

# Pisos

| Método | Endpoint |
|--------|----------|
| GET | `/api/pisos` |
| GET | `/api/pisos/{id}` |
| POST | `/api/pisos` |
| PUT | `/api/pisos/{id}` |
| PATCH | `/api/pisos/{id}/toggle-ativo` |

---

# Setores

| Método | Endpoint |
|--------|----------|
| GET | `/api/setores` |
| GET | `/api/setores/{id}` |
| POST | `/api/setores` |
| PUT | `/api/setores/{id}` |
| PATCH | `/api/setores/{id}/toggle-ativo` |

---

# Secretárias

| Método | Endpoint |
|--------|----------|
| GET | `/api/secretarias` |
| GET | `/api/secretarias/{id}` |
| POST | `/api/secretarias` |
| PUT | `/api/secretarias/{id}` |
| PATCH | `/api/secretarias/{id}/toggle-ativo` |

---

# Reservas

| Método | Endpoint |
|--------|----------|
| GET | `/api/reservas` |
| GET | `/api/reservas/{id}` |
| POST | `/api/reservas` |
| PUT | `/api/reservas/{id}` |
| PATCH | `/api/reservas/{id}/cancelar` |
| GET | `/api/reservas/disponibilidade` |

---

# Dashboard (Web)

| Método | Endpoint |
|--------|----------|
| GET | `/dashboard` |

---

# Check-in (Web)

| Método | Endpoint |
|--------|----------|
| GET | `/checkin/camera` |
| GET | `/checkin/scan/{qrToken}` |
| POST | `/checkin/confirm/{reserva}` |

---

# QR Code

| Método | Endpoint |
|--------|----------|
| GET | `/secretarias/qrcodes` |
| GET | `/secretarias/{secretaria}/qrcode` |

---

# Mapa Interativo

| Método | Endpoint |
|--------|----------|
| GET | `/setores/mapa` |
| PATCH | `/setores/{setor}/posicao` |