# Arquitetura

## Backend

Laravel 12

## Base de Dados

MySQL

## Autenticação

Laravel Sanctum

## Organização

Models

Controllers

Requests

Middleware

Services

Seeders

Resources

Policies
# Arquitetura

## Tecnologias

Backend
- Laravel 12

Base de Dados
- MySQL

Autenticação

- Laravel Sanctum ✔

Frontend
- Blade + JavaScript

---

## Estrutura da Base de Dados

Roles
│
Users
│
Reservas
│
Secretárias
│
Setores
│
Pisos
│
Edifícios

---

## Funcionalidades

✔ Gestão de utilizadores

✔ Gestão de edifícios

✔ Gestão de pisos

✔ Gestão de setores

✔ Gestão de secretárias

✔ Reservas

✔ Check-in QR Code (em desenvolvimento)

✔ Dashboard com mapa interativo (em desenvolvimento)
## Autenticação

A autenticação da API é realizada através do Laravel Sanctum.

Após o login, é gerado um Personal Access Token que deve ser enviado em cada pedido protegido utilizando o esquema Bearer Token.

As rotas protegidas utilizam o middleware:

auth:sanctum

### Gestão de Utilizadores

A gestão de utilizadores é protegida por autenticação (`auth:sanctum`) e por um middleware personalizado (`role`).

Apenas utilizadores com o papel **Administrador** podem:

- listar utilizadores;
- consultar utilizadores;
- criar utilizadores;
- editar utilizadores;
- ativar/desativar utilizadores.

## Sprint 5 — Gestão de Espaços

Foi implementado o CRUD completo das entidades:

- Edifícios
- Pisos
- Setores
- Secretárias

Todos seguem o padrão arquitetural definido:

Controllers
→ Form Requests
→ Models
→ Resources
→ JSON

Foi utilizado:

- Route Model Binding
- Form Requests
- Resources
- Middleware auth:sanctum
- RoleMiddleware