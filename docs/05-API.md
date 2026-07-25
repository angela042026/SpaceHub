# 5. Documentação da API

## 5.1 Introdução

O SpaceHub disponibiliza uma API REST responsável pela autenticação, gestão de utilizadores, gestão dos espaços, reservas, disponibilidade de secretárias, pagamentos e operações administrativas.

A aplicação inclui ainda funcionalidades web integradas através de Laravel, Inertia.js e React, nomeadamente o dashboard, o mapa interativo, o check-in por QR Code, o Help Center e a atualização em tempo real através do Laravel Reverb.


---

# 5.2 URL Base

Em ambiente local, a API pode ser acedida através de:

```text
http://127.0.0.1:8000/api
```

A URL pode variar de acordo com a configuração da aplicação.

---

# 5.3 Cabeçalhos

## Pedidos JSON

```http
Accept: application/json
Content-Type: application/json
```

## Pedidos autenticados

```http
Authorization: Bearer {token}
Accept: application/json
```

## Upload de ficheiros

Nos pedidos com fotografia ou planta deve ser utilizado:

```http
Content-Type: multipart/form-data
```

O cliente não deve definir manualmente o limite do `boundary`; este é gerado automaticamente pelo browser ou pelo cliente HTTP.

---

# 5.4 Autenticação

A autenticação da API é realizada através de tokens Laravel Sanctum.

Após um registo ou login bem-sucedido, a resposta inclui um token:

```json
{
  "message": "Login efetuado com sucesso.",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@spacehub.pt",
    "role": "Administrador",
    "ativo": true
  },
  "token": "1|token..."
}
```

O token deve ser enviado nos pedidos seguintes:

```http
Authorization: Bearer 1|token...
```

---

# 5.5 Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | Operação realizada com sucesso |
| 201 | Recurso criado com sucesso |
| 204 | Operação concluída sem conteúdo |
| 400 | Pedido inválido |
| 401 | Utilizador não autenticado ou credenciais inválidas |
| 403 | Utilizador sem autorização |
| 404 | Recurso não encontrado |
| 422 | Erro de validação ou regra de negócio |
| 500 | Erro interno do servidor |

---

# 5.6 Formato dos Erros de Validação

Quando existem dados inválidos, a API devolve uma resposta semelhante a:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "O email já se encontra registado."
    ]
  }
}
```

As violações de regras de negócio podem devolver:

```json
{
  "message": "Esta secretária já se encontra reservada para a data e período selecionados."
}
```

---

# 5.7 Endpoints de Autenticação

## Registar utilizador

```http
POST /api/register
```

### Autenticação

Não necessária.

### Corpo

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Resultado

- cria um utilizador;
- atribui automaticamente o papel `Utilizador`;
- ativa a conta;
- devolve um token Sanctum.

### Resposta

```http
201 Created
```

---

## Iniciar sessão

```http
POST /api/login
```

### Corpo

```json
{
  "email": "joao@example.com",
  "password": "password123"
}
```

### Possíveis respostas

```http
200 OK
401 Unauthorized
403 Forbidden
```

Uma conta inativa recebe `403 Forbidden`.

---

## Terminar sessão

```http
POST /api/logout
```

### Autenticação

Obrigatória.

O token utilizado no pedido é revogado.

---

## Consultar utilizador autenticado

```http
GET /api/me
```

### Autenticação

Obrigatória.

---

## Solicitar recuperação da password

```http
POST /api/forgot-password
```

### Corpo

```json
{
  "email": "joao@example.com"
}
```

---

## Redefinir password

```http
POST /api/reset-password
```

### Corpo

```json
{
  "token": "token-de-recuperacao",
  "email": "joao@example.com",
  "password": "novaPassword123",
  "password_confirmation": "novaPassword123"
}
```

Após a alteração da password, os tokens Sanctum antigos do utilizador são revogados.

---

# 5.8 Gestão de Utilizadores

A gestão de utilizadores é reservada ao Administrador.

## Listar utilizadores

```http
GET /api/users
```

### Parâmetros

| Parâmetro | Descrição |
|-----------|-----------|
| search | Pesquisa por nome ou email |
| role_id | Filtra pelo papel |
| ativo | Filtra pelo estado ativo |
| sort_by | Campo de ordenação |
| sort_direction | `asc` ou `desc` |
| per_page | Número de registos por página |

### Exemplo

```http
GET /api/users?search=joao&ativo=1&sort_by=name&sort_direction=asc&per_page=15
```

---

## Consultar utilizador

```http
GET /api/users/{user}
```

---

## Criar utilizador

```http
POST /api/users
```

### Formato

Pode utilizar JSON ou `multipart/form-data`.

### Campos

| Campo | Obrigatório | Regra |
|------|:-----------:|-------|
| name | Sim | Texto, máximo 255 |
| email | Sim | Email único |
| password | Sim | Mínimo 8 caracteres |
| role_id | Sim | Papel existente |
| fotografia | Não | JPG, JPEG, PNG ou WebP, máximo 2 MB |

---

## Atualizar utilizador

```http
PUT /api/users/{user}
```

ou:


Os campos são opcionais, sendo atualizados apenas os enviados.

Uma nova fotografia substitui a anterior.

---

## Ativar ou desativar utilizador

```http
PATCH /api/users/{user}/toggle-ativo
```

Um Administrador não pode desativar a própria conta.

---

# 5.9 Gestão de Edifícios

## Listar edifícios

```http
GET /api/edificios
```

### Parâmetros disponíveis

- `search`;
- `cidade`;
- `pais`;
- `ativo`;
- `sort_by`;
- `sort_direction`;
- `per_page`.

---

## Consultar edifício

```http
GET /api/edificios/{edificio}
```

---

## Criar edifício

```http
POST /api/edificios
```

### Permissão

Administrador.

### Exemplo

```json
{
  "nome": "SpaceHub Braga",
  "codigo": "SHB",
  "morada": "Avenida Central, 10",
  "codigo_postal": "4700-001",
  "cidade": "Braga",
  "pais": "Portugal",
  "telefone": "253000000",
  "email": "braga@spacehub.pt",
  "hora_abertura": "08:00",
  "hora_fecho": "20:00",
  "descricao": "Edifício SpaceHub de Braga"
}
```

---

## Atualizar edifício

```http
PUT /api/edificios/{edificio}
```

---

## Ativar ou desativar edifício

```http
PATCH /api/edificios/{edificio}/toggle-ativo
```

---

# 5.10 Gestão de Pisos

## Listar pisos

```http
GET /api/pisos
```

### Parâmetros

- `search`;
- `edificio_id`;
- `numero`;
- `ativo`;
- `sort_by`;
- `sort_direction`;
- `per_page`.

---

## Consultar piso

```http
GET /api/pisos/{piso}
```

---

## Criar piso

```http
POST /api/pisos
```

### Permissão

Administrador ou Gestor.

### Formato

`multipart/form-data` quando é enviada uma planta.

### Campos

| Campo | Obrigatório | Regra |
|------|:-----------:|-------|
| edificio_id | Sim | Edifício existente |
| nome | Sim | Máximo 100 caracteres |
| codigo | Sim | Único dentro do edifício |
| numero | Sim | Inteiro |
| planta | Não | JPG, JPEG, PNG ou WebP, máximo 2 MB |
| descricao | Não | Texto |

---

## Atualizar piso

```http
PUT /api/pisos/{piso}
```

Uma nova planta substitui e remove o ficheiro anterior.

---

## Ativar ou desativar piso

```http
PATCH /api/pisos/{piso}/toggle-ativo
```

---

# 5.11 Gestão de Setores

## Listar setores

```http
GET /api/setores
```

### Parâmetros

- `search`;
- `piso_id`;
- `tipo`;
- `reservavel`;
- `ativo`;
- `sort_by`;
- `sort_direction`;
- `per_page`.

---

## Consultar setor

```http
GET /api/setores/{setor}
```

---

## Criar setor

```http
POST /api/setores
```

### Exemplo

```json
{
  "piso_id": 1,
  "nome": "Zona Norte",
  "codigo": "ZN",
  "tipo": "coworking",
  "reservavel": true,
  "capacidade": 20,
  "descricao": "Área colaborativa"
}
```

---

## Atualizar setor

```http
PUT /api/setores/{setor}
```

---

## Ativar ou desativar setor

```http
PATCH /api/setores/{setor}/toggle-ativo
```

---

# 5.12 Gestão de Secretárias

## Listar secretárias

```http
GET /api/secretarias
```

### Filtros

| Parâmetro | Descrição |
|-----------|-----------|
| setor_id | Setor associado |
| monitor | Possui monitor |
| dock_usb | Possui dock USB |
| junto_janela | Próxima de janela |
| ergonomica | Secretária ergonómica |
| reservavel | Pode ser reservada |
| ativo | Estado da secretária |
| search | Pesquisa |
| sort_by | Ordenação |
| sort_direction | Direção |
| per_page | Paginação |

---

## Consultar secretária

```http
GET /api/secretarias/{secretaria}
```

---

## Criar secretária

```http
POST /api/secretarias
```

### Exemplo

```json
{
  "setor_id": 1,
  "codigo": "SEC-01",
  "planta_x": 120,
  "planta_y": 90,
  "angulo": 0,
  "monitor": true,
  "dock_usb": true,
  "junto_janela": false,
  "ergonomica": true,
  "reservavel": true,
  "ativo": true,
  "descricao": "Secretária junto à entrada"
}
```

O `qr_token` é gerado automaticamente.

---

## Atualizar secretária

```http
PUT /api/secretarias/{secretaria}
```

---

## Ativar ou desativar secretária

```http
PATCH /api/secretarias/{secretaria}/toggle-ativo
```

---

# 5.13 Reservas

## Listar reservas

```http
GET /api/reservas
```

### Visibilidade

- Administrador: consulta todas as reservas;
- restantes utilizadores: consultam apenas as próprias.

---

## Consultar reserva

```http
GET /api/reservas/{reserva}
```

A consulta depende da Policy da reserva.

---

## Criar reserva

```http
POST /api/reservas
```

### Corpo

```json
{
  "data": "2026-07-20",
  "periodo_id": 1,
  "secretaria_id": 5,
  "observacoes": "Preferência por monitor"
}
```

### Validações

A API verifica:

- se a secretária está ativa;
- se a secretária é reservável;
- se está disponível;
- se o utilizador já possui uma reserva para o mesmo dia e período.

### Resultado

A reserva é criada no estado `pendente`.

---

## Atualizar reserva

```http
PUT /api/reservas/{reserva}
```

Não podem ser atualizadas reservas:

- canceladas;
- expiradas;
- com check-in efetuado.

---

## Cancelar reserva

```http
PATCH /api/reservas/{reserva}/cancelar
```

### Regras

- a reserva não pode estar já cancelada;
- não pode possuir check-in;
- não pode estar confirmada ou expirada;
- o utilizador comum apenas cancela reservas futuras elegíveis;
- o Administrador pode cancelar reservas ativas, respeitando as restantes restrições.

---

## Consultar disponibilidade

```http
GET /api/reservas/disponibilidade
```

### Parâmetros

```text
data
periodo_id
```

### Exemplo

```http
GET /api/reservas/disponibilidade?data=2026-07-20&periodo_id=1
```

A resposta inclui apenas secretárias ativas, reserváveis e disponíveis.

---

# 5.14 Check-in por QR Code

O check-in por QR Code encontra-se integrado na aplicação web.

Cada secretária possui um `qr_token` único, utilizado pelas rotas específicas de leitura e validação do QR Code.

Estas rotas não pertencem ao grupo `/api` apresentado neste documento e encontram-se documentadas no módulo web da aplicação.

# 5.15 Pagamentos

O módulo de pagamentos encontra-se associado às reservas.

Cada reserva pode possuir um único pagamento, através da relação:

```text
Reserva 1 ------ 0..1 Pagamento
```

Nesta versão do projeto, os pagamentos são simulados, não existindo movimentação financeira real.

Os métodos de pagamento suportados são:

* Cartão;
* MB Way;
* Transferência Bancária.

Os pagamentos podem apresentar estados como:

* pendente;
* pago;
* cancelado.

A lógica de negócio deste módulo encontra-se centralizada no `PagamentoService`.

---

## Listar pagamentos

```http
GET /api/pagamentos
```

### Autenticação

Obrigatória.

### Visibilidade

* o Administrador pode consultar todos os pagamentos;
* os restantes utilizadores apenas podem consultar pagamentos associados às próprias reservas.

### Parâmetros

| Parâmetro      | Descrição                             |
| -------------- | ------------------------------------- |
| search         | Pesquisa por referência ou utilizador |
| estado         | Filtra pelo estado do pagamento       |
| metodo         | Filtra pelo método de pagamento       |
| sort_by        | Campo de ordenação                    |
| sort_direction | `asc` ou `desc`                       |
| per_page       | Número de registos por página         |

### Exemplo

```http
GET /api/pagamentos?estado=pendente&metodo=mbway&per_page=10
```

---

## Consultar pagamento

```http
GET /api/pagamentos/{pagamento}
```

A consulta depende da `PagamentoPolicy`.

---

## Confirmar pagamento

```http
PATCH /api/pagamentos/{pagamento}/confirmar
```
GET    /pagamentos
GET    /pagamentos/{pagamento}
GET    /pagamentos/{pagamento}/pagar
PATCH  /pagamentos/{pagamento}/confirmar
GET    /pagamentos/{pagamento}/comprovativo

### Regras

* o pagamento deve estar no estado `pendente`;
* o utilizador deve possuir autorização;
* a reserva associada deve existir;
* um pagamento já confirmado não pode ser novamente confirmado.

Após a confirmação, o pagamento passa para o estado `pago`.

---

## Cancelar pagamento

```http
PATCH /api/pagamentos/{pagamento}/cancelar
```

### Regras

* o pagamento deve estar num estado que permita cancelamento;
* o utilizador deve possuir autorização;
* um pagamento já cancelado não pode ser novamente cancelado.

Após o cancelamento, o pagamento passa para o estado `cancelado`.

---

## Criação automática

O pagamento é criado automaticamente quando é criada uma reserva elegível.

O `PagamentoService` é responsável por:

* calcular o valor;
* gerar uma referência única;
* associar o pagamento à reserva;
* definir o estado inicial;
* atualizar o valor quando necessário;
* confirmar o pagamento;
* cancelar o pagamento.

Fluxo simplificado:

```text
Reserva criada
      |
      ▼
PagamentoService
      |
      ▼
Pagamento criado
      |
      ▼
Estado pendente
      |
      +-- Confirmação --> pago
      |
      +-- Cancelamento --> cancelado
```

---

# 5.16 Help Center

O Help Center inclui dois módulos:

* FAQs;
* pedidos de suporte.

Estas funcionalidades encontram-se integradas principalmente nas rotas web da aplicação.

---

## FAQs

As FAQs permitem disponibilizar perguntas e respostas frequentes aos utilizadores.

As operações incluem:

* listagem;
* pesquisa;
* criação;
* atualização;
* ativação;
* desativação.

A gestão das FAQs encontra-se limitada aos utilizadores com permissões adequadas.

---

## Pedidos de suporte

Os pedidos de suporte permitem que um utilizador solicite assistência através da plataforma.

Um pedido pode incluir:

* assunto;
* descrição;
* utilizador;
* estado;
* prioridade;
* data de criação;
* acompanhamento ou resposta.

O acesso aos pedidos depende da autenticação e das regras de autorização definidas no sistema.


# 5.16 Dashboard

O dashboard disponibiliza informação estatística sobre a utilização do SpaceHub.

Os dados podem incluir:

- número total de reservas;
- taxa de ocupação;
- reservas por período;
- reservas por estado;
- reservas por edifício;
- evolução num intervalo temporal.

O acesso depende do papel do utilizador.

---

# 5.17 Pesquisa, Filtros e Ordenação

As listagens administrativas adotam parâmetros comuns.

## Pesquisa

```text
search
```

## Ordenação

```text
sort_by
sort_direction
```

A direção pode ser:

```text
asc
desc
```

Os campos permitidos são definidos por uma lista segura em cada Controller, evitando a utilização arbitrária de colunas.

## Paginação

```text
per_page
page
```

O número de elementos por página é limitado pelo servidor.

---

# 5.18 Formato das Respostas Paginadas

Uma resposta paginada apresenta uma estrutura semelhante a:

```json
{
  "data": [
    {
      "id": 1,
      "nome": "Exemplo"
    }
  ],
  "links": {
    "first": "http://127.0.0.1:8000/api/recurso?page=1",
    "last": "http://127.0.0.1:8000/api/recurso?page=4",
    "prev": null,
    "next": "http://127.0.0.1:8000/api/recurso?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "per_page": 15,
    "to": 15,
    "total": 53
  }
}
```

---

# 5.19 Uploads

## Fotografia do utilizador

Diretório:

```text
storage/app/public/utilizadores/fotografias
```

Formatos permitidos:

- JPG;
- JPEG;
- PNG;
- WebP.

Tamanho máximo:

```text
2 MB
```

## Planta do piso

Diretório:

```text
storage/app/public/pisos/plantas
```

Formatos e limite iguais aos da fotografia.

Na base de dados é guardado apenas o caminho relativo do ficheiro.

---

# 5.20 Segurança da API

A API aplica várias camadas de proteção:

- autenticação Laravel Sanctum;
- bloqueio de utilizadores inativos;
- Policies;
- Gates;
- Form Requests;
- hashing das passwords;
- rotas protegidas;
- validação de uploads;
- lista segura de campos de ordenação;
- Resources para impedir exposição indevida de dados;
- revogação de tokens após redefinição da password.

---

# 5.21 Eventos em Tempo Real

As alterações relevantes nas reservas e na ocupação dos espaços podem emitir o evento:

```text
MapaAtualizado
```

O evento é transmitido através do sistema de broadcasting do Laravel e do servidor WebSocket Laravel Reverb.

No frontend, o Laravel Echo permite ouvir o evento e atualizar os componentes React sem necessidade de recarregar manualmente toda a página.

Fluxo simplificado:

```text
Alteração de reserva
        |
        ▼
Evento MapaAtualizado
        |
        ▼
Laravel Broadcasting
        |
        ▼
Laravel Reverb
        |
        ▼
Laravel Echo
        |
        ▼
Atualização do mapa
```

Entre as operações que podem originar uma atualização encontram-se:

* criação de uma reserva;
* alteração de uma reserva;
* cancelamento;
* check-in;
* expiração automática;
* alteração do estado de uma secretária.

As funcionalidades de tempo real utilizam canais definidos na configuração de broadcasting e no ficheiro:

```text
routes/channels.php
```

# 5.22 Testes da API

A API e os restantes módulos da aplicação encontram-se cobertos por testes automatizados que validam:

* autenticação;
* registo;
* login;
* logout;
* recuperação e redefinição da password;
* autorização;
* Policies;
* utilizadores inativos;
* middleware;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* reservas;
* disponibilidade;
* conflitos de reservas;
* cancelamento;
* check-in;
* QR Code;
* dashboard;
* mapa interativo;
* pesquisa;
* filtros;
* ordenação;
* paginação;
* uploads;
* pagamentos;
* `PagamentoService`;
* Help Center;
* FAQs;
* pedidos de suporte;
* eventos em tempo real.

À data da atualização desta documentação, a suíte apresenta o seguinte resultado:

```text
154 testes executados
154 testes aprovados
0 testes falhados
```


# 5.24 Resumo das Rotas

As rotas da aplicação abrangem:

* registo e autenticação;
* recuperação e redefinição da password;
* consulta do utilizador autenticado;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* gestão de reservas;
* consulta de disponibilidade;
* ativação e desativação lógica das entidades;
* cancelamento de reservas;
* consulta e gestão de pagamentos;
* confirmação de pagamentos;
* cancelamento de pagamentos.

As funcionalidades de dashboard, mapa interativo, QR Code, check-in e Help Center encontram-se principalmente integradas nas rotas web da aplicação.

A comunicação em tempo real utiliza ainda as rotas e canais necessários ao Laravel Reverb e ao sistema de broadcasting.


# 5.25 Considerações Finais

A API do SpaceHub foi estruturada para apresentar respostas consistentes, aplicar as regras de negócio e garantir a segurança das operações.

A separação entre Controllers, Form Requests, Policies, Models, Resources e Services facilita a manutenção e permite a evolução futura dos endpoints sem comprometer a organização geral da aplicação.

A integração do módulo de pagamentos demonstra a utilização de uma camada Service para centralizar regras de negócio e controlar as transições de estado.

O Help Center acrescenta funcionalidades de apoio ao utilizador através de FAQs e pedidos de suporte.

A utilização do Laravel Sanctum protege os endpoints autenticados, enquanto as Policies, Gates e middleware garantem que cada utilizador apenas executa operações compatíveis com o respetivo papel e com os recursos a que tem acesso.

A integração com Laravel Reverb permite atualizar o mapa e outros componentes em tempo real após alterações relevantes nas reservas.

A suíte de **154 testes automatizados, todos aprovados**, reforça a estabilidade da API e das restantes funcionalidades da aplicação.
.