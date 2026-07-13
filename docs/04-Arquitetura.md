# Arquitetura

## Tecnologias

Backend
- Laravel 12

Base de Dados
- MySQL

Autenticação
- Laravel Sanctum ✔

Frontend
- Inertia.js
- React
- Tailwind CSS
- JavaScript

Bibliotecas adicionais
- Recharts
- Simple QR Code
- html5-qrcode

---

## Organização

Models

Controllers

Requests

Middleware

Services

Seeders

Resources

Policies

---

## Arquitetura da API

A API segue o padrão:

Routes
↓
Controllers (Api)
↓
Form Requests
↓
Models
↓
Resources
↓
JSON

Os Controllers da API encontram-se em:

App\Http\Controllers\Api

Todos os novos CRUD devem utilizar:

- Form Requests
- Route Model Binding
- Relações Eloquent
- Resources
- Laravel Sanctum
- RoleMiddleware, quando aplicável

Nunca deve ser utilizada validação diretamente nos Controllers.

Não utilizar:

$request->validate(...)

---

## Arquitetura Web

As funcionalidades Web utilizam:

Routes
↓
Controllers
↓
Models
↓
Inertia
↓
React

Os Controllers Web encontram-se em:

App\Http\Controllers

Atualmente são utilizados para:

- Dashboard
- QR Code
- Check-in
- Mapa Interativo
- Perfil

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

## Relações Principais

Role
- hasMany User

User
- belongsTo Role
- hasMany Reserva

Edifício
- hasMany Piso

Piso
- belongsTo Edifício
- hasMany Setor

Setor
- belongsTo Piso
- hasMany Secretária

Secretária
- belongsTo Setor
- hasMany Reserva

Reserva
- belongsTo User
- belongsTo Secretária

Sempre utilizar relações Eloquent.

Evitar queries manuais quando existir uma relação adequada.

---

## Funcionalidades

✔ Gestão de utilizadores

✔ Gestão de edifícios

✔ Gestão de pisos

✔ Gestão de setores

✔ Gestão de secretárias

✔ Reservas

✔ Disponibilidade de secretárias

✔ Cancelamento de reservas

✔ Dashboard

✔ Estatísticas

✔ QR Code

✔ Check-in

✔ Mapa Interativo

---

## Autenticação

A autenticação da API é realizada através do Laravel Sanctum.

Após o login, é gerado um Personal Access Token que deve ser enviado em cada pedido protegido utilizando o esquema Bearer Token.

As rotas protegidas da API utilizam o middleware:

auth:sanctum

As rotas privadas da aplicação Web utilizam:

auth

O Dashboard utiliza:

auth
verified

---

## Autorização

A aplicação utiliza um middleware personalizado:

RoleMiddleware

O alias registado é:

role

Exemplo:

Route::middleware([
    'auth:sanctum',
    'role:Administrador'
]);

Os Roles existentes são:

- Administrador
- Gestor
- Colaborador
- Utilizador

Os Roles são fixos.

Não existe CRUD de Roles.

---

## Gestão de Utilizadores

A gestão de utilizadores é protegida por autenticação (`auth:sanctum`) e pelo middleware personalizado (`role`).

Apenas utilizadores autorizados podem:

- listar utilizadores;
- consultar utilizadores;
- criar utilizadores;
- editar utilizadores;
- ativar/desativar utilizadores.

Os utilizadores não são eliminados.

É utilizado o campo:

ativo

---

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
- Relações Eloquent

---

## Gestão de Reservas

O módulo de Reservas segue a arquitetura definida para a API:

Routes
↓
Controllers (Api)
↓
Form Requests
↓
Models
↓
Resources
↓
JSON

Componentes implementados:

- ReservaController
- StoreReservaRequest
- UpdateReservaRequest
- DisponibilidadeReservaRequest
- ReservaResource

Funcionalidades implementadas:

- listar reservas;
- consultar reservas;
- criar reservas;
- atualizar reservas;
- cancelar reservas;
- consultar disponibilidade;
- cancelamento automático de reservas expiradas.

Utiliza:

- Route Model Binding
- Relações Eloquent
- Laravel Sanctum
- RoleMiddleware
- Form Requests
- Resources

---

## Dashboard

O Dashboard utiliza Laravel, Inertia e React.

Controller:

DashboardController

Rota:

GET /dashboard

O Dashboard apresenta:

- estatísticas de ocupação;
- reservas;
- disponibilidade;
- gráficos;
- mapa dos espaços;
- informação de acordo com o papel do utilizador.

Os gráficos utilizam:

Recharts

---

## QR Code

Cada secretária possui um token único:

qr_token

O token é gerado automaticamente através de UUID.

A biblioteca utilizada para geração dos QR Codes é:

simplesoftwareio/simple-qrcode

Controller:

SecretariaQrCodeController

Funcionalidades:

- listar QR Codes das secretárias;
- gerar QR Code por secretária;
- criar uma URL de Check-in associada à secretária.

---

## Check-in

O Check-in é realizado através da leitura do QR Code da secretária.

Controller:

CheckInController

A leitura do QR Code no browser utiliza:

html5-qrcode

Fluxo:

Câmara
↓
Leitura do QR Code
↓
Validação do token
↓
Identificação da secretária
↓
Validação da reserva
↓
Confirmação do Check-in

---

## Mapa Interativo

O mapa interativo permite visualizar e editar a posição dos espaços na planta.

Controller:

SetorMapaController

As plantas encontram-se em:

public/images/maps

A posição dos elementos é guardada através de coordenadas na base de dados.

---

## Validação Técnica

Antes de cada commit de integração devem ser executados:

php artisan optimize:clear

composer dump-autoload

npm.cmd run build

php artisan test

php artisan route:list
## WebSockets

O projeto passa a suportar comunicação em tempo real através de Laravel Reverb.

Arquitetura:

React
↓
Laravel Echo
↓
Broadcasting
↓
Laravel Reverb
↓
Eventos Laravel

Evento implementado:

EnviarMensagem

Controlador:

ChatController

Configuração:

config/broadcasting.php

config/reverb.php

routes/channels.php