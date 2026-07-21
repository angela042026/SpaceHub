# 4. Arquitetura da Aplicação

# 4.1 Introdução

O SpaceHub foi desenvolvido segundo uma arquitetura em camadas baseada no padrão **Model-View-Controller (MVC)**, utilizando o framework Laravel para o backend e React com Inertia.js para o frontend.

Esta arquitetura promove uma clara separação de responsabilidades, facilitando a manutenção, reutilização de código e evolução futura da aplicação.

A comunicação entre frontend e backend é efetuada através de uma API REST protegida por autenticação baseada em tokens utilizando Laravel Sanctum.

---

# 4.2 Arquitetura Geral

A arquitetura do sistema encontra-se dividida em dois componentes principais.

```
                +-----------------------------+
                |         React + Inertia     |
                |        Interface Web        |
                +-------------+---------------+
                              |
                              |
                    HTTP / JSON / API
                              |
                              ▼
                +-----------------------------+
                |          Laravel 12         |
                |        Backend API          |
                +-------------+---------------+
                              |
               +--------------+--------------+
               |              |              |
               ▼              ▼              ▼
        Controllers      Services      Policies
               |
               ▼
        Form Requests
               |
               ▼
            Models
               |
               ▼
          Base de Dados
```

---

# 4.3 Organização do Backend

O backend encontra-se organizado segundo a estrutura recomendada pelo Laravel.

## Models

Representam as entidades persistidas na base de dados.

Exemplos:

- User
- Role
- Edificio
- Piso
- Setor
- Secretaria
- Reserva

Os Models implementam relações Eloquent como:

- belongsTo()
- hasMany()
- hasOne()

---

## Controllers

Os Controllers recebem os pedidos HTTP, validam permissões, coordenam a lógica da aplicação e devolvem respostas à API.

Cada entidade principal possui um Controller próprio.

Exemplos:

- UserController
- EdificioController
- PisoController
- SetorController
- SecretariaController
- ReservaController
- DashboardController
- AuthController

---

## Form Requests

A validação da entrada de dados é realizada através de Form Requests.

Cada operação possui regras específicas de validação.

Exemplos:

- StoreUserRequest
- UpdateUserRequest
- StoreReservaRequest
- UpdateReservaRequest

Esta abordagem permite separar a validação da lógica de negócio.

---

## Resources

As respostas da API utilizam Resources para serializar os dados devolvidos ao frontend.

Exemplos:

- UserResource
- ReservaResource
- PisoResource
- SecretariaResource

Os Resources garantem consistência nas respostas da API e ocultam informação desnecessária.

---

## Policies

O controlo de permissões é realizado através de Policies.

Cada entidade possui uma política própria.

Exemplos:

- UserPolicy
- ReservaPolicy
- SecretariaPolicy

Os Controllers recorrem ao método:

```php
Gate::authorize(...)
```

garantindo que apenas utilizadores autorizados executam determinadas operações.

---

# 4.4 Persistência dos Dados

A persistência é assegurada através do ORM Eloquent.

Cada Model representa uma tabela da base de dados.

As relações são carregadas utilizando:

- eager loading;
- lazy loading quando necessário.

A utilização do Eloquent simplifica:

- consultas;
- inserções;
- atualizações;
- gestão das relações.

---

# 4.5 Gestão de Ficheiros

O sistema suporta armazenamento de ficheiros.

Atualmente são suportados:

| Entidade | Ficheiro |
|----------|----------|
| User | Fotografia |
| Piso | Planta |

Os ficheiros são armazenados em:

```
storage/app/public
```

e disponibilizados através do link simbólico:

```
public/storage
```

utilizando o sistema Storage do Laravel.

---

# 4.6 Autenticação

A autenticação é implementada através de Laravel Sanctum.

Após autenticação é gerado um token associado ao utilizador autenticado.

As principais funcionalidades disponíveis incluem:

- login;
- logout;
- recuperação de password;
- alteração de password;
- consulta do utilizador autenticado.

Os utilizadores inativos não podem iniciar sessão.

---

# 4.7 Autorização

O acesso às funcionalidades encontra-se protegido por Policies.

Os diferentes papéis possuem permissões distintas.

| Papel | Permissões |
|--------|------------|
| Administrador | Gestão completa |
| Gestor | Gestão operacional |
| Colaborador | Consulta |
| Utilizador | Reservas e perfil |

---

# 4.8 Atualização em Tempo Real

Sempre que ocorre uma alteração relevante nas reservas, o sistema emite o evento:

```
MapaAtualizado
```

Este evento permite atualizar automaticamente o estado de ocupação apresentado no mapa sem necessidade de recarregar a página.

---

# 4.9 Estrutura do Projeto

A organização principal do projeto segue a seguinte estrutura.

```
app
 ├── Events
 ├── Http
 │     ├── Controllers
 │     ├── Middleware
 │     ├── Requests
 │     └── Resources
 ├── Models
 ├── Policies
 └── Providers

database
 ├── factories
 ├── migrations
 └── seeders

resources
 ├── js
 └── views

routes

tests
```

---

# 4.10 Testes

O projeto possui uma suíte de testes automatizados desenvolvida com PHPUnit.

Os testes cobrem, entre outras áreas:

- autenticação;
- autorização;
- uploads;
- reservas;
- dashboard;
- mapa;
- QR Code;
- gestão das entidades;
- validação das regras de negócio.

À data da conclusão do projeto, a suíte é composta por **111 testes automatizados**.

---

# 4.11 Princípios de Desenvolvimento

Durante o desenvolvimento foram seguidos vários princípios de boas práticas.

Entre eles destacam-se:

- separação de responsabilidades;
- reutilização de código;
- utilização de Form Requests;
- utilização de Resources;
- utilização de Policies;
- utilização de Eloquent ORM;
- utilização de eventos para comunicação interna;
- testes automatizados;
- tipagem explícita sempre que possível.

---

# 4.12 Considerações Finais

A arquitetura adotada permite que o SpaceHub seja facilmente extensível e mantenha uma organização consistente entre os diferentes componentes da aplicação.

A utilização do ecossistema Laravel, em conjunto com React e Inertia.js, possibilita uma solução moderna, modular e preparada para evolução futura, mantendo simultaneamente elevados níveis de segurança, desempenho e manutenibilidade.