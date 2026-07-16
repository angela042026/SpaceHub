<div align="center">

# 🏢 SpaceHub

### Sistema de Gestão e Reserva de Espaços Colaborativos

Aplicação desenvolvida em **Laravel 12**, **React** e **Inertia.js** para gestão de edifícios, espaços colaborativos e reservas de secretárias.

![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8-blue?logo=php)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Inertia.js](https://img.shields.io/badge/Inertia.js-SPA-purple)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql)
![Sanctum](https://img.shields.io/badge/Auth-Sanctum-success)
![PHPUnit](https://img.shields.io/badge/Tests-111%20Passed-brightgreen)

</div>

---

# 📖 Sobre o Projeto

O **SpaceHub** é uma aplicação web destinada à gestão de espaços colaborativos e à reserva de secretárias.

O sistema permite organizar edifícios, pisos, setores e secretárias, possibilitando aos utilizadores reservar postos de trabalho de forma simples e segura.

Além da gestão dos espaços, a aplicação disponibiliza mecanismos de autenticação, autorização, dashboards estatísticos, check-in através de QR Code e atualização em tempo real do mapa de ocupação.

---

# ✨ Funcionalidades

## Gestão

- Gestão de utilizadores
- Gestão de papéis
- Gestão de edifícios
- Gestão de pisos
- Gestão de setores
- Gestão de secretárias

## Reservas

- Reserva de secretárias
- Consulta de disponibilidade
- Cancelamento de reservas
- Estados das reservas
- Validação de conflitos

## Check-in

- QR Code
- Validação da reserva
- Confirmação automática

## Dashboard

- Estatísticas
- Taxa de ocupação
- Reservas por período
- Reservas por estado
- Reservas por edifício

## Administração

- Pesquisa
- Filtros
- Ordenação
- Paginação
- Upload de fotografias
- Upload das plantas dos pisos

## Suporte

- FAQs
- Help Center
- Pedidos de Suporte

---

# 🏗 Arquitetura

O projeto segue o padrão **MVC** disponibilizado pelo Laravel.

```text
React
      │
      ▼
Inertia.js
      │
      ▼
Controllers
      │
      ▼
Form Requests
      │
      ▼
Policies
      │
      ▼
Models (Eloquent)
      │
      ▼
MySQL
```

A API utiliza:

- Laravel Sanctum
- API Resources
- Policies
- Form Requests
- Route Model Binding

---

# 🛠 Tecnologias

| Tecnologia | Utilização |
|------------|------------|
| Laravel 12 | Backend |
| PHP 8 | Linguagem |
| React | Frontend |
| Inertia.js | SPA |
| Tailwind CSS | Interface |
| MySQL | Base de Dados |
| Laravel Sanctum | Autenticação |
| Laravel Reverb | WebSockets |
| Laravel Echo | Broadcast |
| PHPUnit | Testes |
| Vite | Build Frontend |

---

# 📂 Estrutura do Projeto

```text
app/
database/
docs/
public/
resources/
routes/
storage/
tests/
```

---

# 🚀 Instalação

## Clonar o projeto

```bash
git clone https://github.com/angela042026/SpaceHub.git

cd SpaceHub
```

---

## Instalar dependências PHP

```bash
composer install
```

---

## Instalar dependências JavaScript

```bash
npm install
```

---

## Configurar ambiente

Copiar:

```text
.env.example
```

para:

```text
.env
```

Gerar a chave da aplicação:

```bash
php artisan key:generate
```

---

## Configurar a Base de Dados

Editar o ficheiro `.env` e configurar:

```text
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

Executar:

```bash
php artisan migrate --seed
```

---

## Storage

Criar o link simbólico:

```bash
php artisan storage:link
```

---

## Compilar Frontend

```bash
npm run build
```

Durante o desenvolvimento:

```bash
npm run dev
```

---

## Executar

```bash
php artisan serve
```

A aplicação ficará disponível em:

```text
http://127.0.0.1:8000
```

---

# 🧪 Testes

Executar todos os testes:

```bash
php artisan test
```

Estado atual:

✅ **111 testes automatizados aprovados**

Os testes cobrem:

- autenticação;
- autorização;
- uploads;
- reservas;
- dashboard;
- QR Code;
- check-in;
- mapa;
- pesquisas;
- filtros;
- paginação.

---

# 📚 Documentação

Toda a documentação técnica encontra-se na pasta `docs`.

| Documento | Descrição |
|-----------|-----------|
| 01-Requisitos | Requisitos funcionais, não funcionais e regras de negócio |
| 02-CasosDeUso | Casos de uso do sistema |
| 03-ModeloBaseDados | Modelo relacional da base de dados |
| 04-Arquitetura | Arquitetura técnica da aplicação |
| 05-API | Documentação da API REST |
| 06-Roadmap | Evolução do projeto e trabalho futuro |
| 07-DicionarioDados | Dicionário de dados |
| 08-PROJECT_CONTEXT | Documento mestre do projeto |

---

# 👥 Equipa

Projeto desenvolvido por:

- Ângela
- Eduardo
- Joana
- Hanna

Formadores:

- Sara
- Rui

---

# 📄 Licença

Este projeto foi desenvolvido no âmbito académico e destina-se a fins educativos.

---

<div align="center">

**SpaceHub**

Sistema de Gestão e Reserva de Espaços Colaborativos

Laravel • React • Inertia • MySQL

</div>