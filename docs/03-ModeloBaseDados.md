# 3. Modelo da Base de Dados

## 3.1 Introdução

O modelo da base de dados do SpaceHub foi desenvolvido segundo o modelo relacional, garantindo a integridade da informação, a normalização dos dados e a consistência entre as diferentes entidades da aplicação.

A estrutura permite gerir edifícios, pisos, setores, secretárias, utilizadores e respetivas reservas, mantendo uma organização hierárquica dos espaços e assegurando que todas as operações respeitam as regras de negócio definidas.

A implementação foi realizada utilizando o ORM **Eloquent** do Laravel, recorrendo a chaves primárias, chaves estrangeiras, restrições de integridade e relações entre modelos.

---

# 3.2 Entidades Principais

O sistema é composto pelas seguintes entidades.

| Entidade | Finalidade |
|----------|------------|
| Users | Utilizadores da aplicação |
| Roles | Papéis dos utilizadores |
| Edificios | Edifícios existentes |
| Pisos | Pisos pertencentes a um edifício |
| Setores | Divisão funcional dos pisos |
| Secretarias | Postos de trabalho reserváveis |
| Periodos | Períodos disponíveis para reserva |
| EstadoReservas | Estados possíveis de uma reserva |
| Reservas | Reservas efetuadas pelos utilizadores |
| PedidoSuportes | Pedidos de apoio ou manutenção |
| FAQs | Perguntas frequentes apresentadas aos utilizadores |

---

# 3.3 Organização Hierárquica

Os espaços físicos encontram-se organizados hierarquicamente.

```text
Edifício
    │
    └── Piso
            │
            └── Setor
                    │
                    └── Secretária
```

Esta estrutura permite representar edifícios com vários pisos, pisos com vários setores e setores com múltiplas secretárias.

---

# 3.4 Relações entre Entidades

As principais relações existentes na base de dados são apresentadas na tabela seguinte.

| Relação | Cardinalidade |
|----------|---------------|
| Role → Users | 1 : N |
| Edifício → Pisos | 1 : N |
| Piso → Setores | 1 : N |
| Setor → Secretárias | 1 : N |
| User → Reservas | 1 : N |
| Secretária → Reservas | 1 : N |
| Período → Reservas | 1 : N |
| EstadoReserva → Reservas | 1 : N |

Todas estas relações são implementadas através de chaves estrangeiras e relações Eloquent (`belongsTo`, `hasMany`).

---

# 3.5 Estrutura das Reservas

A entidade **Reserva** constitui o elemento central da aplicação.

Cada reserva associa:

- um utilizador;
- uma secretária;
- um período;
- um estado;
- uma data.

Adicionalmente, são armazenadas informações relativas ao ciclo de vida da reserva, como:

- data de cancelamento;
- data de check-in;
- observações.

---

# 3.6 Estados da Reserva

Cada reserva encontra-se num dos seguintes estados:

| Código | Significado |
|---------|-------------|
| pendente | Reserva criada e ainda sem check-in |
| confirmada | Check-in efetuado com sucesso |
| cancelada | Reserva cancelada |
| expirada | Reserva que perdeu validade |

Os estados são armazenados na tabela **estado_reservas**, permitindo uma gestão centralizada do ciclo de vida das reservas.

---

# 3.7 Integridade Referencial

A base de dados utiliza chaves estrangeiras para garantir a consistência da informação.

Exemplos:

- um piso pertence obrigatoriamente a um edifício;
- um setor pertence obrigatoriamente a um piso;
- uma secretária pertence obrigatoriamente a um setor;
- uma reserva referencia obrigatoriamente um utilizador, uma secretária, um período e um estado.

Sempre que adequado, são utilizadas restrições de integridade e índices únicos para impedir duplicação de dados.

---

# 3.8 Decisões de Modelação

Durante o desenvolvimento foram tomadas algumas decisões importantes.

## Edifícios

Inicialmente estava prevista a entidade **Localidade**.

Após análise funcional verificou-se que a entidade **Edifício** representava melhor a realidade da aplicação, tendo sido adotada como entidade principal da organização física dos espaços.

---

## Ativação Lógica

As principais entidades possuem o atributo **ativo**.

Em vez da eliminação física dos registos, optou-se pela desativação lógica, permitindo:

- preservar o histórico;
- evitar perda de informação;
- manter a integridade das reservas.

---

## Upload de Ficheiros

O modelo suporta armazenamento de ficheiros.

Foram adicionados os seguintes atributos:

| Entidade | Campo |
|----------|-------|
| Users | fotografia |
| Pisos | planta |

Os ficheiros são armazenados utilizando o sistema de armazenamento público do Laravel.

---

## QR Code

Cada secretária possui um identificador único utilizado para geração do respetivo QR Code.

Este identificador é utilizado durante o processo de check-in para validar a reserva efetuada pelo utilizador.

---

# 3.9 Regras de Integridade

A estrutura da base de dados foi concebida para garantir o cumprimento das principais regras de negócio.

Entre elas destacam-se:

- uma secretária apenas pode possuir uma reserva ativa para a mesma data e período;
- um utilizador apenas pode possuir uma reserva por período e por dia;
- apenas secretárias ativas e reserváveis podem receber reservas;
- apenas reservas válidas podem efetuar check-in;
- utilizadores inativos não podem executar operações protegidas.

Estas regras são reforçadas pela lógica implementada nos Controllers, Policies e Form Requests.

---

# 3.10 Diagrama Entidade-Relacionamento

O modelo relacional completo encontra-se representado no diagrama Entidade-Relacionamento apresentado em anexo.

O diagrama evidencia todas as entidades da aplicação, respetivas relações e cardinalidades, constituindo uma representação gráfica da estrutura persistente do sistema.

---

# 3.11 Considerações Finais

O modelo da base de dados foi desenvolvido de forma modular e normalizada, permitindo uma evolução futura da aplicação sem alterações significativas à estrutura existente.

A utilização do Eloquent ORM, associada às migrations e seeders do Laravel, facilita a manutenção da base de dados, a consistência dos dados e a evolução do sistema ao longo do tempo.