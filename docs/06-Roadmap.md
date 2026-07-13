# Roadmap

## Documentação

- [x] Requisitos
- [x] Casos de Uso
- [x] Modelo de Dados
- [x] Diagrama ER
- [x] Dicionário de Dados
- [x] Arquitetura
- [x] API
- [x] Roadmap

---

## Base de Dados

- [x] Roles
- [x] Users
- [x] Edifícios
- [x] Pisos
- [x] Setores
- [x] Secretárias
- [x] Períodos
- [x] Estado das Reservas
- [x] Reservas

---

## Backend

- [x] Autenticação
- [x] Recuperação de Password
- [x] Gestão de Utilizadores
- [x] CRUD Edifícios
- [x] CRUD Pisos
- [x] CRUD Setores
- [x] CRUD Secretárias
- [x] CRUD Reservas

---

## API

- [x] Login
- [x] Registo
- [x] Logout
- [x] Recuperação de Password
- [x] Gestão de Utilizadores
- [x] Gestão de Espaços
- [x] Reservas
- [x] Disponibilidade
- [x] Cancelamento de Reservas

---

## Frontend

- [x] Login
- [x] Dashboard
- [x] Estatísticas
- [x] Mapa Interativo
- [x] QR Code
- [x] Check-in

---

## Sprint 1

- [x] Base de Dados

---

## Sprint 2

- [x] Autenticação

---

## Sprint 3

- [x] Recuperação de Password

---

## Sprint 4

- [x] Gestão de Utilizadores

---

## Sprint 5

- [x] Gestão de Espaços

---

## Sprint 6

- [x] CRUD Reservas
- [x] Disponibilidade
- [x] Cancelamento
- [x] Testes Postman

---

## Sprint 7

- [x] Dashboard
- [x] Estatísticas
- [x] QR Code
- [x] Check-in
- [x] Mapa Interativo

---

## Próximas Melhorias

- [ ] Testes funcionais do Check-in
- [ ] Validação completa do QR Code
- [ ] Melhorias de interface
- [ ] Otimização do Dashboard
- [ ] Deploy

# Sprint 8 (Em Integração)

## Chat em Tempo Real

Integração da branch:

feature/update-eduardo

Funcionalidades adicionadas:

- Sistema de Chat em Tempo Real;
- Laravel Reverb;
- Laravel Echo;
- Broadcasting;
- Evento EnviarMensagem;
- ChatController;
- Página React TesteChat;
- Configuração de WebSockets;
- Rotas de teste do Chat.

Tecnologias:

- Laravel Reverb
- Laravel Echo
- Pusher JS
- Broadcasting
- React

Validação técnica:

- php artisan optimize:clear
- composer dump-autoload
- npm install
- npm run build
- php artisan test
- php artisan route:list

Resultado:

- Build concluído com sucesso;
- 25 testes executados com sucesso;
- 61 assertions;
- Rotas do Chat registadas;
- Integração preparada para Pull Request.

Estado:

Em validação funcional.