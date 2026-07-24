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

A utilização do ecossistema Laravel, em conjunto com React e Inertia.js, possibilita uma solução moderna, modular e preparada para evolução futura, mantendo simultaneamente elevados níveis de segurança, desempenho e manutenibilidade.# 4. Arquitetura da Aplicação

# 4.1 Introdução

O SpaceHub foi desenvolvido segundo uma arquitetura em camadas baseada no padrão **Model-View-Controller (MVC)**, utilizando o framework **Laravel 12** no backend e **React**, integrado através do **Inertia.js**, no frontend.

A arquitetura adotada tem como principal objetivo garantir uma separação clara entre as diferentes responsabilidades da aplicação, permitindo organizar de forma consistente a interface, o processamento dos pedidos, a aplicação das regras de negócio, o controlo de permissões e a persistência dos dados.

Esta separação contribui para:

* facilitar a manutenção do código;
* reduzir o acoplamento entre componentes;
* promover a reutilização de funcionalidades;
* melhorar a segurança;
* simplificar os testes automatizados;
* facilitar a evolução futura da aplicação;
* permitir a integração de novos módulos sem alterações estruturais profundas.

O Laravel é responsável pela gestão das rotas, autenticação, autorização, validação, lógica de negócio, acesso à base de dados, eventos, comunicação em tempo real e entrega das páginas Inertia.

O React é responsável pela construção da interface gráfica e pela interação dinâmica com o utilizador. O Inertia.js estabelece a ligação entre o backend Laravel e os componentes React, permitindo desenvolver uma aplicação com comportamento semelhante ao de uma Single Page Application, sem exigir a criação de uma API independente para todas as páginas da interface web.

A aplicação disponibiliza também rotas de API protegidas por autenticação através do **Laravel Sanctum**, utilizadas para operações autenticadas, comunicação baseada em JSON e preparação para integrações externas.

A arquitetura atual suporta os principais módulos do SpaceHub:

* autenticação;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* gestão de reservas;
* disponibilidade de espaços;
* mapa interativo;
* dashboard;
* check-in através de QR Code;
* pagamentos;
* FAQs;
* pedidos de suporte;
* uploads;
* comunicação em tempo real;
* testes automatizados.

---

# 4.2 Arquitetura Geral

A arquitetura do SpaceHub encontra-se dividida em diferentes camadas, cada uma com responsabilidades próprias.

De forma simplificada, a arquitetura pode ser representada da seguinte forma:

```text
                +----------------------------------+
                |            Utilizador            |
                +----------------+-----------------+
                                 |
                                 ▼
                +----------------------------------+
                |       Interface React            |
                |       Componentes e Páginas      |
                +----------------+-----------------+
                                 |
                            Inertia.js
                                 |
                    HTTP / JSON / Form Data
                                 |
                                 ▼
                +----------------------------------+
                |          Rotas Laravel 12        |
                |       web.php / api.php          |
                +----------------+-----------------+
                                 |
                                 ▼
                +----------------------------------+
                |        Middleware Laravel        |
                | auth / active / role / CSRF      |
                +----------------+-----------------+
                                 |
                                 ▼
                +----------------------------------+
                |           Controllers            |
                +-------+---------------+----------+
                        |               |
                        ▼               ▼
                Form Requests        Policies
                        |               |
                        +-------+-------+
                                |
                                ▼
                         Services / Eventos
                                |
                                ▼
                             Models
                                |
                           Eloquent ORM
                                |
                                ▼
                         Base de Dados MySQL
```

A aplicação pode ainda ser observada segundo as seguintes camadas funcionais:

1. **Camada de apresentação**
   Constituída pelas páginas, layouts e componentes React.

2. **Camada de comunicação**
   Constituída pelo Inertia.js, pedidos HTTP, respostas Inertia, respostas JSON e formulários.

3. **Camada de encaminhamento**
   Constituída pelas rotas web e API.

4. **Camada de segurança**
   Constituída pela autenticação, middleware, Policies, Gates, proteção CSRF e validação de utilizadores ativos.

5. **Camada de aplicação**
   Constituída pelos Controllers, Form Requests, Resources e Services.

6. **Camada de domínio**
   Constituída pelos Models, relações Eloquent, estados, regras de reserva e regras de pagamento.

7. **Camada de persistência**
   Constituída pelo Eloquent ORM e pela base de dados MySQL.

8. **Camada de eventos e tempo real**
   Constituída pelos eventos Laravel, broadcasting, Laravel Reverb e Laravel Echo.

9. **Camada de testes**
   Constituída pelos testes de unidade e de funcionalidade desenvolvidos com PHPUnit.

---

# 4.3 Padrão Model-View-Controller

O padrão MVC constitui a base da organização do projeto.

## 4.3.1 Model

Os Models representam as entidades do domínio e a respetiva persistência na base de dados.

Cada Model corresponde, de forma geral, a uma tabela e contém:

* atributos preenchíveis;
* conversões de tipos;
* relações com outras entidades;
* métodos auxiliares;
* regras simples relacionadas com a entidade;
* scopes de consulta, quando necessários.

Entre os principais Models do projeto encontram-se:

* `User`;
* `Role`;
* `Edificio`;
* `Piso`;
* `Setor`;
* `Secretaria`;
* `Reserva`;
* `Periodo`;
* `EstadoReserva`;
* `Pagamento`;
* `Faq`;
* `PedidoSuporte`.

Os Models utilizam o Eloquent ORM para representar e manipular os dados.

Exemplo conceptual:

```php
class Reserva extends Model
{
    protected $fillable = [
        'user_id',
        'secretaria_id',
        'periodo_id',
        'estado_reserva_id',
        'data',
    ];
}
```

---

## 4.3.2 View

Na arquitetura tradicional do Laravel, a camada View é normalmente implementada através de Blade.

No SpaceHub, a maior parte da interface autenticada é desenvolvida com **React**, sendo as páginas entregues através do Inertia.js.

Os componentes React são responsáveis por:

* apresentar informação;
* recolher dados introduzidos pelo utilizador;
* mostrar mensagens de validação;
* controlar estados da interface;
* executar pedidos ao backend;
* atualizar componentes sem recarregar toda a página;
* apresentar mapas, tabelas, cartões e formulários;
* reagir a eventos recebidos em tempo real.

Embora exista uma estrutura `resources/views`, esta é utilizada principalmente como ponto de entrada da aplicação Inertia.

---

## 4.3.3 Controller

Os Controllers funcionam como intermediários entre as rotas, os pedidos do utilizador, as regras de segurança, a lógica de aplicação e os Models.

As principais responsabilidades dos Controllers incluem:

* receber pedidos HTTP;
* obter o utilizador autenticado;
* autorizar operações;
* iniciar a validação;
* chamar Services;
* executar consultas;
* carregar relações;
* devolver respostas JSON;
* devolver páginas Inertia;
* redirecionar o utilizador;
* emitir mensagens de sucesso ou erro.

Os Controllers não devem concentrar lógica de negócio complexa. Sempre que uma operação apresenta múltiplas regras, efeitos laterais ou possibilidade de reutilização, essa lógica deve ser transferida para uma classe Service.

---

# 4.4 Organização do Backend

O backend encontra-se organizado de acordo com as convenções do Laravel 12.

A estrutura principal inclui:

```text
app/
 ├── Events/
 ├── Http/
 │    ├── Controllers/
 │    │    └── Api/
 │    ├── Middleware/
 │    ├── Requests/
 │    └── Resources/
 ├── Models/
 ├── Policies/
 ├── Providers/
 ├── Services/
 └── Notifications/
```

Cada diretório possui uma responsabilidade específica.

---

# 4.5 Models

Os Models representam as entidades persistidas na base de dados e constituem a camada de domínio e persistência da aplicação.

Os principais Models são:

| Model           | Responsabilidade                                |
| --------------- | ----------------------------------------------- |
| `User`          | Representar os utilizadores do sistema          |
| `Role`          | Representar os papéis e perfis de autorização   |
| `Edificio`      | Representar os edifícios disponíveis            |
| `Piso`          | Representar os pisos pertencentes a edifícios   |
| `Setor`         | Representar as áreas existentes em cada piso    |
| `Secretaria`    | Representar as secretárias reserváveis          |
| `Reserva`       | Representar as reservas efetuadas               |
| `Periodo`       | Representar os períodos horários disponíveis    |
| `EstadoReserva` | Representar os estados possíveis de uma reserva |
| `Pagamento`     | Representar o pagamento associado a uma reserva |
| `Faq`           | Representar perguntas frequentes                |
| `PedidoSuporte` | Representar pedidos submetidos no Help Center   |

Os Models implementam relações Eloquent, incluindo:

* `belongsTo()`;
* `hasMany()`;
* `hasOne()`.

Exemplos conceptuais:

```php
public function pisos()
{
    return $this->hasMany(Piso::class);
}
```

```php
public function edificio()
{
    return $this->belongsTo(Edificio::class);
}
```

```php
public function pagamento()
{
    return $this->hasOne(Pagamento::class);
}
```

Estas relações permitem representar a estrutura hierárquica e funcional da aplicação.

```text
Edifício
   |
   +-- Pisos
          |
          +-- Setores
                 |
                 +-- Secretárias
                        |
                        +-- Reservas
                               |
                               +-- Pagamento
```

---

# 4.6 Controllers

Cada módulo principal possui um Controller responsável por coordenar os respetivos pedidos.

Entre os Controllers existentes encontram-se:

* `AuthController`;
* `UserController`;
* `EdificioController`;
* `PisoController`;
* `SetorController`;
* `SecretariaController`;
* `ReservaController`;
* `DashboardController`;
* `MapaController`;
* `CheckinController`;
* `PagamentoController`;
* `FaqController`;
* `PedidoSuporteController`;
* `ProfileController`.

Existem Controllers associados às rotas web e Controllers específicos para a API.

Os Controllers web devolvem normalmente:

* páginas Inertia;
* redirecionamentos;
* mensagens de sessão;
* respostas adequadas aos formulários React.

Os Controllers API devolvem normalmente:

* respostas JSON;
* códigos de estado HTTP;
* Resources;
* mensagens de erro estruturadas.

Exemplo conceptual de um Controller:

```php
public function index()
{
    Gate::authorize('viewAny', Reserva::class);

    $reservas = Reserva::query()
        ->with([
            'user',
            'secretaria.setor.piso.edificio',
            'periodo',
            'estadoReserva',
            'pagamento',
        ])
        ->paginate();

    return Inertia::render('Reservas/Index', [
        'reservas' => $reservas,
    ]);
}
```

---

# 4.7 Form Requests

A validação dos dados é realizada através de classes Form Request.

A utilização de Form Requests permite retirar dos Controllers as regras de validação e centralizar a definição dos dados aceites por cada operação.

Entre os Form Requests utilizados encontram-se:

* `StoreUserRequest`;
* `UpdateUserRequest`;
* `StoreEdificioRequest`;
* `UpdateEdificioRequest`;
* `StorePisoRequest`;
* `UpdatePisoRequest`;
* `StoreSetorRequest`;
* `UpdateSetorRequest`;
* `StoreSecretariaRequest`;
* `UpdateSecretariaRequest`;
* `StoreReservaRequest`;
* `UpdateReservaRequest`;
* Requests associados a pagamentos;
* Requests associados a FAQs;
* Requests associados a pedidos de suporte.

Os Form Requests permitem definir:

* campos obrigatórios;
* tipos de dados;
* limites de tamanho;
* regras de unicidade;
* existência de chaves estrangeiras;
* formatos de datas;
* formatos de ficheiros;
* mensagens de validação;
* autorização adicional, quando necessária.

Exemplo conceptual:

```php
public function rules(): array
{
    return [
        'secretaria_id' => ['required', 'integer', 'exists:secretarias,id'],
        'periodo_id' => ['required', 'integer', 'exists:periodos,id'],
        'data' => ['required', 'date'],
    ];
}
```

A validação realizada no servidor é independente da validação existente na interface React, garantindo que pedidos manipulados ou enviados diretamente continuam protegidos.

---

# 4.8 API Resources

As respostas da API podem utilizar Resources para controlar a representação dos Models em JSON.

Entre os Resources utilizados ou previstos na arquitetura encontram-se:

* `UserResource`;
* `ReservaResource`;
* `PisoResource`;
* `SetorResource`;
* `SecretariaResource`;
* `PagamentoResource`.

Os Resources permitem:

* definir os campos devolvidos;
* esconder informação interna;
* formatar datas;
* apresentar relações;
* manter consistência entre respostas;
* evitar a exposição direta de todos os atributos do Model.

Exemplo conceptual:

```php
public function toArray($request): array
{
    return [
        'id' => $this->id,
        'data' => $this->data,
        'estado' => $this->estadoReserva?->nome,
        'secretaria' => new SecretariaResource($this->whenLoaded('secretaria')),
    ];
}
```

---

# 4.9 Services

A camada de Services é utilizada para concentrar regras de negócio que não devem permanecer nos Controllers.

O principal exemplo desta abordagem é o:

```text
PagamentoService
```

O `PagamentoService` centraliza a lógica relacionada com o módulo de pagamentos.

As suas responsabilidades incluem:

* criar automaticamente um pagamento;
* calcular o valor associado à reserva;
* atualizar o valor de um pagamento;
* gerar referências únicas;
* confirmar pagamentos;
* cancelar pagamentos;
* validar alterações de estado;
* simular o processamento do pagamento;
* evitar duplicação de lógica;
* manter consistência entre diferentes operações.

A utilização de um Service permite que a mesma lógica seja reutilizada em:

* Controllers;
* comandos;
* eventos;
* testes;
* futuras integrações com gateways externos.

Fluxo conceptual:

```text
Pedido HTTP
    |
    ▼
PagamentoController
    |
    ▼
PagamentoPolicy
    |
    ▼
Form Request
    |
    ▼
PagamentoService
    |
    ▼
Pagamento / Reserva
    |
    ▼
Base de Dados
```

A lógica de pagamento permanece assim isolada da camada de apresentação.

---

# 4.10 Policies e controlo de acesso

A autorização é implementada através do sistema de Policies do Laravel.

As Policies permitem definir, para cada entidade, quais os utilizadores autorizados a executar uma determinada ação.

As principais Policies implementadas são:

* `UserPolicy`;
* `ReservaPolicy`;
* `EdificioPolicy`;
* `PisoPolicy`;
* `SetorPolicy`;
* `SecretariaPolicy`;
* `PagamentoPolicy`.

As Policies podem incluir métodos como:

* `viewAny`;
* `view`;
* `create`;
* `update`;
* `delete`;
* `toggleAtivo`;
* `cancelar`;
* `confirmar`;
* métodos específicos de cada módulo.

Exemplo conceptual:

```php
public function update(User $user, Reserva $reserva): bool
{
    return $user->role->nome === 'Administrador'
        || $reserva->user_id === $user->id;
}
```

Nos Controllers, a autorização é executada através de mecanismos como:

```php
Gate::authorize('update', $reserva);
```

ou:

```php
$this->authorize('view', $pagamento);
```

Esta arquitetura evita a repetição de verificações manuais de papéis em diferentes Controllers.

---

# 4.11 Papéis da aplicação

O SpaceHub utiliza diferentes papéis para separar as responsabilidades dos utilizadores.

Os papéis existentes são:

* Administrador;
* Gestor;
* Colaborador;
* Utilizador.

A distribuição geral de permissões encontra-se representada na tabela seguinte.

| Papel         | Responsabilidades gerais                                                 |
| ------------- | ------------------------------------------------------------------------ |
| Administrador | Gestão de utilizadores, consulta global, administração e acesso alargado |
| Gestor        | Gestão operacional de edifícios, pisos, setores e secretárias            |
| Colaborador   | Consulta de informação e utilização de funcionalidades permitidas        |
| Utilizador    | Gestão do próprio perfil, reservas, check-in e pagamentos próprios       |

As permissões reais não dependem apenas desta descrição geral, sendo aplicadas através das Policies e do middleware.

---

# 4.12 Middleware

Os pedidos são processados por middleware antes de chegarem aos Controllers.

Os principais mecanismos utilizados são:

## 4.12.1 Middleware `auth`

Garante que apenas utilizadores autenticados acedem a rotas protegidas.

Nas rotas web é utilizada a autenticação baseada em sessão.

Nas rotas API é utilizado:

```php
auth:sanctum
```

---

## 4.12.2 Middleware `active`

O middleware `active` impede que contas inativas utilizem funcionalidades protegidas.

Mesmo que um utilizador possua credenciais ou um token anteriormente emitido, o sistema verifica o estado atual da conta.

Este middleware é especialmente importante para permitir a desativação administrativa de utilizadores sem eliminar os seus dados.

---

## 4.12.3 Middleware `role`

O middleware `role` permite restringir grupos de rotas a um papel específico.

Exemplo conceptual:

```php
Route::middleware([
    'auth:sanctum',
    'active',
    'role:Administrador',
])->group(function () {
    // Rotas administrativas
});
```

---

## 4.12.4 Proteção CSRF

As rotas web e os formulários são protegidos contra ataques Cross-Site Request Forgery através dos mecanismos disponibilizados pelo Laravel.

Os pedidos efetuados pelo Inertia respeitam esta proteção e utilizam os tokens necessários.

---

# 4.13 Autenticação

A autenticação do SpaceHub utiliza mecanismos nativos do Laravel e o Laravel Sanctum.

As funcionalidades implementadas incluem:

* registo;
* login;
* logout;
* consulta do utilizador autenticado;
* recuperação da palavra-passe;
* redefinição da palavra-passe;
* edição do perfil;
* alteração da palavra-passe;
* eliminação da própria conta, quando aplicável.

Nas rotas API, o Sanctum permite emitir tokens associados ao utilizador.

Fluxo simplificado de autenticação por token:

```text
Utilizador
    |
    | email + password
    ▼
AuthController
    |
    | valida credenciais
    ▼
Laravel Auth
    |
    | cria token Sanctum
    ▼
Token devolvido ao cliente
    |
    | Authorization: Bearer <token>
    ▼
Rotas protegidas
```

Os utilizadores inativos são impedidos de utilizar a aplicação.

As palavras-passe são armazenadas utilizando hashing seguro e nunca são guardadas em texto simples.

---

# 4.14 Rotas Web e rotas API

A aplicação separa os seus pontos de entrada em dois grupos principais.

## 4.14.1 Rotas Web

As rotas web encontram-se definidas principalmente em:

```text
routes/web.php
```

Estas rotas são utilizadas pela interface React através do Inertia.js.

São responsáveis por funcionalidades como:

* dashboard;
* perfil;
* reservas;
* histórico de reservas;
* disponibilidade;
* mapa;
* check-in;
* QR Codes;
* pagamentos;
* Help Center;
* páginas administrativas.

---

## 4.14.2 Rotas API

As rotas API encontram-se definidas em:

```text
routes/api.php
```

Estas rotas são utilizadas para:

* autenticação baseada em token;
* operações JSON;
* futuras integrações;
* testes de endpoints;
* comunicação desacoplada.

As rotas privadas utilizam normalmente:

```php
auth:sanctum
```

e:

```php
active
```

As rotas administrativas podem ainda utilizar:

```php
role:Administrador
```

---

# 4.15 Inertia.js

O Inertia.js permite utilizar Controllers e rotas Laravel para entregar páginas React sem necessidade de construir uma API REST separada para toda a interface web.

Um Controller pode devolver uma página da seguinte forma:

```php
return Inertia::render('Reservas/Index', [
    'reservas' => $reservas,
]);
```

O Inertia transforma os dados fornecidos pelo backend em propriedades disponíveis no componente React.

Este modelo apresenta várias vantagens:

* reutilização das rotas Laravel;
* utilização direta da autenticação web;
* manutenção das Policies no backend;
* redirecionamentos tradicionais;
* mensagens de sessão;
* validação integrada;
* menor duplicação entre frontend e backend;
* navegação sem recarregamento integral da página.

O SpaceHub utiliza, assim, uma arquitetura híbrida:

* páginas web através de Inertia;
* endpoints JSON através da API;
* React como camada de apresentação.

---

# 4.16 Organização do Frontend

O frontend encontra-se principalmente em:

```text
resources/js
```

A organização inclui:

```text
resources/js/
 ├── Components/
 ├── Layouts/
 ├── Pages/
 ├── app.jsx
 └── bootstrap.js
```

Dependendo do módulo, podem também existir ficheiros auxiliares para:

* serviços JavaScript;
* utilitários;
* hooks;
* constantes;
* configuração do Laravel Echo.

---

## 4.16.1 Pages

As páginas correspondem aos ecrãs principais da aplicação.

Exemplos:

```text
Pages/
 ├── Auth/
 ├── Dashboard/
 ├── Profile/
 ├── Reservas/
 ├── Pagamentos/
 ├── HelpCenter/
 ├── Mapa/
 └── Admin/
```

Entre as páginas relacionadas com reservas encontram-se:

* listagem;
* criação;
* edição;
* histórico;
* consulta de disponibilidade.

---

## 4.16.2 Components

Os componentes representam elementos reutilizáveis da interface.

Entre os componentes do projeto encontram-se elementos como:

* cartões estatísticos;
* cabeçalhos;
* menus laterais;
* formulários;
* tabelas;
* modais;
* cartões de reserva;
* painéis estatísticos;
* mapa de secretárias;
* indicadores de estado;
* mensagens de erro;
* componentes de paginação.

A reutilização de componentes reduz duplicação e promove consistência visual.

---

## 4.16.3 Layouts

Os Layouts definem estruturas comuns entre páginas.

Um Layout pode incluir:

* cabeçalho;
* menu lateral;
* navegação;
* área de conteúdo;
* informação do utilizador autenticado;
* notificações;
* acesso ao Help Center;
* acesso ao perfil.

---

## 4.16.4 Tailwind CSS

O Tailwind CSS é utilizado para definir o estilo visual da aplicação.

A sua utilização permite:

* criar interfaces responsivas;
* reutilizar classes utilitárias;
* manter consistência;
* reduzir ficheiros CSS específicos;
* adaptar rapidamente layouts;
* criar estados visuais para reservas e secretárias.

---

## 4.16.5 Vite

O Vite é utilizado para:

* compilar os ficheiros React;
* processar JavaScript;
* processar CSS;
* disponibilizar atualização rápida durante o desenvolvimento;
* gerar os ficheiros otimizados para produção.

---

# 4.17 Persistência dos dados

A persistência dos dados é assegurada através do Eloquent ORM e da base de dados MySQL.

Cada Model representa uma tabela ou entidade persistente.

O Eloquent é utilizado para:

* criar registos;
* consultar dados;
* atualizar registos;
* eliminar ou desativar dados;
* carregar relações;
* aplicar filtros;
* ordenar resultados;
* paginar listagens;
* executar transações, quando necessário.

Exemplo conceptual:

```php
$reserva = Reserva::create([
    'user_id' => $user->id,
    'secretaria_id' => $request->secretaria_id,
    'periodo_id' => $request->periodo_id,
    'data' => $request->data,
    'estado_reserva_id' => $estado->id,
]);
```

O acesso à base de dados não é realizado diretamente nos componentes React.

Todos os dados passam pelo backend, garantindo que as regras de validação e autorização são aplicadas.

---

# 4.18 Base de dados MySQL

O SpaceHub utiliza MySQL como sistema de gestão de base de dados relacional.

A estrutura é controlada através de migrations.

As migrations permitem:

* criar tabelas;
* alterar tabelas;
* adicionar índices;
* adicionar chaves estrangeiras;
* definir restrições;
* reproduzir a estrutura em diferentes ambientes;
* manter histórico das alterações.

As principais tabelas representam:

* utilizadores;
* papéis;
* edifícios;
* pisos;
* setores;
* secretárias;
* períodos;
* estados de reserva;
* reservas;
* pagamentos;
* FAQs;
* pedidos de suporte.

---

# 4.19 Relações entre entidades

A arquitetura de dados utiliza relações explícitas entre Models.

As principais relações incluem:

## Utilizador e papel

```text
Role 1 ------ N User
```

Um papel pode estar associado a vários utilizadores.

Cada utilizador possui um papel.

---

## Edifício e piso

```text
Edificio 1 ------ N Piso
```

Um edifício pode conter vários pisos.

Cada piso pertence a um edifício.

---

## Piso e setor

```text
Piso 1 ------ N Setor
```

Um piso pode conter vários setores.

Cada setor pertence a um piso.

---

## Setor e secretária

```text
Setor 1 ------ N Secretaria
```

Um setor pode conter várias secretárias.

Cada secretária pertence a um setor.

---

## Utilizador e reserva

```text
User 1 ------ N Reserva
```

Um utilizador pode possuir várias reservas.

Cada reserva pertence a um utilizador.

---

## Secretária e reserva

```text
Secretaria 1 ------ N Reserva
```

Uma secretária pode estar associada a várias reservas em datas ou períodos diferentes.

---

## Reserva e pagamento

```text
Reserva 1 ------ 0..1 Pagamento
```

Uma reserva pode possuir um pagamento associado.

A relação é implementada no Model `Reserva` através de:

```php
public function pagamento()
{
    return $this->hasOne(Pagamento::class);
}
```

---

# 4.20 Eager Loading

O projeto utiliza eager loading para carregar relações antecipadamente e evitar o problema conhecido como **N+1 Queries**.

Sem eager loading, a apresentação de uma lista de reservas poderia provocar uma consulta adicional por cada reserva para obter:

* utilizador;
* secretária;
* setor;
* piso;
* edifício;
* período;
* estado;
* pagamento.

Com eager loading, as relações necessárias são carregadas de forma otimizada.

Exemplo conceptual:

```php
$reservas = Reserva::with([
    'user',
    'secretaria.setor.piso.edificio',
    'periodo',
    'estadoReserva',
    'pagamento',
])->paginate();
```

Também podem ser utilizados:

```php
$model->load(...);
```

e:

```php
$model->loadMissing(...);
```

A aplicação do eager loading apresenta as seguintes vantagens:

* reduz o número de consultas;
* melhora o desempenho das listagens;
* evita consultas repetidas;
* facilita a serialização;
* melhora a resposta do dashboard;
* melhora o carregamento do histórico;
* melhora o carregamento do mapa.

---

# 4.21 Paginação, pesquisa e filtros

As listagens com potencial crescimento utilizam paginação.

A paginação é especialmente relevante para:

* utilizadores;
* reservas;
* pagamentos;
* pedidos de suporte;
* FAQs;
* entidades administrativas.

O backend aplica os filtros antes de executar a paginação.

Exemplo conceptual:

```php
$query = Pagamento::query()
    ->with(['reserva.user', 'reserva.secretaria']);

if ($request->filled('estado')) {
    $query->where('estado', $request->estado);
}

if ($request->filled('metodo')) {
    $query->where('metodo', $request->metodo);
}

$pagamentos = $query
    ->latest()
    ->paginate(10)
    ->withQueryString();
```

O método `withQueryString()` permite preservar filtros durante a navegação entre páginas.

---

# 4.22 Gestão de ficheiros e uploads

O sistema suporta armazenamento de ficheiros associados a diferentes entidades.

Atualmente, os principais uploads incluem:

| Entidade | Tipo de ficheiro     |
| -------- | -------------------- |
| `User`   | Fotografia do perfil |
| `Piso`   | Planta do piso       |

Os ficheiros são armazenados utilizando o sistema Storage do Laravel.

O armazenamento público utiliza:

```text
storage/app/public
```

Os ficheiros são disponibilizados através do link simbólico:

```text
public/storage
```

A criação do link é realizada com:

```bash
php artisan storage:link
```

A arquitetura de uploads inclui:

* validação do ficheiro;
* validação da extensão;
* validação do tipo MIME;
* validação do tamanho;
* geração de nomes seguros;
* armazenamento através do Laravel;
* substituição controlada de ficheiros anteriores;
* eliminação segura do ficheiro antigo;
* armazenamento do caminho na base de dados.

Exemplo conceptual:

```php
$path = $request->file('fotografia')
    ->store('utilizadores', 'public');
```

A utilização da abstração `Storage` evita dependência direta de caminhos físicos e permite futura mudança para outro sistema de armazenamento.

---

# 4.23 Gestão de utilizadores

O módulo de utilizadores permite gerir as contas existentes no sistema.

As operações incluem:

* listar utilizadores;
* criar utilizadores;
* consultar utilizadores;
* atualizar utilizadores;
* associar papéis;
* ativar contas;
* desativar contas;
* editar o próprio perfil;
* atualizar fotografia;
* alterar palavra-passe.

As operações administrativas são protegidas por:

* autenticação;
* middleware `active`;
* middleware `role`, quando aplicável;
* `UserPolicy`;
* Form Requests.

A eliminação direta de utilizadores pode ser limitada para preservar a integridade de reservas, pagamentos e histórico.

---

# 4.24 Gestão de espaços

A estrutura física do SpaceHub é organizada hierarquicamente.

```text
Edifício
    |
    ▼
Piso
    |
    ▼
Setor
    |
    ▼
Secretária
```

Cada módulo possui:

* Model;
* Controller;
* Form Requests;
* Policy;
* rotas;
* interface;
* testes.

Esta organização permite representar diferentes instalações e respetivas plantas.

---

## 4.24.1 Edifícios

Os edifícios representam o nível superior da estrutura física.

Podem incluir informação como:

* nome;
* código;
* localização;
* estado ativo.

---

## 4.24.2 Pisos

Os pisos pertencem a edifícios.

Podem incluir:

* nome;
* código;
* número;
* planta;
* estado ativo.

A planta carregada pode ser utilizada no mapa interativo.

---

## 4.24.3 Setores

Os setores representam áreas funcionais dentro de um piso.

Podem conter:

* nome;
* tipo;
* capacidade;
* indicação de reservável;
* coordenadas na planta;
* largura;
* altura.

---

## 4.24.4 Secretárias

As secretárias representam os espaços individuais disponíveis para reserva.

Podem incluir:

* código;
* posição no mapa;
* ângulo;
* características;
* estado ativo;
* indicação de reservável;
* token QR;
* setor associado.

Entre as características configuráveis encontram-se:

* monitor;
* dock USB;
* proximidade de janela;
* características ergonómicas.

---

# 4.25 Mapa interativo

O mapa interativo permite visualizar a organização física do espaço e o estado das secretárias.

O mapa utiliza informação proveniente de:

* pisos;
* plantas;
* setores;
* secretárias;
* reservas;
* estados de ocupação.

Cada secretária pode ser posicionada através de coordenadas armazenadas na base de dados.

A interface apresenta diferentes estados, tais como:

* livre;
* reservada;
* ocupada;
* indisponível;
* inativa.

Fluxo conceptual:

```text
Base de Dados
    |
    ▼
MapaController
    |
    ▼
Carregamento das relações
    |
    ▼
Inertia
    |
    ▼
Componente OfficeMap
    |
    ▼
Representação gráfica
```

O mapa pode ser atualizado sem recarregamento total da página através da integração em tempo real.

---

# 4.26 Reservas

O módulo de reservas constitui uma das áreas centrais da aplicação.

As funcionalidades implementadas incluem:

* criação de reservas;
* consulta de reservas;
* edição de reservas;
* cancelamento;
* histórico;
* verificação de disponibilidade;
* validação de conflitos;
* associação a período;
* associação a secretária;
* associação a utilizador;
* associação a estado;
* associação a pagamento;
* check-in;
* expiração automática.

As reservas são protegidas por regras de autorização.

De forma geral:

* o Administrador pode consultar e gerir reservas de diferentes utilizadores;
* os restantes utilizadores apenas podem aceder às operações autorizadas sobre as próprias reservas;
* a criação depende da disponibilidade da secretária;
* não são permitidas reservas incompatíveis para o mesmo período.

---

# 4.27 Validação de conflitos de reservas

Antes da criação ou alteração de uma reserva, o sistema verifica regras como:

* existência da secretária;
* secretária ativa;
* secretária reservável;
* existência do período;
* ausência de outra reserva válida para a mesma secretária, data e período;
* ausência de reserva duplicada do mesmo utilizador;
* validade da data;
* permissão do utilizador.

Fluxo simplificado:

```text
Pedido de reserva
    |
    ▼
StoreReservaRequest
    |
    ▼
ReservaPolicy
    |
    ▼
Consulta de disponibilidade
    |
    +-- Conflito encontrado --> Erro de validação
    |
    +-- Sem conflito --------> Criação da reserva
```

---

# 4.28 Estados das reservas

As reservas utilizam estados para representar o seu ciclo de vida.

Entre os estados utilizados encontram-se:

* pendente;
* confirmada;
* cancelada;
* expirada.

O estado pode ser alterado devido a:

* criação da reserva;
* confirmação do check-in;
* cancelamento pelo utilizador;
* cancelamento administrativo;
* expiração automática.

A utilização de uma tabela de estados permite maior flexibilidade do que guardar diretamente um texto fixo em cada reserva.

---

# 4.29 Expiração automática

O SpaceHub inclui um mecanismo de expiração automática de reservas que não foram confirmadas dentro do período definido.

Este mecanismo é implementado através de um comando Laravel executado pelo Scheduler.

Exemplo de comando:

```text
reservas:cancelar-expiradas
```

O Scheduler executa periodicamente a verificação das reservas elegíveis.

Fluxo conceptual:

```text
Laravel Scheduler
    |
    ▼
Comando de verificação
    |
    ▼
Reservas pendentes
    |
    ▼
Verificação do limite de check-in
    |
    +-- Dentro do prazo --> Mantém estado
    |
    +-- Prazo excedido --> Marca como expirada
```

Este processo liberta automaticamente secretárias que não chegaram a ser utilizadas.

---

# 4.30 Check-in através de QR Code

O sistema implementa check-in através de QR Code.

Cada secretária possui um token QR único.

O fluxo de check-in inclui:

1. o utilizador efetua uma reserva;
2. o utilizador desloca-se à secretária;
3. o QR Code da secretária é lido;
4. o sistema identifica o token;
5. o sistema localiza a secretária;
6. o sistema verifica a existência de uma reserva válida;
7. o sistema verifica o utilizador autenticado;
8. o utilizador confirma o check-in;
9. a reserva é atualizada;
10. o mapa é atualizado.

Representação simplificada:

```text
QR Code
    |
    ▼
qr_token
    |
    ▼
Secretaria
    |
    ▼
Reserva válida
    |
    ▼
Utilizador autenticado
    |
    ▼
Confirmação de check-in
    |
    ▼
Reserva confirmada
```

As rotas de check-in incluem funcionalidades para:

* abrir a câmara;
* processar o token;
* apresentar a confirmação;
* confirmar a reserva.

---

# 4.31 QR Codes das secretárias

Os QR Codes são gerados com base num token único associado a cada secretária.

A utilização de um token, em vez do identificador sequencial, reduz a exposição direta dos IDs internos.

O sistema permite:

* listar QR Codes;
* gerar QR Code de uma secretária;
* identificar uma secretária através do token;
* utilizar o QR Code no fluxo de check-in.

O token é armazenado na base de dados com restrição de unicidade.

---

# 4.32 Módulo de pagamentos

O módulo de pagamentos encontra-se integrado com o módulo de reservas.

Cada reserva pode possuir um pagamento associado através da relação:

```text
Reserva hasOne Pagamento
```

O módulo inclui:

* Model `Pagamento`;
* Controller `PagamentoController`;
* Policy `PagamentoPolicy`;
* Service `PagamentoService`;
* rotas;
* páginas React;
* filtros;
* paginação;
* testes automatizados.

As funcionalidades implementadas incluem:

* criação automática do pagamento;
* cálculo e atualização do valor;
* confirmação;
* cancelamento;
* histórico;
* filtros por estado;
* filtros por método;
* pesquisa;
* paginação;
* referências únicas;
* simulação de pagamento.

---

# 4.33 Métodos de pagamento

O sistema suporta os seguintes métodos:

* Cartão;
* MB Way;
* Transferência Bancária.

Nesta fase, o pagamento é simulado e não existe movimentação real de dinheiro.

A implementação atual foi desenvolvida de forma a permitir futura integração com um fornecedor externo.

Exemplos de possíveis integrações futuras incluem:

* Stripe;
* gateway bancário;
* serviço MB Way;
* outro fornecedor de pagamentos.

A integração futura poderá ser realizada dentro do `PagamentoService`, preservando a maior parte da arquitetura existente.

---

# 4.34 Ciclo de vida de um pagamento

O ciclo de vida simplificado de um pagamento é o seguinte:

```text
Reserva criada
    |
    ▼
PagamentoService
    |
    ▼
Pagamento criado automaticamente
    |
    ▼
Estado pendente
    |
    +-- Pagamento simulado com sucesso
    |       |
    |       ▼
    |   Estado pago
    |
    +-- Cancelamento
            |
            ▼
        Estado cancelado
```

O pagamento mantém uma referência única que permite identificá-lo independentemente do ID interno.

---

# 4.35 Segurança dos pagamentos

O módulo de pagamentos utiliza diferentes mecanismos de proteção:

* autenticação;
* middleware `active`;
* `PagamentoPolicy`;
* validação com Form Requests;
* referências únicas;
* associação obrigatória a uma reserva;
* verificação do proprietário da reserva;
* restrição de operações por estado;
* utilização de Service para consistência das transições.

Os utilizadores comuns apenas podem consultar ou operar sobre pagamentos associados às próprias reservas, de acordo com as regras da Policy.

---

# 4.36 Dashboard

O Dashboard apresenta uma visão resumida da utilização da plataforma.

Entre os elementos apresentados encontram-se:

* cartões com indicadores;
* número de reservas;
* número de secretárias;
* estados de ocupação;
* próximas reservas;
* informação de disponibilidade;
* estatísticas;
* mapa interativo.

O fluxo de carregamento pode ser representado da seguinte forma:

```text
DashboardController
    |
    +-- Consultas agregadas
    +-- Próximas reservas
    +-- Estatísticas
    +-- Dados do mapa
    |
    ▼
Inertia::render()
    |
    ▼
Dashboard React
```

O Controller utiliza eager loading e consultas agregadas para reduzir o número de acessos à base de dados.

---

# 4.37 Cartões e indicadores

Os cartões do Dashboard permitem apresentar informação resumida.

Exemplos de indicadores:

* reservas existentes;
* reservas ativas;
* secretárias livres;
* secretárias ocupadas;
* edifícios;
* utilizadores;
* pedidos de suporte;
* pagamentos.

Os cartões são implementados como componentes React reutilizáveis.

---

# 4.38 Próximas reservas

A área de próximas reservas apresenta as reservas futuras relevantes para o utilizador autenticado.

As informações podem incluir:

* data;
* período;
* edifício;
* piso;
* setor;
* secretária;
* estado;
* pagamento;
* opção de check-in, quando aplicável.

As relações são carregadas antecipadamente no backend para evitar múltiplas consultas.

---

# 4.39 Estatísticas

O sistema apresenta estatísticas relacionadas com a utilização dos espaços.

Podem ser incluídos indicadores como:

* número de reservas por período;
* ocupação por piso;
* ocupação por setor;
* distribuição por estado;
* secretárias disponíveis;
* utilização diária;
* próximas reservas.

As estatísticas são calculadas no backend e enviadas aos componentes React através do Inertia.

---

# 4.40 Help Center

O SpaceHub inclui um Help Center constituído por dois módulos principais:

* FAQs;
* pedidos de suporte.

O objetivo é permitir que os utilizadores encontrem respostas a questões frequentes e solicitem apoio quando necessário.

---

## 4.40.1 FAQs

O módulo de FAQs permite gerir perguntas e respostas frequentes.

As funcionalidades podem incluir:

* listar FAQs;
* pesquisar;
* filtrar;
* criar;
* editar;
* ativar;
* desativar;
* eliminar, quando permitido.

As FAQs podem ser administradas por utilizadores com permissões adequadas e consultadas pelos restantes utilizadores.

---

## 4.40.2 Pedidos de suporte

O módulo de pedidos de suporte permite ao utilizador submeter um pedido relacionado com a plataforma.

Um pedido pode incluir:

* assunto;
* descrição;
* utilizador;
* estado;
* prioridade;
* datas;
* resposta ou acompanhamento.

O módulo está integrado com:

* autenticação;
* Policies;
* validação;
* persistência;
* interface React.

---

# 4.41 Eventos internos

O Laravel disponibiliza um sistema de eventos que permite desacoplar ações.

Um evento representa algo que ocorreu na aplicação.

No SpaceHub, os eventos podem ser utilizados para situações como:

* criação de reserva;
* atualização de reserva;
* cancelamento;
* check-in;
* expiração;
* alteração do mapa;
* atualização do dashboard;
* criação de pagamento;
* confirmação de pagamento.

A utilização de eventos permite que diferentes partes do sistema reajam sem que o Controller conheça diretamente todas as ações secundárias.

---

# 4.42 Evento MapaAtualizado

Sempre que ocorre uma alteração relevante que afeta a ocupação dos espaços, o sistema pode emitir o evento:

```text
MapaAtualizado
```

Este evento permite notificar os clientes ligados à aplicação.

Exemplos de ações que podem originar uma atualização:

* criação de uma reserva;
* cancelamento;
* check-in;
* expiração;
* alteração de uma secretária;
* mudança do estado de disponibilidade.

Fluxo simplificado:

```text
Alteração numa reserva
    |
    ▼
Evento MapaAtualizado
    |
    ▼
Broadcast
    |
    ▼
Laravel Reverb
    |
    ▼
Laravel Echo
    |
    ▼
Componente React
    |
    ▼
Atualização do mapa
```

---

# 4.43 Laravel Reverb

O Laravel Reverb é utilizado como servidor WebSocket da aplicação.

A sua função é permitir comunicação em tempo real entre o backend e os clientes ligados.

Ao contrário de pedidos HTTP tradicionais, nos quais o cliente tem de solicitar novamente os dados, o WebSocket permite que o servidor envie uma notificação assim que ocorre uma alteração.

O Reverb pode ser utilizado para:

* atualizar o mapa;
* atualizar o dashboard;
* refletir alterações de reservas;
* atualizar indicadores;
* preparar funcionalidades de chat;
* apresentar notificações em tempo real.

---

# 4.44 Laravel Echo

No frontend, o Laravel Echo é responsável por subscrever canais e ouvir eventos transmitidos pelo backend.

Exemplo conceptual:

```javascript
window.Echo
    .channel('mapa')
    .listen('MapaAtualizado', () => {
        router.reload({
            only: ['secretarias'],
        });
    });
```

Quando o evento é recebido, o componente pode:

* recarregar apenas determinadas propriedades Inertia;
* atualizar o estado local;
* apresentar uma notificação;
* voltar a consultar os dados necessários.

Esta abordagem evita recarregar a página completa.

---

# 4.45 Canais de broadcasting

Os eventos podem ser transmitidos através de:

* canais públicos;
* canais privados;
* canais de presença.

Os canais privados exigem autenticação e são adequados para informação restrita.

A definição e autorização dos canais é realizada através da configuração de broadcasting e do ficheiro de canais da aplicação.

A escolha do tipo de canal depende da sensibilidade dos dados transmitidos.

---

# 4.46 Atualização em tempo real

A atualização em tempo real melhora a experiência do utilizador em cenários nos quais o estado do sistema pode mudar enquanto várias pessoas utilizam a aplicação.

Exemplo:

1. um utilizador reserva uma secretária;
2. a reserva é guardada;
3. o backend emite um evento;
4. o Reverb transmite o evento;
5. os restantes utilizadores recebem a atualização;
6. a secretária deixa de ser apresentada como livre.

Este processo reduz inconsistências visuais e evita que o utilizador tenha de atualizar manualmente a página.

---

# 4.47 Scheduler e tarefas automáticas

O Laravel Scheduler é utilizado para executar tarefas periódicas.

No projeto, uma das principais tarefas é a verificação de reservas expiradas.

O Scheduler permite definir a frequência de execução sem colocar essa responsabilidade no frontend ou nos pedidos dos utilizadores.

Exemplo conceptual:

```php
Schedule::command('reservas:cancelar-expiradas')
    ->everyMinute();
```

Em ambiente de produção, o servidor deverá executar periodicamente:

```bash
php artisan schedule:run
```

ou manter um processo adequado ao Scheduler.

---

# 4.48 Seeders

Os Seeders permitem inserir dados iniciais e dados de demonstração.

Entre os Seeders do projeto encontram-se:

* `RoleSeeder`;
* `PeriodoSeeder`;
* `EstadoReservaSeeder`;
* `SpaceHubEstruturaSeeder`;
* `UserSeeder`;
* `ReservaSeeder`;
* `FaqSeeder`.

Os Seeders permitem preparar rapidamente um ambiente funcional.

Exemplo de execução:

```bash
php artisan migrate:fresh --seed
```

A utilização de Seeders facilita:

* desenvolvimento;
* testes manuais;
* demonstrações;
* instalação;
* preparação do ambiente académico.

---

# 4.49 Factories

As Factories são utilizadas principalmente nos testes automatizados.

Permitem criar dados consistentes para Models como:

* utilizadores;
* reservas;
* edifícios;
* pisos;
* setores;
* secretárias;
* pagamentos.

Exemplo conceptual:

```php
$user = User::factory()->create();
```

As Factories reduzem duplicação nos testes e tornam os cenários mais legíveis.

---

# 4.50 Segurança da aplicação

A arquitetura de segurança utiliza vários mecanismos complementares.

Entre os principais encontram-se:

* autenticação;
* Laravel Sanctum;
* middleware;
* Policies;
* Gates;
* Form Requests;
* proteção CSRF;
* hashing de palavras-passe;
* validação de uploads;
* proteção contra mass assignment;
* controlo de utilizadores ativos;
* restrição de rotas por papel;
* validação de propriedade dos recursos;
* restrições na base de dados.

A segurança não depende apenas da interface.

Mesmo que um utilizador tente enviar manualmente um pedido HTTP, o backend volta a validar:

* identidade;
* estado da conta;
* papel;
* permissão;
* dados recebidos;
* existência das relações;
* regras de negócio.

---

# 4.51 Proteção contra mass assignment

Os Models definem explicitamente os atributos que podem ser preenchidos em massa através da propriedade:

```php
$fillable
```

Exemplo:

```php
protected $fillable = [
    'nome',
    'email',
    'role_id',
    'ativo',
];
```

Esta abordagem impede que atributos não autorizados sejam alterados através de pedidos manipulados.

---

# 4.52 Casts

Os Models utilizam casts para garantir que determinados atributos são tratados com o tipo adequado.

Exemplos:

* valores booleanos;
* datas;
* datas e horas;
* valores decimais;
* enums ou estados, quando aplicável.

Exemplo conceptual:

```php
protected function casts(): array
{
    return [
        'ativo' => 'boolean',
        'data' => 'date',
        'valor' => 'decimal:2',
    ];
}
```

---

# 4.53 Transações

Operações que alteram múltiplas entidades relacionadas podem utilizar transações de base de dados.

Um exemplo é a criação de uma reserva acompanhada pela criação automática do respetivo pagamento.

Fluxo conceptual:

```text
Início da transação
    |
    +-- Criar reserva
    |
    +-- Criar pagamento
    |
    +-- Emitir alterações necessárias
    |
    +-- Confirmar transação
```

Se uma das operações falhar, a transação pode ser revertida, evitando dados incompletos.

Exemplo conceptual:

```php
DB::transaction(function () use ($dados) {
    $reserva = Reserva::create($dados);

    app(PagamentoService::class)
        ->criarParaReserva($reserva);
});
```

---

# 4.54 Tratamento de erros

O tratamento de erros segue os mecanismos disponibilizados pelo Laravel.

Podem ser devolvidos:

* erros de validação;
* respostas 401 para utilizadores não autenticados;
* respostas 403 para utilizadores sem permissão;
* respostas 404 para recursos inexistentes;
* respostas 422 para dados inválidos;
* respostas 500 para erros inesperados.

Na interface Inertia, os erros de validação são disponibilizados aos componentes React e apresentados junto aos campos correspondentes.

---

# 4.55 Logging

O Laravel disponibiliza um sistema de logging utilizado para registar erros e informação relevante.

Os logs podem ser utilizados para:

* analisar exceções;
* verificar falhas de pagamentos;
* acompanhar tarefas automáticas;
* investigar problemas de broadcasting;
* confirmar execução do Scheduler;
* identificar falhas de uploads.

A arquitetura permite evoluir para um sistema de auditoria administrativa mais completo.

---

# 4.56 Desempenho

Foram aplicadas várias medidas para melhorar o desempenho:

* eager loading;
* paginação;
* seleção de relações necessárias;
* consultas agregadas;
* reutilização de componentes;
* compilação com Vite;
* atualização parcial com Inertia;
* comunicação em tempo real sem polling constante;
* utilização de índices e chaves estrangeiras;
* carregamento condicional de dados.

A aplicação deve evitar carregar grandes quantidades de registos sem paginação.

---

# 4.57 Cache e otimização

O Laravel permite otimizar a aplicação através de comandos como:

```bash
php artisan optimize
```

Durante o desenvolvimento e após alterações estruturais, são utilizados comandos como:

```bash
php artisan optimize:clear
```

Podem ainda ser utilizados mecanismos de cache para:

* configuração;
* rotas;
* Views;
* resultados de consultas;
* dados estatísticos pouco voláteis.

A utilização de cache deverá considerar as atualizações em tempo real e a necessidade de invalidar dados alterados.

---

# 4.58 Estrutura completa do projeto

A estrutura principal do projeto pode ser representada da seguinte forma:

```text
SpaceHub/
│
├── app/
│   ├── Console/
│   │   └── Commands/
│   │
│   ├── Events/
│   │   └── MapaAtualizado.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── EdificioController.php
│   │   │   ├── PisoController.php
│   │   │   ├── SetorController.php
│   │   │   ├── SecretariaController.php
│   │   │   ├── ReservaController.php
│   │   │   ├── PagamentoController.php
│   │   │   ├── MapaController.php
│   │   │   ├── CheckinController.php
│   │   │   ├── FaqController.php
│   │   │   ├── PedidoSuporteController.php
│   │   │   └── UserController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── EnsureUserIsActive.php
│   │   │   └── RoleMiddleware.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── StoreUserRequest.php
│   │   │   ├── UpdateUserRequest.php
│   │   │   ├── StoreReservaRequest.php
│   │   │   ├── UpdateReservaRequest.php
│   │   │   └── ...
│   │   │
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── ReservaResource.php
│   │       └── ...
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Edificio.php
│   │   ├── Piso.php
│   │   ├── Setor.php
│   │   ├── Secretaria.php
│   │   ├── Reserva.php
│   │   ├── Periodo.php
│   │   ├── EstadoReserva.php
│   │   ├── Pagamento.php
│   │   ├── Faq.php
│   │   └── PedidoSuporte.php
│   │
│   ├── Policies/
│   │   ├── UserPolicy.php
│   │   ├── ReservaPolicy.php
│   │   ├── EdificioPolicy.php
│   │   ├── PisoPolicy.php
│   │   ├── SetorPolicy.php
│   │   ├── SecretariaPolicy.php
│   │   └── PagamentoPolicy.php
│   │
│   ├── Providers/
│   │
│   └── Services/
│       └── PagamentoService.php
│
├── bootstrap/
│   └── app.php
│
├── config/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── docs/
│   ├── 01-Introducao.md
│   ├── 02-Requisitos.md
│   ├── 03-ModeloDados.md
│   ├── 04-Arquitetura.md
│   ├── 05-API.md
│   ├── 06-Roadmap.md
│   ├── 07-Testes.md
│   └── 08-PROJECT_CONTEXT.md
│
├── public/
│   └── storage/
│
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   ├── Pages/
│   │   ├── app.jsx
│   │   └── bootstrap.js
│   │
│   ├── css/
│   └── views/
│
├── routes/
│   ├── api.php
│   ├── channels.php
│   ├── console.php
│   └── web.php
│
├── storage/
│   ├── app/
│   │   └── public/
│   ├── framework/
│   └── logs/
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
├── composer.json
├── package.json
├── phpunit.xml
└── vite.config.js
```

A representação anterior apresenta a organização conceptual do projeto. Alguns ficheiros podem variar de acordo com a versão exata implementada.

---

# 4.59 Testes automatizados

O projeto possui uma suíte de testes automatizados desenvolvida com PHPUnit e com as ferramentas de teste do Laravel.

Os testes encontram-se organizados principalmente em:

```text
tests/
 ├── Feature/
 └── Unit/
```

Os Feature Tests validam o comportamento da aplicação através de pedidos, autenticação, base de dados, Policies e respostas.

Os Unit Tests validam componentes isolados, como Services ou regras específicas.

---

## 4.59.1 Áreas cobertas pelos testes

Os testes automatizados cobrem, entre outras áreas:

* autenticação;
* registo;
* login;
* logout;
* recuperação de palavra-passe;
* redefinição de palavra-passe;
* atualização de perfil;
* utilizadores inativos;
* middleware;
* Policies;
* autorização;
* gestão de utilizadores;
* edifícios;
* pisos;
* setores;
* secretárias;
* reservas;
* disponibilidade;
* conflitos;
* cancelamento;
* histórico;
* dashboard;
* mapa;
* QR Code;
* check-in;
* expiração automática;
* uploads;
* pagamentos;
* Services;
* filtros;
* paginação;
* Help Center.

---

## 4.59.2 Testes de autenticação

Os testes de autenticação verificam cenários como:

* acesso de utilizadores autenticados;
* rejeição de credenciais inválidas;
* criação de sessão;
* emissão de tokens;
* logout;
* recuperação de palavra-passe;
* redefinição de palavra-passe;
* bloqueio de utilizadores inativos.

---

## 4.59.3 Testes de autorização

Os testes de autorização verificam:

* respostas 401 para utilizadores não autenticados;
* respostas 403 para utilizadores sem permissão;
* acesso de administradores;
* acesso de gestores;
* acesso de colaboradores;
* acesso de utilizadores;
* propriedade das reservas;
* acesso a pagamentos próprios;
* operações administrativas;
* proteção dos módulos de espaços.

---

## 4.59.4 Testes de Policies

As Policies são testadas diretamente para garantir que as regras de autorização permanecem corretas.

Entre as Policies testadas encontram-se:

* `UserPolicy`;
* `ReservaPolicy`;
* `EdificioPolicy`;
* `PisoPolicy`;
* `SetorPolicy`;
* `SecretariaPolicy`;
* `PagamentoPolicy`.

---

## 4.59.5 Testes de reservas

Os testes de reservas verificam:

* criação;
* listagem;
* atualização;
* cancelamento;
* disponibilidade;
* conflitos;
* acesso às próprias reservas;
* proibição de acesso a reservas de outros utilizadores;
* comportamento dos administradores;
* estados;
* expiração;
* integração com check-in.

---

## 4.59.6 Testes de pagamentos

Os testes de pagamentos verificam:

* criação automática;
* associação à reserva;
* cálculo do valor;
* atualização do valor;
* geração de referência;
* confirmação;
* cancelamento;
* filtros;
* paginação;
* histórico;
* permissões;
* comportamento do `PagamentoService`.

---

## 4.59.7 Testes de uploads

Os testes de uploads verificam:

* aceitação de ficheiros válidos;
* rejeição de tipos inválidos;
* limites de tamanho;
* armazenamento;
* atualização do caminho;
* substituição de ficheiros;
* associação ao utilizador ou ao piso.

---

## 4.59.8 Estado atual da suíte

À data da atualização desta documentação, a suíte apresenta o seguinte resultado:

```text
154 testes executados
154 testes aprovados
0 testes falhados
```

Este resultado demonstra que as principais funcionalidades e regras de segurança se encontram validadas.

---

# 4.60 Processo de validação

Durante o desenvolvimento, são utilizados comandos como:

```bash
php artisan optimize:clear
```

```bash
composer dump-autoload
```

```bash
php artisan test
```

```bash
php artisan route:list
```

Para o frontend são utilizados:

```bash
npm install
```

```bash
npm run build
```

Em ambientes Windows nos quais a execução de scripts PowerShell esteja limitada, pode ser utilizado:

```bash
npm.cmd install
```

e:

```bash
npm.cmd run build
```

Este processo permite validar:

* carregamento das classes;
* rotas;
* testes;
* compilação do frontend;
* dependências;
* integração entre backend e frontend.

---

# 4.61 Princípios de desenvolvimento

Durante o desenvolvimento do SpaceHub foram seguidos vários princípios e boas práticas.

Entre eles destacam-se:

* separação de responsabilidades;
* arquitetura em camadas;
* utilização do padrão MVC;
* Controllers com função de coordenação;
* utilização de Services para regras complexas;
* utilização de Form Requests;
* utilização de Resources;
* utilização de Policies;
* utilização de middleware;
* utilização do Eloquent ORM;
* eager loading;
* paginação;
* validação no servidor;
* proteção contra mass assignment;
* eventos para reduzir acoplamento;
* atualização em tempo real;
* componentes React reutilizáveis;
* testes automatizados;
* nomes descritivos;
* tipagem explícita sempre que possível;
* preservação da integridade referencial;
* utilização das convenções do Laravel.

---

# 4.62 Manutenibilidade

A arquitetura favorece a manutenção porque cada responsabilidade se encontra numa camada adequada.

Por exemplo:

* alterações visuais são realizadas nos componentes React;
* alterações de validação são realizadas nos Form Requests;
* alterações de permissões são realizadas nas Policies;
* alterações do fluxo de pagamento são realizadas no `PagamentoService`;
* alterações de persistência são realizadas nos Models e migrations;
* alterações de tempo real são realizadas nos eventos e canais;
* alterações de rotas são realizadas nos respetivos ficheiros de rotas.

Esta separação reduz a probabilidade de uma alteração local provocar efeitos inesperados noutros módulos.

---

# 4.63 Extensibilidade

A arquitetura está preparada para novas funcionalidades.

Entre as possíveis evoluções encontram-se:

* integração com gateways reais de pagamento;
* notificações por correio eletrónico;
* notificações na aplicação;
* calendário Google;
* calendário Microsoft Outlook;
* mensagens do dia;
* comunicados administrativos;
* avaliações;
* relatórios;
* exportação de dados;
* auditoria;
* novos métodos de pagamento;
* novas regras de reserva;
* novas estatísticas;
* aplicações móveis;
* integração com sistemas externos.

A utilização de Services, eventos, Policies e interfaces separadas reduz o impacto destas evoluções.

---

# 4.64 Escalabilidade

A aplicação foi desenvolvida para permitir crescimento gradual.

Algumas características que contribuem para a escalabilidade incluem:

* paginação;
* eager loading;
* separação por módulos;
* utilização de WebSockets;
* possibilidade de filas;
* Scheduler;
* Services;
* base de dados relacional;
* índices;
* autenticação desacoplada através de Sanctum;
* frontend componentizado.

Em cenários de maior utilização, poderão ser adicionados:

* Redis;
* filas de processamento;
* cache distribuída;
* múltiplos workers;
* balanceamento de carga;
* armazenamento externo;
* monitorização;
* serviços externos de broadcasting.

---

# 4.65 Integração entre módulos

Os módulos do SpaceHub não funcionam de forma isolada.

Existem integrações importantes, como:

```text
Utilizador
    |
    +-- Reserva
            |
            +-- Secretária
            |      |
            |      +-- Setor
            |             |
            |             +-- Piso
            |                    |
            |                    +-- Edifício
            |
            +-- Período
            |
            +-- Estado
            |
            +-- Pagamento
            |
            +-- Check-in
```

O Dashboard consulta informação de vários módulos.

O mapa depende da estrutura dos espaços e das reservas.

O pagamento depende da reserva.

O check-in depende do utilizador, da reserva e da secretária.

O Reverb permite refletir alterações destes módulos na interface.

---

# 4.66 Fluxo completo de uma reserva

O fluxo completo de uma reserva pode ser representado da seguinte forma:

```text
Utilizador autenticado
    |
    ▼
Consulta de disponibilidade
    |
    ▼
Seleção de data, período e secretária
    |
    ▼
StoreReservaRequest
    |
    ▼
ReservaPolicy
    |
    ▼
Verificação de conflitos
    |
    +-- Existe conflito --> Pedido rejeitado
    |
    +-- Não existe conflito
            |
            ▼
       Reserva criada
            |
            ▼
    PagamentoService
            |
            ▼
    Pagamento criado
            |
            ▼
    Evento de atualização
            |
            ▼
       Laravel Reverb
            |
            ▼
    Atualização da interface
            |
            ▼
     Check-in por QR Code
            |
            ▼
    Reserva confirmada
```

---

# 4.67 Fluxo completo de um pagamento

O fluxo de pagamento pode ser representado da seguinte forma:

```text
Reserva criada ou atualizada
    |
    ▼
PagamentoService
    |
    +-- Determina valor
    |
    +-- Gera referência única
    |
    +-- Cria ou atualiza Pagamento
    |
    ▼
Utilizador seleciona método
    |
    ▼
Simulação de processamento
    |
    +-- Sucesso --> Pagamento confirmado
    |
    +-- Cancelamento --> Pagamento cancelado
    |
    ▼
Histórico disponível
```

---

# 4.68 Fluxo de autorização

O fluxo de autorização pode ser representado da seguinte forma:

```text
Pedido HTTP
    |
    ▼
Middleware de autenticação
    |
    +-- Não autenticado --> 401 / redirecionamento
    |
    ▼
Middleware active
    |
    +-- Utilizador inativo --> 403
    |
    ▼
Middleware role, quando aplicável
    |
    +-- Papel inválido --> 403
    |
    ▼
Policy
    |
    +-- Operação não autorizada --> 403
    |
    ▼
Form Request
    |
    +-- Dados inválidos --> 422
    |
    ▼
Controller / Service
```

A utilização de várias camadas de segurança permite aplicar defesa em profundidade.

---

# 4.69 Decisões arquiteturais

As principais decisões arquiteturais do SpaceHub incluem:

1. utilização do Laravel 12 como framework principal;
2. utilização do padrão MVC;
3. utilização de React para a interface;
4. utilização do Inertia.js como ponte entre Laravel e React;
5. utilização do Tailwind CSS;
6. utilização do Sanctum para autenticação da API;
7. utilização de Policies para autorização;
8. utilização de middleware para utilizadores ativos e papéis;
9. utilização de Form Requests para validação;
10. utilização de Eloquent para persistência;
11. utilização de Services para lógica de negócio complexa;
12. utilização de eventos e Reverb para tempo real;
13. utilização de QR Code para check-in;
14. utilização de eager loading;
15. utilização de paginação;
16. utilização de testes automatizados;
17. integração dos pagamentos com as reservas;
18. separação das rotas web e API;
19. organização modular da documentação;
20. preparação para evolução futura.

---

# 4.70 Limitações atuais

Apesar da arquitetura estar preparada para evolução, existem limitações assumidas na versão atual.

Entre elas:

* os pagamentos são simulados;
* não existe movimentação financeira real;
* algumas integrações externas ainda não foram implementadas;
* o sistema depende da execução correta do Scheduler;
* a atualização em tempo real depende do funcionamento do Reverb;
* o armazenamento utiliza a configuração atual do Laravel;
* algumas funcionalidades avançadas de auditoria permanecem como evolução futura.

Estas limitações não comprometem os objetivos académicos nem a demonstração das funcionalidades implementadas.

---

# 4.71 Considerações finais

A arquitetura adotada no SpaceHub permite manter uma organização consistente entre os diferentes componentes da aplicação.

A utilização do Laravel 12 fornece uma base sólida para:

* rotas;
* autenticação;
* autorização;
* validação;
* persistência;
* eventos;
* tarefas agendadas;
* testes;
* segurança.

A utilização de React e Inertia.js permite desenvolver uma interface moderna e dinâmica, mantendo a lógica e a segurança centralizadas no backend.

O módulo de pagamentos demonstra a utilização de uma camada Service para centralizar regras de negócio.

O Help Center demonstra a capacidade de adicionar novos módulos sem alterar a estrutura principal.

O mapa, o QR Code e o check-in demonstram a integração entre dados físicos, reservas e interação do utilizador.

O Laravel Reverb permite refletir alterações relevantes em tempo real.

A utilização de eager loading, paginação e componentes reutilizáveis contribui para o desempenho e a manutenibilidade.

A suíte composta por **154 testes automatizados, todos aprovados**, reforça a estabilidade do sistema e reduz o risco de regressões durante alterações futuras.

Desta forma, o SpaceHub apresenta uma arquitetura modular, segura, extensível e adequada aos objetivos definidos para o projeto académico.
