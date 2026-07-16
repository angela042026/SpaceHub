# 5. Documentação da API

## 5.1 Introdução

O SpaceHub disponibiliza uma API REST responsável pela autenticação, gestão dos espaços, reservas, disponibilidade de secretárias e check-in.

A API foi desenvolvida com Laravel e utiliza:

- Laravel Sanctum para autenticação;
- Form Requests para validação;
- Policies e Gates para autorização;
- API Resources para uniformização das respostas;
- Eloquent ORM para acesso à base de dados.

Os pedidos e respostas utilizam, por regra, o formato JSON.

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

# 5.15 Dashboard

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

# 5.16 Pesquisa, Filtros e Ordenação

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

# 5.17 Formato das Respostas Paginadas

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

# 5.18 Uploads

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

# 5.19 Segurança da API

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

# 5.20 Eventos em Tempo Real

As alterações relevantes nas reservas emitem o evento:

```text
MapaAtualizado
```

Este evento permite atualizar o mapa de disponibilidade e ocupação sem necessidade de recarregar manualmente a página.

---

# 5.21 Testes da API

A API encontra-se coberta por testes automatizados que validam:

- autenticação;
- autorização;
- Policies;
- utilizadores inativos;
- CRUD administrativo;
- reservas;
- disponibilidade;
- check-in;
- QR Code;
- dashboard;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- uploads.

À data da revisão da documentação, a suíte possui **111 testes automatizados**.

# 5.22 Resumo das Rotas

À data da revisão, a aplicação possui 38 rotas registadas no grupo da API.

Estas rotas abrangem:

- registo e autenticação;
- recuperação e redefinição de password;
- consulta do utilizador autenticado;
- gestão de utilizadores;
- gestão de edifícios;
- gestão de pisos;
- gestão de setores;
- gestão de secretárias;
- gestão de reservas;
- consulta da disponibilidade;
- ativação e desativação lógica das entidades;
- cancelamento de reservas.

As funcionalidades de dashboard, QR Code e check-in encontram-se integradas nas rotas web da aplicação e não fazem parte deste grupo de rotas da API.

# 5.23 Considerações Finais

A API do SpaceHub foi estruturada para apresentar respostas consistentes, aplicar as regras de negócio e garantir a segurança das operações.

A separação entre Controllers, Form Requests, Policies, Models e Resources facilita a manutenção e permite a evolução futura dos endpoints sem comprometer a organização geral da aplicação.