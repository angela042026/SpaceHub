📘 Documento Mestre do Projeto – SpaceHub

Versão: 1.1  
Estado: Em desenvolvimento  
Framework: Laravel 12 + Sanctum + Inertia.js + React + Tailwind CSS

---

# 1. Objetivo do Projeto

O SpaceHub é uma aplicação web para gestão de espaços de trabalho e reservas de secretárias.

O sistema permite:

- gerir edifícios;
- gerir pisos;
- gerir setores;
- gerir secretárias;
- gerir reservas;
- gerir utilizadores;
- controlar acessos por papéis (roles);
- gerir Check-in através de QR Code;
- visualizar estatísticas e dashboards;
- visualizar um mapa interativo dos espaços.

---

# 2. Arquitetura

O projeto segue uma arquitetura REST baseada em Laravel.

## Backend

Laravel 12

### API

Controllers
↓
Form Requests
↓
Models (Eloquent)
↓
Resources
↓
JSON

Todos os novos CRUD seguem este padrão.

Nunca colocar validação diretamente nos Controllers.

### Aplicação Web

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

Os Controllers da API encontram-se em:

App\Http\Controllers\Api

---

## Autenticação

Laravel Sanctum.

Endpoints implementados:

- Register
- Login
- Logout
- Me
- Forgot Password
- Reset Password

Todos os endpoints privados utilizam:

auth:sanctum

As páginas Web privadas utilizam:

auth

---

## Autorização

Existe um middleware personalizado:

RoleMiddleware

Registado em:

bootstrap/app.php

Alias:

role

Utilização:

```php
Route::middleware([
    'auth:sanctum',
    'role:Administrador'
]);
```

---

# 3. Base de Dados

As entidades principais são:

Role
│
User
│
Reserva
│
Secretaria
│
Setor
│
Piso
│
Edificio

Existe:

- Diagrama ER
- Dicionário de Dados

---

# 4. Relações Eloquent

Exemplo:

Edificio
hasMany(Piso)

Piso
belongsTo(Edificio)
hasMany(Setor)

Setor
belongsTo(Piso)
hasMany(Secretaria)

Secretaria
belongsTo(Setor)
hasMany(Reserva)

Reserva
belongsTo(User)
belongsTo(Secretaria)

User
belongsTo(Role)
hasMany(Reserva)

Role
hasMany(User)

Sempre utilizar relações Eloquent.

Evitar queries manuais.

---

# 5. Convenções adotadas

## Controllers

Todos os novos CRUD utilizam:

App\Http\Controllers\Api

Os Controllers Web ficam em:

App\Http\Controllers

---

## Form Requests

Toda a validação deve estar em:

StoreXXXXXRequest

UpdateXXXXXRequest

Nunca utilizar:

```php
$request->validate(...)
```

---

## Resources

Todos os endpoints devolvem:

XXXXXResource

ou

XXXXXResource::collection(...)

Nunca devolver diretamente o Model.

---

## Route Model Binding

Utilizar sempre:

```php
public function show(User $user)
```

em vez de:

```php
User::find($id)
```

---

## Passwords

Sempre:

```php
Hash::make(...)
```

Nunca guardar passwords em texto simples.

---

## Roles

Os Roles são fixos.

Existem:

- Administrador
- Gestor
- Colaborador
- Utilizador

Não existe CRUD de Roles.

---

## Utilizadores

Nunca eliminar utilizadores.

Utilizar:

ativo

para ativar/desativar.

Não implementar destroy().

---

# 6. Funcionalidades Implementadas

## Sprint 1

✅ Base de Dados

- Migrations
- Models
- Relações
- Seeders
- Documentação

---

## Sprint 2

✅ Autenticação

- Register
- Login
- Logout
- Me

Laravel Sanctum.

---

## Sprint 3

✅ Recuperação de Password

- Forgot Password
- Reset Password

Configuração:

MAIL_MAILER=log

Emails escritos em:

storage/logs/laravel.log

---

## Sprint 4

✅ Gestão de Utilizadores

Implementado:

- UserController
- UserResource
- StoreUserRequest
- UpdateUserRequest
- RoleMiddleware

CRUD:

- index
- show
- store
- update
- toggleAtivo

Sem destroy().

Existe UserSeeder.

---

## Sprint 5

✅ Gestão de Espaços

Implementado:

- CRUD Edifícios
- CRUD Pisos
- CRUD Setores
- CRUD Secretárias

Todos seguem o padrão:

Controllers
↓
Form Requests
↓
Models
↓
Resources
↓
JSON

---

## Sprint 6

✅ Reservas

Implementado:

- CRUD Reservas
- Disponibilidade
- Cancelamento
- Testes Postman

---

## Sprint 7

✅ Dashboard

✅ Estatísticas

✅ QR Code

✅ Check-in

✅ Mapa Interativo

Implementado:

- DashboardController
- CheckInController
- SecretariaQrCodeController
- SetorMapaController

Tecnologias:

- Inertia.js
- React
- Tailwind CSS
- Recharts
- Simple QR Code
- html5-qrcode

---

# 7. Próximas Tarefas

- Validação funcional do Dashboard
- Validação funcional do QR Code
- Validação funcional do Check-in
- Testes Feature
- Melhorias de interface
- Otimização do Dashboard

---

# 8. Padrão obrigatório para novos CRUD

Cada entidade deve possuir:

- Model
- Controller
- Resource
- StoreRequest
- UpdateRequest
- Rotas
- Testes Postman
- Documentação

---

# 9. Testes

Todos os endpoints devem ser testados no Postman.

Checklist:

- GET lista
- GET por ID
- POST
- PUT
- PATCH toggle ativo
- validação 422
- autorização 403

Antes de cada integração executar:

```bash
php artisan optimize:clear
composer dump-autoload
npm run build
php artisan test
php artisan route:list
```

---

# 10. Seeders

Existem:

- RoleSeeder
- PeriodoSeeder
- EstadoReservaSeeder
- UserSeeder
- SpaceHubEstruturaSeeder

O projeto deve funcionar após:

```bash
php artisan migrate:fresh --seed
```

---

# 11. Documentação

Sempre atualizar:

- docs/04-Arquitetura.md
- docs/05-API.md
- docs/06-Roadmap.md

antes do commit.

---

# 12. Git

Fluxo utilizado:

Cada funcionalidade é desenvolvida numa branch.

Depois:

commit

↓

push

↓

Pull Request

↓

Create a merge commit

↓

main

Não apagar branches antes da validação.

Evitar **Squash and merge** quando for necessário preservar a autoria dos colaboradores.

---

# 13. Regras de Continuidade

Ao continuar este projeto numa nova conversa:

- Não alterar a arquitetura existente.
- Não renomear ficheiros, classes, métodos ou rotas sem autorização.
- Não fazer refactors automáticos.
- Manter compatibilidade com todo o código existente.
- Antes de propor alterações estruturais, explicar o impacto.
- Quando houver dúvida, perguntar.
- Manter o padrão Controllers → Form Requests → Models → Resources → JSON.
- Utilizar sempre Route Model Binding.
- Utilizar sempre Form Requests.
- Utilizar sempre Resources.
- Não implementar funcionalidades que contrariem decisões já tomadas.

---

# 14. Estado Atual do Projeto

## Sprint 1

✅ Concluída

## Sprint 2

✅ Concluída

## Sprint 3

✅ Concluída

## Sprint 4

✅ Concluída

## Sprint 5

✅ Concluída

Inclui:

- CRUD Gestão de Espaços

## Sprint 6

✅ Concluída

Inclui:

- CRUD Reservas
- Disponibilidade
- Cancelamento
- Testes Postman

## Sprint 7

✅ Integrada

Inclui:

- Dashboard
- Estatísticas
- QR Code
- Check-in
- Mapa Interativo

## Próximas tarefas

- Validação funcional do QR Code
- Validação funcional do Check-in
- Testes Feature
- Melhorias de interface