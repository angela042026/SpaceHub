# Modelo de Base de Dados

## Entidades

✔ Roles

✔ Users

✔ Edificios

✔ Pisos

⬜ Setores

⬜ Secretarias

⬜ Reservas

⬜ Periodos

⬜ EstadosReserva

⬜ CheckIns

⬜ Auditoria
Roles
   │
Users
   │
Reservas
   │
Secretarias
   │
Setores
   │
Pisos
   │
Edificios
# Modelo de Base de Dados

## Entidades

### Roles
Define os perfis de acesso da aplicação.

Campos principais:
- id
- nome
- descricao

Relacionamentos:
- Um Role possui vários Utilizadores.

---

### Users
Representa os utilizadores da aplicação.

Campos principais:
- id
- role_id
- name
- email
- password

Relacionamentos:
- Um Utilizador pertence a um Role.
- Um Utilizador pode ter várias Reservas.

---

### Edificios
Representa cada edifício gerido pelo SpaceHub.

Relacionamentos:
- Um Edifício possui vários Pisos.

---

### Pisos
Representa os pisos de cada edifício.

Relacionamentos:
- Um Piso pertence a um Edifício.
- Um Piso possui vários Setores.

---

### Setores
Representa uma zona física de um piso.

Exemplos:
- Open Space
- Sala de Reunião
- Lounge
- Receção
- Cafetaria

Relacionamentos:
- Um Setor pertence a um Piso.
- Um Setor possui várias Secretárias.

---

### Secretarias
Representa cada posto de trabalho.

Campos relevantes:
- código
- coordenadas na planta
- monitor
- dock USB
- junto à janela
- cadeira ergonómica

Relacionamentos:
- Uma Secretária pertence a um Setor.
- Uma Secretária pode ter várias Reservas.

---

### Periodos

Define os períodos de reserva.

Atualmente:
- Manhã
- Tarde

---

### EstadoReservas

Estados possíveis:

- Pendente
- Confirmada
- Cancelada
- Expirada
- Concluída

---

### Reservas

Representa a reserva de uma secretária.

Relacionamentos:
- pertence a um Utilizador
- pertence a uma Secretária
- pertence a um Período
- pertence a um Estado