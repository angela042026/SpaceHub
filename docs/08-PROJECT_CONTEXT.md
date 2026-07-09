📘 Documento Mestre do Projeto – SpaceHub

Versão: 1.0
Estado: Em desenvolvimento
Framework: Laravel 12 + Sanctum + Bootstrap (frontend previsto)

1. Objetivo do Projeto

O SpaceHub é uma aplicação web para gestão de espaços de trabalho e reservas de secretárias.

O sistema permitirá:

gerir edifícios;
gerir pisos;
gerir setores;
gerir secretárias;
gerir reservas;
gerir utilizadores;
controlar acessos por papéis (roles).
2. Arquitetura

O projeto segue uma arquitetura REST baseada em Laravel.

Backend

Laravel 12

Estrutura utilizada:

Controllers
↓
Form Requests
↓
Models (Eloquent)
↓
Resources
↓
JSON

Nunca colocar validação diretamente nos Controllers.

Autenticação

Laravel Sanctum.

Endpoints implementados:

Register
Login
Logout
Me
Forgot Password
Reset Password

Todos os endpoints privados utilizam:

auth:sanctum
Autorização

Existe um middleware personalizado:

RoleMiddleware

Registado em:

bootstrap/app.php

Alias:

role

Utilização:

Route::middleware([
    'auth:sanctum',
    'role:Administrador'
]);
3. Base de Dados

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

Existe Diagrama ER.

Existe Dicionário de Dados.

4. Relações Eloquent

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

5. Convenções adotadas
Controllers

Todos os novos CRUD utilizam:

Api/

Exemplo:

App\Http\Controllers\Api
Form Requests

Toda a validação deve estar em:

StoreXXXXXRequest
UpdateXXXXXRequest

Nunca usar:

$request->validate(...)

dentro do controller.

Resources

Todos os endpoints devolvem:

XXXXXResource

ou

XXXXXResource::collection(...)

Nunca devolver diretamente o Model.

Route Model Binding

Utilizar sempre:

public function show(User $user)

em vez de:

User::find($id)
Passwords

Sempre:

Hash::make(...)

Nunca guardar passwords em texto simples.

Roles

Os Roles são fixos.

Existem:

Administrador
Gestor
Colaborador
Utilizador

Não existe CRUD de Roles.

O sistema de Roles já está considerado concluído.

Utilizadores

Nunca eliminar utilizadores.

Utilizar:

ativo

para ativar/desativar.

Não implementar destroy().

6. Funcionalidades Implementadas
Sprint 1

✔ Base de Dados

Migrations
Models
Relações
Seeders
Documentação
Sprint 2

✔ Autenticação

Register
Login
Logout
Me

Laravel Sanctum.

Sprint 3

✔ Recuperação de Password

Forgot Password
Reset Password

Configuração:

MAIL_MAILER=log

Emails escritos em:

storage/logs/laravel.log
Sprint 4

✔ Gestão de Utilizadores

Implementado:

UserController
UserResource
StoreUserRequest
UpdateUserRequest
RoleMiddleware

CRUD:

index
show
store
update
toggleAtivo

Sem destroy.

Existe UserSeeder.

7. Funcionalidades Pendentes

Sprint seguinte:

Gestão de Espaços
CRUD Edifícios
CRUD Pisos
CRUD Setores
CRUD Secretárias

Seguir exatamente o padrão usado em User.

Depois:

Reservas.

Depois:

Dashboard.

Depois:

Mapa Interativo.

8. Padrão obrigatório para novos CRUD

Cada entidade deve possuir:

Model

Controller

Resource

StoreRequest

UpdateRequest

Rotas

Testes Postman

Documentação
9. Testes

Todos os endpoints devem ser testados no Postman.

Checklist:

GET lista
GET por ID
POST
PUT
PATCH toggle ativo
validação 422
autorização 403
10. Seeders

Existem:

RoleSeeder
PeriodoSeeder
EstadoReservaSeeder
UserSeeder

O projeto deve funcionar após:

php artisan migrate:fresh --seed
11. Documentação

Sempre atualizar:

docs/04-Arquitetura.md

docs/05-API.md

docs/06-Roadmap.md

antes do commit.

12. Git

Fluxo utilizado:

Cada funcionalidade é desenvolvida numa branch.

Depois:

commit

push

merge

na main.

Não apagar branches antes de validação.

13. Regras de Continuidade (Muito Importante)

Ao continuar este projeto numa nova conversa, seguir obrigatoriamente estas regras:

Não alterar a arquitetura existente.
Não renomear ficheiros, classes, métodos ou rotas sem autorização.
Não fazer refactors automáticos.
Manter compatibilidade com todo o código existente.
Antes de propor alterações estruturais, explicar o impacto e esperar aprovação.
Quando houver dúvida, perguntar em vez de assumir.
Manter o padrão já definido (Controllers → Form Requests → Models → Resources → JSON).
Usar sempre Route Model Binding, Form Requests e Resources nos novos CRUDs.
Não implementar funcionalidades que contrariem decisões já tomadas (por exemplo, apagar utilizadores em vez de desativá-los).
14. Estado Atual do Projeto

O projeto encontra-se numa fase sólida, com autenticação, autorização e gestão de utilizadores concluídas.

O próximo objetivo é refatorar e concluir os CRUDs de Gestão de Espaços (Edifícios, Pisos, Setores e Secretárias) para que sigam exatamente o mesmo padrão arquitetural adotado no módulo de Utilizadores