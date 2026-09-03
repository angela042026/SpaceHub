5. Documentação da API

5.1 Introdução

O SpaceHub disponibiliza uma API REST para autenticação, gestão de utilizadores, gestão dos espaços, reservas, disponibilidade e pagamentos.

A aplicação possui também uma interface web desenvolvida com Laravel 12, React e Inertia.js. Nem todas as funcionalidades da interface web correspondem a endpoints públicos da API.

Esta documentação abrange apenas as rotas existentes sob o prefixo:

/api

As funcionalidades exclusivamente web, como determinadas páginas do dashboard, mapa interativo, leitura do QR Code, Help Center, assistente virtual e navegação Inertia, devem ser documentadas no capítulo da interface ou das rotas web.

Na versão final validada existem 41 rotas sob o prefixo API. A lista pode ser confirmada com php artisan route:list --path=api.

5.2 URL base

Em ambiente local, a URL base é:

http://127.0.0.1:8000/api

A URL varia de acordo com o domínio e a configuração do ambiente.

Exemplo de produção:

https://dominio-da-aplicacao.pt/api

5.3 Formato dos pedidos

5.3.1 Pedidos JSON

Accept: application/json
Content-Type: application/json

5.3.2 Pedidos autenticados

Authorization: Bearer {token}
Accept: application/json

5.3.3 Upload de ficheiros

Nos pedidos que incluem fotografia ou planta deve ser utilizado:

Content-Type: multipart/form-data

O cliente HTTP ou o browser deve gerar automaticamente o boundary. Este valor não deve ser definido manualmente.

5.4 Autenticação

A autenticação da API é efetuada através de Laravel Sanctum.

Após um registo ou login bem-sucedido, a resposta pode incluir:

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

O token deve ser enviado nos pedidos seguintes:

Authorization: Bearer 1|token...

Os utilizadores inativos não podem autenticar-se nem executar operações protegidas.

5.5 Códigos HTTP

Código

Significado

200

Operação concluída com sucesso

201

Recurso criado

204

Operação concluída sem conteúdo

400

Pedido inválido

401

Utilizador não autenticado ou credenciais inválidas

403

Operação não autorizada ou conta inativa

404

Recurso não encontrado

409

Conflito entre recursos, quando aplicável

422

Erro de validação ou regra de negócio

500

Erro interno não previsto

5.6 Formato das respostas

5.6.1 Resposta de sucesso

{
  "message": "Operação concluída com sucesso.",
  "data": {
    "id": 1
  }
}

5.6.2 Erro de validação

{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "O email já se encontra registado."
    ]
  }
}

5.6.3 Violação de regra de negócio

{
  "message": "A secretária não está disponível para o intervalo selecionado."
}

5.6.4 Acesso não autorizado

{
  "message": "Esta ação não está autorizada."
}

5.7 Resumo dos endpoints

5.7.1 Autenticação

Método

Endpoint

Autenticação

Finalidade

POST

/api/register

Não

Registar utilizador

POST

/api/login

Não

Iniciar sessão

POST

/api/forgot-password

Não

Solicitar recuperação da palavra-passe

POST

/api/reset-password

Não

Redefinir a palavra-passe

POST

/api/logout

Sim

Revogar o token atual

GET

/api/me

Sim

Consultar o utilizador autenticado

5.7.2 Utilizadores

Método

Endpoint

Permissão

GET

/api/users

Administrador

POST

/api/users

Administrador

GET

/api/users/{user}

Administrador ou acesso autorizado

PUT

/api/users/{user}

Administrador ou acesso autorizado

PATCH

/api/users/{user}/toggle-ativo

Administrador

5.7.3 Edifícios

Método

Endpoint

Permissão

GET

/api/edificios

Utilizador autenticado

POST

/api/edificios

Administrador ou Gestor

GET

/api/edificios/{edificio}

Utilizador autenticado

PUT

/api/edificios/{edificio}

Administrador ou Gestor

PATCH

/api/edificios/{edificio}/toggle-ativo

Administrador ou Gestor

5.7.4 Pisos

Método

Endpoint

Permissão

GET

/api/pisos

Utilizador autenticado

POST

/api/pisos

Administrador ou Gestor

GET

/api/pisos/{piso}

Utilizador autenticado

PUT

/api/pisos/{piso}

Administrador ou Gestor

PATCH

/api/pisos/{piso}/toggle-ativo

Administrador ou Gestor

5.7.5 Setores

Método

Endpoint

Permissão

GET

/api/setores

Utilizador autenticado

POST

/api/setores

Administrador ou Gestor

GET

/api/setores/{setor}

Utilizador autenticado

PUT

/api/setores/{setor}

Administrador ou Gestor

PATCH

/api/setores/{setor}/toggle-ativo

Administrador ou Gestor

5.7.6 Secretárias

Método

Endpoint

Permissão

GET

/api/secretarias

Utilizador autenticado

POST

/api/secretarias

Administrador ou Gestor

GET

/api/secretarias/{secretaria}

Utilizador autenticado

PUT

/api/secretarias/{secretaria}

Administrador ou Gestor

PATCH

/api/secretarias/{secretaria}/toggle-ativo

Administrador ou Gestor

5.7.7 Reservas

Método

Endpoint

Finalidade

GET

/api/reservas

Listar reservas autorizadas

POST

/api/reservas

Criar reserva

GET

/api/reservas/{reserva}

Consultar reserva

PUT

/api/reservas/{reserva}

Atualizar reserva elegível

PATCH

/api/reservas/{reserva}/cancelar

Cancelar reserva elegível

GET

/api/reservas/disponibilidade

Consultar disponibilidade

5.7.8 Pagamentos

Método

Endpoint

Finalidade

GET

/api/pagamentos

Listar pagamentos autorizados

GET

/api/pagamentos/{pagamento}

Consultar pagamento

PATCH

/api/pagamentos/{pagamento}/confirmar

Confirmar pagamento simulado

PATCH

/api/pagamentos/{pagamento}/cancelar

Cancelar pagamento elegível

5.8 Endpoints de autenticação

5.8.1 Registar utilizador

POST /api/register

Autenticação

Não necessária.

Corpo

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

Resultado

cria o utilizador;

atribui automaticamente o papel Utilizador;

define a conta como ativa;

devolve o utilizador e um token Sanctum.

Respostas

201 Created
422 Unprocessable Entity

5.8.2 Iniciar sessão

POST /api/login

Corpo

{
  "email": "joao@example.com",
  "password": "password123"
}

Respostas

200 OK
401 Unauthorized
403 Forbidden
422 Unprocessable Entity

Uma conta inativa recebe uma resposta de acesso negado.

5.8.3 Terminar sessão

POST /api/logout

Autenticação

Obrigatória.

O token utilizado no pedido é revogado.

5.8.4 Consultar utilizador autenticado

GET /api/me

Autenticação

Obrigatória.

Resposta exemplificativa

{
  "data": {
    "id": 4,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "Utilizador",
    "ativo": true
  }
}

5.8.5 Solicitar recuperação da palavra-passe

POST /api/forgot-password

Corpo

{
  "email": "joao@example.com"
}

5.8.6 Redefinir palavra-passe

POST /api/reset-password

Corpo

{
  "token": "token-de-recuperacao",
  "email": "joao@example.com",
  "password": "novaPassword123",
  "password_confirmation": "novaPassword123"
}

Após a redefinição, os tokens Sanctum anteriormente emitidos podem ser revogados de acordo com a implementação.

5.9 Gestão de utilizadores

A gestão de utilizadores é reservada ao Administrador.

5.9.1 Listar utilizadores

GET /api/users

Parâmetros

Parâmetro

Finalidade

search

Pesquisa por nome ou email

role_id

Filtra pelo papel

ativo

Filtra pelo estado

sort_by

Campo de ordenação permitido

sort_direction

asc ou desc

per_page

Registos por página

page

Página atual

Exemplo

GET /api/users?search=joao&ativo=1&sort_by=name&sort_direction=asc&per_page=15

5.9.2 Consultar utilizador

GET /api/users/{user}

A Policy determina se o utilizador autenticado pode consultar o recurso.

5.9.3 Criar utilizador

POST /api/users

Pode utilizar JSON ou multipart/form-data.

Campo

Obrigatório

Regra

name

Sim

Texto

email

Sim

Email único

password

Sim

Cumpre as regras de segurança

role_id

Sim

Papel existente

fotografia

Não

Imagem válida

ativo

Não

Booleano

5.9.4 Atualizar utilizador

PUT /api/users/{user}

Os campos permitidos são atualizados de acordo com o Form Request e a Policy.

Uma nova fotografia substitui a anterior de forma controlada.

5.9.5 Ativar ou desativar utilizador

PATCH /api/users/{user}/toggle-ativo

O Administrador não pode desativar a própria conta quando essa regra se encontra ativa.

5.10 Gestão de edifícios

5.10.1 Listar edifícios

GET /api/edificios

Parâmetros

search;

cidade;

pais;

ativo;

sort_by;

sort_direction;

per_page;

page.

5.10.2 Consultar edifício

GET /api/edificios/{edificio}

5.10.3 Criar edifício

POST /api/edificios

Exemplo

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

5.10.4 Atualizar edifício

PUT /api/edificios/{edificio}

5.10.5 Ativar ou desativar edifício

PATCH /api/edificios/{edificio}/toggle-ativo

A desativação lógica preserva os dados e o histórico.

5.11 Gestão de pisos

5.11.1 Listar pisos

GET /api/pisos

Parâmetros

search;

edificio_id;

numero;

ativo;

sort_by;

sort_direction;

per_page;

page.

5.11.2 Consultar piso

GET /api/pisos/{piso}

5.11.3 Criar piso

POST /api/pisos

Quando é enviada uma planta, o formato deve ser multipart/form-data.

Campo

Obrigatório

Regra

edificio_id

Sim

Edifício existente

nome

Sim

Texto

codigo

Sim

Único dentro do edifício

numero

Sim

Inteiro

planta

Não

Imagem válida

descricao

Não

Texto

5.11.4 Atualizar piso

PUT /api/pisos/{piso}

Uma nova planta substitui o ficheiro anterior de forma segura.

5.11.5 Ativar ou desativar piso

PATCH /api/pisos/{piso}/toggle-ativo

5.12 Gestão de setores

5.12.1 Listar setores

GET /api/setores

Parâmetros

search;

piso_id;

tipo;

reservavel;

ativo;

sort_by;

sort_direction;

per_page;

page.

5.12.2 Consultar setor

GET /api/setores/{setor}

5.12.3 Criar setor

POST /api/setores

Exemplo

{
  "piso_id": 1,
  "nome": "Zona Norte",
  "codigo": "ZN",
  "tipo": "coworking",
  "reservavel": true,
  "capacidade": 20,
  "preco_meio_dia": 10.0,
  "preco_dia_inteiro": 18.0,
  "preco_semanal": 80.0,
  "preco_mensal": 300.0,
  "preco_anual": 3000.0,
  "descricao": "Área colaborativa"
}

Os preços das reservas são armazenados no setor.

5.12.4 Atualizar setor

PUT /api/setores/{setor}

Pode incluir características, preços e posicionamento no mapa, de acordo com os campos permitidos pelo Form Request.

5.12.5 Ativar ou desativar setor

PATCH /api/setores/{setor}/toggle-ativo

5.13 Gestão de secretárias

5.13.1 Listar secretárias

GET /api/secretarias

Filtros

Parâmetro

Finalidade

setor_id

Filtra pelo setor

monitor

Possui monitor

dock_usb

Possui dock USB

junto_janela

Encontra-se junto a uma janela

ergonomica

Possui características ergonómicas

reservavel

Pode ser reservada

ativo

Estado lógico

search

Pesquisa

sort_by

Ordenação

sort_direction

Direção

per_page

Paginação

page

Página atual

5.13.2 Consultar secretária

GET /api/secretarias/{secretaria}

5.13.3 Criar secretária

POST /api/secretarias

Exemplo

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

O qr_token é gerado automaticamente e deve ser único.

5.13.4 Atualizar secretária

PUT /api/secretarias/{secretaria}

5.13.5 Ativar ou desativar secretária

PATCH /api/secretarias/{secretaria}/toggle-ativo

5.14 Reservas

5.14.1 Conceitos

Os períodos disponíveis são:

Manhã;

Tarde;

Dia inteiro.

As durações são:

diária;

semanal;

mensal;

anual.

Semanal, mensal e anual são durações e não períodos.

As reservas longas:

utilizam sempre o período Dia inteiro;

geram apenas uma reserva;

geram apenas um pagamento;

possuem a data final calculada automaticamente.

5.14.2 Listar reservas

GET /api/reservas

Visibilidade

Administrador: pode consultar todas as reservas autorizadas pela Policy;

restantes utilizadores: consultam as próprias reservas e os recursos expressamente permitidos.

Parâmetros

Podem incluir, conforme o Controller:

search;

estado;

periodo_id;

tipo_duracao;

data_inicio;

data_fim;

user_id;

secretaria_id;

sort_by;

sort_direction;

per_page;

page.

5.14.3 Consultar reserva

GET /api/reservas/{reserva}

A consulta depende da ReservaPolicy.

5.14.4 Criar reserva diária

POST /api/reservas

Corpo

{
  "data": "2026-08-10",
  "tipo_duracao": "diaria",
  "periodo_id": 1,
  "secretaria_id": 5,
  "observacoes": "Preferência por monitor"
}

5.14.5 Criar reserva longa

POST /api/reservas

Corpo

{
  "data": "2026-08-10",
  "tipo_duracao": "mensal",
  "secretaria_id": 5,
  "observacoes": "Reserva mensal"
}

O servidor:

valida a duração;

utiliza o período Dia inteiro;

calcula data_fim;

verifica conflitos em todo o intervalo;

calcula o valor;

cria a reserva;

cria o pagamento associado.

5.14.6 Regras de criação

A API verifica:

conta ativa;

autorização;

existência da secretária;

secretária ativa;

secretária reservável;

setor ativo e reservável;

período válido;

duração válida;

intervalo de datas;

ausência de conflito com outra reserva;

ausência de conflito com reservas do utilizador;

compatibilidade entre período e duração.

5.14.7 Atualizar reserva

PUT /api/reservas/{reserva}

Não podem ser alteradas reservas incompatíveis com a operação, nomeadamente quando se encontram:

canceladas;

expiradas;

confirmadas por check-in;

fora do prazo permitido.

A atualização deve repetir a validação de disponibilidade e conflito.

5.14.8 Cancelar reserva

PATCH /api/reservas/{reserva}/cancelar

A API valida:

propriedade ou permissão administrativa;

estado atual;

existência de check-in;

elegibilidade temporal;

regras do pagamento associado.

Após o cancelamento, a disponibilidade e os estados relacionados são atualizados.

5.14.9 Consultar disponibilidade

GET /api/reservas/disponibilidade

Reserva diária

GET /api/reservas/disponibilidade?data=2026-08-10&tipo_duracao=diaria&periodo_id=1

Reserva longa

GET /api/reservas/disponibilidade?data=2026-08-10&tipo_duracao=semanal

A resposta deve incluir apenas secretárias:

ativas;

reserváveis;

inseridas em espaços ativos;

livres em todo o intervalo aplicável.

5.15 Pagamentos

5.15.1 Enquadramento

O pagamento é criado automaticamente quando é criada uma reserva elegível.

A relação é:

Reserva 1 ------ 0..1 Pagamento

O processamento é simulado e não existe movimentação financeira real.

5.15.2 Métodos suportados

Cartão;

MB Way;

Transferência Bancária;

PayPal.

5.15.3 Estados principais

pendente;

pago;

cancelado.

Outros estados apenas devem ser documentados se existirem efetivamente no Model, migration e regras atuais.

5.15.4 Listar pagamentos

GET /api/pagamentos

Visibilidade

o Administrador pode consultar os pagamentos autorizados globalmente;

os restantes utilizadores consultam apenas pagamentos associados às próprias reservas.

Parâmetros

Parâmetro

Finalidade

search

Pesquisa por referência ou utilizador

estado

Filtra pelo estado

metodo

Filtra pelo método

sort_by

Ordenação

sort_direction

asc ou desc

per_page

Registos por página

page

Página atual

5.15.5 Consultar pagamento

GET /api/pagamentos/{pagamento}

A consulta depende da PagamentoPolicy.

5.15.6 Confirmar pagamento

PATCH /api/pagamentos/{pagamento}/confirmar

Corpo exemplificativo

{
  "metodo": "paypal"
}

Regras

o pagamento deve estar pendente;

o utilizador deve estar autorizado;

a reserva associada deve existir;

um pagamento confirmado não pode ser confirmado novamente;

o método deve ser válido.

Após a confirmação:

o pagamento passa para pago;

a reserva associada é atualizada de acordo com as regras atuais;

o histórico fica disponível.

5.15.7 Cancelar pagamento

PATCH /api/pagamentos/{pagamento}/cancelar

A operação depende do estado, da autorização e das regras da reserva associada.

5.15.8 Cálculo do valor

O PagamentoService calcula o valor a partir:

do setor;

do período;

da duração;

dos preços configurados;

dos descontos aplicáveis.

Regras atuais:

semanal: cinco dias úteis;

mensal: vinte e dois dias úteis, com 10% de desconto;

anual: duzentos e sessenta e quatro dias úteis, com 20% de desconto.

5.16 Pesquisa, filtros, ordenação e paginação

As listagens adotam parâmetros comuns.

Pesquisa

search

Ordenação

sort_by
sort_direction

A direção aceita:

asc
desc

Cada Controller deve utilizar uma lista segura de campos de ordenação.

Paginação

per_page
page

O servidor deve limitar o número máximo de elementos por página.

5.17 Formato das respostas paginadas

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

A estrutura exata pode variar consoante o Resource ou resposta utilizada pelo endpoint.

5.18 Uploads

5.18.1 Fotografia do utilizador

Armazenamento:

storage/app/public/utilizadores/fotografias

Formatos admitidos:

JPG;

JPEG;

PNG;

WebP.

O limite deve corresponder ao Form Request da versão entregue.

5.18.2 Planta do piso

Armazenamento:

storage/app/public/pisos/plantas

Na base de dados é guardado apenas o caminho relativo.

Uma substituição deve remover o ficheiro anterior de forma segura.

5.19 Segurança da API

A API utiliza várias camadas de proteção:

Laravel Sanctum;

middleware auth:sanctum;

middleware active;

middleware role, quando aplicável;

Policies;

Gates;

Form Requests;

hashing de palavras-passe;

validação de uploads;

proteção contra mass assignment;

listas seguras de campos de ordenação;

Resources;

chaves estrangeiras e restrições;

revogação de tokens;

validação da propriedade dos recursos.

Fluxo simplificado:

Pedido API
    ↓
auth:sanctum
    ↓
active
    ↓
role, quando aplicável
    ↓
Policy
    ↓
Form Request
    ↓
Controller / Service
    ↓
Model / Base de dados
    ↓
Resource / JSON

5.20 Funcionalidades web relacionadas

As seguintes funcionalidades podem estar integradas principalmente nas rotas web e não devem ser apresentadas como endpoints API sem confirmação em routes/api.php:

dashboard;

mapa interativo;

editor gráfico;

leitura e confirmação de check-in por QR Code;

check-in presencial assistido na receção;

comprovativo de pagamento;

Help Center;

FAQs;

pedidos de suporte;

avaliações;

notificações;

assistente virtual baseado nas FAQs;

comunicação em tempo real.

A existência de uma funcionalidade na interface não significa, por si só, que exista um endpoint público equivalente na API.

5.21 Comunicação em tempo real

As alterações relevantes podem emitir eventos, como:

MapaAtualizado

Fluxo:

Alteração no backend
    ↓
Evento Laravel
    ↓
Broadcasting
    ↓
Laravel Reverb
    ↓
Laravel Echo
    ↓
Componente React

O broadcasting utiliza os canais definidos em:

routes/channels.php

A comunicação WebSocket é complementar à API REST e não substitui os endpoints HTTP.

5.22 Testes da API

Os testes automatizados validam, entre outras áreas:

autenticação;

registo;

login e logout;

recuperação de palavra-passe;

utilizadores inativos;

middleware;

Policies;

respostas 401, 403 e 422;

utilizadores;

edifícios;

pisos;

setores;

secretárias;

reservas;

reservas longas;

disponibilidade;

conflitos;

cancelamento;

pagamentos;

filtros;

paginação;

uploads;

regras de negócio.

A contagem de testes não deve ser repetida em vários capítulos da documentação. O valor final deve ser obtido através de:

php artisan test

Para validar especificamente as rotas API:

php artisan route:list --path=api

Também deve ser confirmada a compilação do frontend:

npm.cmd run build

5.23 Verificação antes da entrega

Antes de considerar esta documentação definitiva, deve ser comparada com:

routes/api.php
app/Http/Controllers/Api
app/Http/Requests
app/Http/Resources
app/Policies
app/Services

Comandos recomendados:

php artisan optimize:clear
php artisan route:list --path=api
php artisan test
npm.cmd run build

Devem ser atualizados os campos, métodos ou endpoints que tenham sido alterados nos últimos commits.

5.24 Considerações finais

A API do SpaceHub foi organizada para:

apresentar respostas consistentes;

validar os dados no servidor;

centralizar regras de negócio;

aplicar autenticação e autorização;

proteger os recursos de cada utilizador;

disponibilizar paginação e filtros;

suportar reservas de diferentes durações;

integrar reservas e pagamentos;

permitir futuras integrações externas.

A separação entre rotas, Controllers, Form Requests, Policies, Services, Models e Resources facilita a manutenção e reduz a duplicação de lógica.

A documentação da API deve permanecer sincronizada com routes/api.php e com os testes automatizados da versão efetivamente entregue.
