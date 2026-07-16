# 2. Casos de Uso

## Introdução

Os casos de uso descrevem as principais funcionalidades disponibilizadas pelo SpaceHub e a forma como os diferentes atores interagem com o sistema.

Cada caso de uso apresenta o objetivo da funcionalidade, os intervenientes, as pré-condições, o fluxo principal, os fluxos alternativos e as pós-condições.

---

# UC01 — Registo de Utilizador

## Objetivo

Permitir o registo de novos utilizadores na aplicação.

## Atores

- Utilizador

## Pré-condições

- O utilizador não possui conta.

## Fluxo Principal

1. O utilizador acede ao formulário de registo.
2. Introduz nome, email e password.
3. O sistema valida os dados.
4. O sistema cria o utilizador.
5. É atribuído automaticamente o papel **Utilizador**.
6. O utilizador fica autenticado.

## Fluxos Alternativos

### A1

O email já existe.

O sistema apresenta uma mensagem de erro.

### A2

Os dados introduzidos são inválidos.

O sistema apresenta os respetivos erros de validação.

## Pós-condições

O utilizador fica registado na aplicação.

---

# UC02 — Autenticação

## Objetivo

Permitir a autenticação dos utilizadores.

## Atores

- Administrador
- Gestor
- Colaborador
- Utilizador

## Pré-condições

- O utilizador encontra-se registado.
- A conta está ativa.

## Fluxo Principal

1. O utilizador introduz email e password.
2. O sistema valida as credenciais.
3. É criado um token de autenticação.
4. O utilizador inicia sessão.

## Fluxos Alternativos

### A1

Credenciais inválidas.

### A2

Conta desativada.

## Pós-condições

O utilizador fica autenticado.

---

# UC03 — Gestão de Utilizadores

## Objetivo

Permitir ao Administrador gerir os utilizadores da aplicação.

## Atores

- Administrador

## Pré-condições

- O Administrador encontra-se autenticado.

## Fluxo Principal

1. Consultar utilizadores.
2. Pesquisar utilizadores.
3. Filtrar resultados.
4. Criar utilizadores.
5. Editar utilizadores.
6. Alterar papel.
7. Ativar ou desativar utilizadores.
8. Carregar fotografia de perfil.

## Fluxos Alternativos

### A1

Email já existente.

### A2

Fotografia inválida.

## Pós-condições

O utilizador fica atualizado.

---

# UC04 — Gestão de Edifícios

## Objetivo

Permitir a gestão dos edifícios existentes.

## Atores

- Administrador

## Fluxo Principal

1. Criar edifício.
2. Editar edifício.
3. Consultar edifícios.
4. Pesquisar.
5. Ordenar.
6. Ativar ou desativar.

## Pós-condições

A informação fica atualizada.

---

# UC05 — Gestão de Pisos

## Objetivo

Permitir gerir os pisos pertencentes a um edifício.

## Atores

- Administrador
- Gestor

## Fluxo Principal

1. Criar piso.
2. Editar piso.
3. Carregar planta.
4. Consultar pisos.
5. Pesquisar.
6. Ativar ou desativar.

## Fluxos Alternativos

### A1

Código duplicado no mesmo edifício.

### A2

Planta inválida.

## Pós-condições

O piso fica atualizado.

---

# UC06 — Gestão de Setores

## Objetivo

Permitir gerir os setores de um piso.

## Atores

- Administrador
- Gestor

## Fluxo Principal

1. Criar setor.
2. Editar setor.
3. Posicionar o setor na planta.
4. Consultar setores.
5. Ativar ou desativar.

## Pós-condições

O setor fica atualizado.

---

# UC07 — Gestão de Secretárias

## Objetivo

Permitir gerir as secretárias disponíveis.

## Atores

- Administrador
- Gestor

## Fluxo Principal

1. Criar secretária.
2. Editar secretária.
3. Configurar características.
4. Gerar QR Code.
5. Ativar ou desativar.

## Fluxos Alternativos

### A1

Código duplicado.

## Pós-condições

A secretária fica disponível para reserva.

---

# UC08 — Criar Reserva

## Objetivo

Permitir reservar uma secretária.

## Atores

- Utilizador

## Pré-condições

- Utilizador autenticado.
- Conta ativa.

## Fluxo Principal

1. Selecionar data.
2. Selecionar período.
3. Consultar disponibilidade.
4. Escolher secretária.
5. Validar regras de negócio.
6. Criar reserva.
7. Atualizar o mapa em tempo real.

## Fluxos Alternativos

### A1

Secretária já reservada.

### A2

Utilizador já possui reserva.

### A3

Secretária não reservável.

## Pós-condições

A reserva fica registada no estado **Pendente**.

---

# UC09 — Consultar Reservas

## Objetivo

Permitir consultar reservas.

## Atores

- Administrador
- Gestor
- Colaborador
- Utilizador

## Fluxo Principal

1. Consultar reservas.
2. Aplicar filtros.
3. Ordenar resultados.
4. Visualizar detalhes.

## Fluxos Alternativos

O utilizador comum apenas consulta as suas reservas.

## Pós-condições

As reservas são apresentadas ao utilizador.

---

# UC10 — Cancelar Reserva

## Objetivo

Permitir cancelar reservas elegíveis.

## Atores

- Administrador
- Utilizador

## Pré-condições

- Reserva existente.
- Reserva pendente.
- Reserva elegível para cancelamento.

## Fluxo Principal

1. Selecionar reserva.
2. Confirmar cancelamento.
3. Atualizar estado.
4. Atualizar mapa.

## Fluxos Alternativos

### A1

Reserva confirmada.

### A2

Reserva expirada.

### A3

Reserva já cancelada.

### A4

Reserva com check-in.

## Pós-condições

A reserva passa ao estado **Cancelada**.

---

# UC11 — Check-in por QR Code

## Objetivo

Permitir confirmar a presença através do QR Code.

## Atores

- Utilizador

## Pré-condições

- Reserva existente.
- Reserva válida.
- QR Code correspondente.

## Fluxo Principal

1. Ler QR Code.
2. Validar reserva.
3. Validar data.
4. Validar período.
5. Confirmar check-in.
6. Atualizar estado da reserva.

## Fluxos Alternativos

### A1

QR Code inválido.

### A2

Reserva inexistente.

### A3

Reserva não pertence ao utilizador.

## Pós-condições

A reserva fica confirmada.

---

# UC12 — Dashboard

## Objetivo

Disponibilizar indicadores estatísticos sobre a utilização dos espaços.

## Atores

- Administrador
- Gestor

## Fluxo Principal

1. Consultar dashboard.
2. Selecionar período.
3. Visualizar indicadores.
4. Consultar gráficos e estatísticas.

## Informação apresentada

- Reservas totais.
- Taxa de ocupação.
- Reservas por período.
- Reservas por edifício.
- Reservas por estado.

## Pós-condições

Os indicadores estatísticos são apresentados ao utilizador.

