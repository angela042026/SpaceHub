# 3. Modelo da Base de Dados

## 3.1 Introdução

O modelo da base de dados do SpaceHub foi desenvolvido segundo o modelo relacional, garantindo a integridade da informação, a normalização dos dados e a consistência entre as diferentes entidades da aplicação.

A estrutura permite gerir edifícios, pisos, setores, secretárias, utilizadores, reservas, pagamentos e módulos de suporte, mantendo uma organização hierárquica dos espaços e assegurando que todas as operações respeitam as regras de negócio definidas.

A implementação foi realizada utilizando o ORM **Eloquent** do Laravel, recorrendo a chaves primárias, chaves estrangeiras, restrições de integridade, índices e relações entre modelos.

---

# 3.2 Entidades Principais

O sistema é composto pelas seguintes entidades.

| Entidade       | Finalidade                                         |
| -------------- | -------------------------------------------------- |
| Users          | Utilizadores da aplicação                          |
| Roles          | Papéis dos utilizadores                            |
| Edificios      | Edifícios existentes                               |
| Pisos          | Pisos pertencentes a um edifício                   |
| Setores        | Divisão funcional dos pisos                        |
| Secretarias    | Postos de trabalho reserváveis                     |
| Periodos       | Períodos disponíveis para reserva                  |
| EstadoReservas | Estados possíveis de uma reserva                   |
| Reservas       | Reservas efetuadas pelos utilizadores              |
| Pagamentos     | Pagamentos associados às reservas                  |
| PedidoSuportes | Pedidos de apoio ou suporte                        |
| FAQs           | Perguntas frequentes apresentadas aos utilizadores |

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

A organização hierárquica facilita a gestão dos espaços, a aplicação de filtros e a apresentação dos postos de trabalho no mapa interativo.

---

# 3.4 Relações entre Entidades

As principais relações existentes na base de dados são apresentadas na tabela seguinte.

| Relação                  | Cardinalidade |
| ------------------------ | ------------- |
| Role → Users             | 1 : N         |
| Edifício → Pisos         | 1 : N         |
| Piso → Setores           | 1 : N         |
| Setor → Secretárias      | 1 : N         |
| User → Reservas          | 1 : N         |
| Secretária → Reservas    | 1 : N         |
| Período → Reservas       | 1 : N         |
| EstadoReserva → Reservas | 1 : N         |
| Reserva → Pagamento      | 1 : 0..1      |
| User → PedidoSuportes    | 1 : N         |

Estas relações são implementadas através de chaves estrangeiras e relações Eloquent, nomeadamente:

* `belongsTo`;
* `hasMany`;
* `hasOne`.

A relação entre reservas e pagamentos é opcional, uma vez que uma reserva pode existir antes de possuir um pagamento associado.

---

# 3.5 Estrutura das Reservas

A entidade **Reserva** constitui um dos elementos centrais da aplicação.

Cada reserva associa:

* um utilizador;
* uma secretária;
* um período;
* um estado;
* uma data.

Adicionalmente, são armazenadas informações relativas ao ciclo de vida da reserva, como:

* data de cancelamento;
* data de check-in;
* observações;
* data de criação;
* data de atualização.

A entidade permite acompanhar a reserva desde a sua criação até ao cancelamento, confirmação por check-in ou expiração automática.

---

# 3.6 Estados da Reserva

Cada reserva encontra-se num dos seguintes estados:

| Código     | Significado                         |
| ---------- | ----------------------------------- |
| pendente   | Reserva criada e ainda sem check-in |
| confirmada | Check-in efetuado com sucesso       |
| cancelada  | Reserva cancelada                   |
| expirada   | Reserva que perdeu validade         |

Os estados são armazenados na tabela **estado_reservas**, permitindo uma gestão centralizada do ciclo de vida das reservas.

A utilização de uma tabela própria para os estados evita a repetição de valores e permite manter uma referência consistente em todas as reservas.

---

# 3.7 Pagamentos

Cada reserva pode possuir um pagamento associado.

A entidade **Pagamento** permite acompanhar o processo de pagamento da reserva, armazenando informação como:

* reserva associada;
* valor;
* método de pagamento;
* estado;
* referência;
* data de criação;
* data de atualização.

Os métodos de pagamento atualmente suportados incluem:

* Cartão;
* MB Way;
* Transferência Bancária.

Os estados possíveis incluem:

| Estado    | Significado                             |
| --------- | --------------------------------------- |
| pendente  | Pagamento criado e ainda não confirmado |
| pago      | Pagamento confirmado                    |
| cancelado | Pagamento cancelado                     |

Na versão atual da aplicação, o pagamento é simulado, não existindo movimentação financeira real.

A arquitetura foi preparada para permitir uma futura integração com plataformas externas de pagamento, sem necessidade de alterar significativamente a relação entre reservas e pagamentos.

A relação entre as entidades pode ser representada da seguinte forma:

```text
Reserva
   │
   └── Pagamento
```

Uma reserva pode não possuir pagamento, mas um pagamento pertence obrigatoriamente a uma reserva.

---

# 3.8 Pedidos de Suporte e FAQs

O Help Center utiliza duas entidades principais:

* `PedidoSuportes`;
* `FAQs`.

## Pedidos de Suporte

A entidade **PedidoSuporte** permite registar pedidos de ajuda submetidos pelos utilizadores.

Um pedido pode armazenar informação como:

* utilizador;
* assunto;
* descrição;
* estado;
* prioridade;
* data de criação;
* data de atualização.

Cada pedido pertence a um utilizador, enquanto um utilizador pode criar vários pedidos de suporte.

## FAQs

A entidade **FAQ** permite armazenar perguntas e respostas frequentes apresentadas aos utilizadores.

Uma FAQ pode incluir:

* pergunta;
* resposta;
* estado ativo;
* ordem de apresentação;
* data de criação;
* data de atualização.

As FAQs podem ser ativadas ou desativadas sem necessidade de eliminação física.

---

# 3.9 Integridade Referencial

A base de dados utiliza chaves estrangeiras para garantir a consistência da informação.

Exemplos:

* um piso pertence obrigatoriamente a um edifício;
* um setor pertence obrigatoriamente a um piso;
* uma secretária pertence obrigatoriamente a um setor;
* uma reserva referencia obrigatoriamente um utilizador, uma secretária, um período e um estado;
* um pagamento pertence obrigatoriamente a uma reserva;
* um pedido de suporte pertence a um utilizador.

Sempre que adequado, são utilizadas restrições de integridade e índices únicos para impedir duplicação de dados.

Entre os exemplos de campos únicos encontram-se:

* email do utilizador;
* código do piso dentro do edifício;
* token QR da secretária;
* referência do pagamento.

As chaves estrangeiras asseguram que não são criados registos associados a entidades inexistentes.

---

# 3.10 Decisões de Modelação

Durante o desenvolvimento foram tomadas várias decisões importantes relativamente à estrutura da base de dados.

## Edifícios

Inicialmente estava prevista a entidade **Localidade**.

Após análise funcional, verificou-se que a entidade **Edifício** representava melhor a realidade da aplicação, tendo sido adotada como entidade principal da organização física dos espaços.

O edifício permite armazenar informação mais completa, como:

* nome;
* código;
* morada;
* código postal;
* cidade;
* país;
* contactos;
* horário;
* descrição;
* estado ativo.

---

## Ativação Lógica

As principais entidades possuem o atributo **ativo**.

Em vez da eliminação física dos registos, optou-se pela desativação lógica, permitindo:

* preservar o histórico;
* evitar perda de informação;
* manter a integridade das reservas;
* impedir a utilização de entidades desativadas;
* permitir a reativação futura.

Esta decisão é aplicada, entre outras, às seguintes entidades:

* utilizadores;
* edifícios;
* pisos;
* setores;
* secretárias;
* FAQs.

---

## Upload de Ficheiros

O modelo suporta armazenamento de ficheiros.

Foram adicionados os seguintes atributos:

| Entidade | Campo      |
| -------- | ---------- |
| Users    | fotografia |
| Pisos    | planta     |

Os ficheiros são armazenados utilizando o sistema de armazenamento público do Laravel.

Na base de dados é guardado apenas o caminho relativo do ficheiro, evitando o armazenamento direto de dados binários.

Esta abordagem facilita:

* substituição dos ficheiros;
* eliminação segura;
* geração de URLs públicas;
* alteração futura do sistema de armazenamento.

---

## QR Code

Cada secretária possui um identificador único utilizado para geração do respetivo QR Code.

Este identificador é armazenado no campo:

```text
qr_token
```

O token é utilizado durante o processo de check-in para:

* identificar a secretária;
* localizar a reserva associada;
* validar o utilizador;
* confirmar o check-in.

A utilização de um token único evita expor diretamente o identificador numérico da secretária.

---

## Pagamentos

A entidade **Pagamento** foi modelada separadamente da entidade **Reserva**.

Esta decisão permite:

* manter os dados financeiros isolados;
* controlar o ciclo de vida do pagamento;
* adicionar novos métodos no futuro;
* integrar gateways externos;
* manter o histórico;
* testar a lógica de pagamento de forma independente.

A relação escolhida foi de um pagamento por reserva, podendo a reserva ainda não possuir pagamento.

---

## Estados das Reservas

Os estados das reservas foram armazenados numa entidade própria em vez de serem definidos apenas através de texto livre.

Esta decisão permite:

* centralizar os estados;
* manter consistência;
* evitar erros de escrita;
* facilitar consultas;
* permitir evolução futura.

---

# 3.11 Regras de Integridade

A estrutura da base de dados foi concebida para garantir o cumprimento das principais regras de negócio.

Entre elas destacam-se:

* uma secretária apenas pode possuir uma reserva ativa para a mesma data e período;
* um utilizador apenas pode possuir uma reserva por período e por dia;
* apenas secretárias ativas e reserváveis podem receber reservas;
* apenas reservas válidas podem efetuar check-in;
* utilizadores inativos não podem executar operações protegidas;
* um pagamento pertence apenas a uma reserva;
* uma reserva possui, no máximo, um pagamento;
* cada referência de pagamento deve ser única;
* apenas pisos pertencentes a edifícios válidos podem ser criados;
* apenas setores pertencentes a pisos válidos podem ser criados;
* apenas secretárias pertencentes a setores válidos podem ser criadas.

Estas regras são reforçadas pela lógica implementada nos:

* Controllers;
* Form Requests;
* Policies;
* Services;
* Models;
* migrations.

Algumas regras dependem da aplicação e não apenas da base de dados, como a verificação de conflitos entre reservas.

---

# 3.12 Índices e Restrições

A base de dados utiliza índices e restrições para melhorar a integridade e o desempenho.

Entre os campos que podem beneficiar de índices encontram-se:

* chaves estrangeiras;
* email;
* estado;
* data da reserva;
* período;
* secretária;
* utilizador;
* referência do pagamento;
* token QR.

As restrições únicas são utilizadas em campos que não podem ser repetidos.

Exemplos:

```text
users.email
secretarias.qr_token
pagamentos.referencia
```

Nos pisos, o código deve ser único dentro do respetivo edifício.

A combinação pode ser representada por:

```text
edificio_id + codigo
```

---

# 3.13 Normalização

O modelo foi desenvolvido seguindo princípios de normalização.

A separação entre entidades permite evitar a duplicação de informação.

Por exemplo:

* os papéis são armazenados em `roles`;
* os períodos são armazenados em `periodos`;
* os estados das reservas são armazenados em `estado_reservas`;
* os pagamentos são armazenados separadamente das reservas;
* os dados dos espaços são divididos entre edifícios, pisos, setores e secretárias.

Esta organização reduz redundâncias e facilita a manutenção dos dados.

---

# 3.14 Diagrama Entidade-Relacionamento

O modelo relacional completo encontra-se representado no diagrama Entidade-Relacionamento apresentado em anexo.

O diagrama deve incluir as seguintes entidades:

```text
Roles
Users
Edificios
Pisos
Setores
Secretarias
Periodos
EstadoReservas
Reservas
Pagamentos
PedidoSuportes
FAQs
```

As principais relações podem ser representadas da seguinte forma:

```text
Role
  │
  └── Users
        │
        ├── Reservas
        │      │
        │      └── Pagamento
        │
        └── PedidoSuportes


Edificio
   │
   └── Pisos
          │
          └── Setores
                 │
                 └── Secretarias
                        │
                        └── Reservas


Periodo
   │
   └── Reservas


EstadoReserva
   │
   └── Reservas
```

O diagrama evidencia todas as entidades da aplicação, respetivas relações e cardinalidades, constituindo uma representação gráfica da estrutura persistente do sistema.

---

# 3.15 Considerações Finais

O modelo da base de dados foi desenvolvido de forma modular e normalizada, permitindo a evolução da aplicação sem alterações estruturais significativas.

A utilização do Eloquent ORM, das migrations e dos seeders do Laravel facilita a manutenção da base de dados, a criação de relações e a consistência dos dados.

A organização hierárquica entre edifícios, pisos, setores e secretárias representa de forma clara a estrutura física dos espaços.

A entidade Reserva permite relacionar utilizadores, secretárias, períodos e estados, constituindo o elemento central do processo de reserva.

A introdução da entidade **Pagamento** permite separar a informação financeira da restante informação da reserva e prepara o sistema para futuras integrações com serviços externos.

As entidades **FAQ** e **PedidoSuporte** suportam o Help Center e demonstram a capacidade de expansão do modelo de dados sem comprometer a organização existente.

Desta forma, a estrutura adotada oferece uma base consistente, extensível e adequada às funcionalidades atuais e futuras do SpaceHub.
