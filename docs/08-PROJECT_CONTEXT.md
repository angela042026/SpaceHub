# Documento Mestre do Projeto — SpaceHub

**Versão:** 2.1
**Estado:** Revisão final e preparação da entrega
**Framework:** Laravel 12 + Sanctum + Inertia.js + React + Tailwind CSS
**Base de dados:** MySQL
**Testes automatizados:** 154 testes aprovados
**Comunicação em tempo real:** Laravel Reverb e Laravel Echo
**Funcionalidades principais:** Gestão de espaços, reservas, pagamentos, Help Center, QR Code, dashboard e mapa interativo


---

# 1. Finalidade deste Documento

Este documento funciona como resumo técnico e contexto permanente do projeto SpaceHub.

Deve ser utilizado para:

- contextualizar novas conversas sobre o projeto;
- preservar as decisões técnicas já tomadas;
- evitar alterações incompatíveis com a arquitetura existente;
- acompanhar o estado atual do desenvolvimento;
- registar funcionalidades, integrações e convenções;
- orientar os passos finais até à entrega.

Este documento não substitui a documentação funcional e técnica existente na pasta `docs`.

---

# 2. Objetivo do Projeto

O SpaceHub é uma aplicação web para gestão de espaços de trabalho colaborativos e reserva de secretárias.

O sistema permite:

- gerir edifícios;
- gerir pisos;
- gerir setores;
- gerir secretárias;
- gerir utilizadores;
- controlar acessos através de papéis;
- consultar secretárias livres e ocupadas;
- efetuar reservas por data e período;
- cancelar reservas elegíveis;
- realizar check-in através de QR Code;
- consultar estatísticas e dashboards;
- visualizar mapas interativos dos espaços;
- reportar problemas e pedidos de suporte;
- consultar FAQs e conteúdos de ajuda;
- carregar fotografias de utilizadores;
- carregar plantas dos pisos.

* associar pagamentos às reservas;
* acompanhar o estado dos pagamentos;
* simular a confirmação e o cancelamento de pagamentos;
* consultar o histórico de pagamentos;
* disponibilizar comunicação em tempo real;
* atualizar o mapa e outros componentes através de eventos;
* executar tarefas automáticas através do Scheduler do Laravel;
* expirar automaticamente reservas sem check-in dentro do prazo definido.


---

# 3. Decisões Funcionais Principais

## 3.1 Edifício substitui Localidade

A entidade inicialmente designada por `Localidade` foi substituída por `Edificio`.

A hierarquia final dos espaços é:

```text
Edifício
    ↓
Piso
    ↓
Setor
    ↓
Secretária
```

Não deve ser criado um novo módulo de Localidades.

Qualquer migration antiga de localidades deve ser considerada código legado e não deve ser utilizada na versão final.

---

## 3.2 Eliminação lógica

As principais entidades não são eliminadas fisicamente.

É utilizado o campo:

```text
ativo
```

para ativar ou desativar:

- utilizadores;
- edifícios;
- pisos;
- setores;
- secretárias.

Não devem ser adicionados métodos `destroy()` sem uma decisão explícita de alteração desta regra.

---

## 3.3 Papéis fixos

Os papéis existentes são:

- Administrador;
- Gestor;
- Colaborador;
- Utilizador.

Os papéis são criados através de seeders.

Não existe CRUD de papéis.

---

## 3.4 Estados das reservas

Os estados implementados são:

- `pendente`;
- `confirmada`;
- `cancelada`;
- `expirada`.

O estado `concluida` não está implementado.

Não deve ser adicionado sem definir previamente:

- quando ocorre a transição;
- qual o processo responsável;
- impacto no dashboard;
- impacto nas estatísticas;
- testes necessários.

## 3.5 Pagamentos associados às reservas

O SpaceHub inclui um módulo de pagamentos associado ao processo de reserva.

Cada pagamento:

* pertence a uma reserva;
* possui um valor;
* possui um método de pagamento;
* possui um estado;
* possui uma referência única;
* pode ser confirmado ou cancelado;
* mantém a data da confirmação, quando aplicável.

Os estados previstos para os pagamentos são:

* `pendente`;
* `pago`;
* `cancelado`.

Os métodos de pagamento são tratados de forma simulada no contexto académico do projeto, não existindo movimentação financeira real.

A integração com fornecedores externos de pagamentos poderá ser realizada numa evolução futura.


---

# 4. Arquitetura Geral

O SpaceHub utiliza Laravel no backend e React com Inertia.js no frontend.

## 4.1 Backend

O backend utiliza:

- Laravel 12;
- PHP 8;
- Eloquent ORM;
- Laravel Sanctum;
- Form Requests;
- API Resources;
- Policies;
- Gates;
- Middleware;
- Events;
- Broadcasting;
- Storage;
- PHPUnit.

---

## 4.2 Frontend

O frontend utiliza:

- React;
- Inertia.js;
- Tailwind CSS;
- Vite;
- Recharts;
- Simple QR Code;
- html5-qrcode;
- Laravel Echo;
- Laravel Reverb.

---

## 4.3 Base de dados

```text
Role
User
Edificio
Piso
Setor
Secretaria
Periodo
EstadoReserva
Reserva
Pagamento
Faq
PedidoSuporte
```

A estrutura principal das relações é:

```text
Role
  ↓
User
  ↓
Reserva
  ↓
Pagamento
```

```text
Edificio
  ↓
Piso
  ↓
Setor
  ↓
Secretaria
  ↓
Reserva
```

Existem ainda tabelas técnicas do Laravel, nomeadamente:

* `sessions`;
* `password_reset_tokens`;
* `personal_access_tokens`;
* `cache`;
* `cache_locks`;
* `jobs`;
* `job_batches`;
* `failed_jobs`.


# 5. Organização do Backend

## 5.1 API

Os Controllers da API encontram-se em:

```text
app/Http/Controllers/Api
```

O padrão preferencial dos CRUD é:

```text
Route
    ↓
Controller
    ↓
Form Request
    ↓
Policy / Gate
    ↓
Model
    ↓
Resource
    ↓
JSON
```

---

## 5.2 Aplicação Web

Os Controllers das páginas web encontram-se em:

```text
app/Http/Controllers
```

O fluxo principal é:

```text
Route Web
    ↓
Controller
    ↓
Model ou Service
    ↓
Inertia
    ↓
React
```

---

## 5.3 Models

Os Models representam as entidades persistentes e utilizam relações Eloquent.

Exemplos:

```php
public function edificio(): BelongsTo
{
    return $this->belongsTo(Edificio::class);
}
```

```php
public function pisos(): HasMany
{
    return $this->hasMany(Piso::class);
}
```

Devem ser preferidas relações Eloquent em vez de queries manuais repetidas.

---

## 5.4 Form Requests

A validação dos CRUD deve ser realizada em:

```text
StoreXXXXXRequest
UpdateXXXXXRequest
```
StorePagamentoRequest
UpdatePagamentoRequest

Exemplos:

```text
StoreUserRequest
UpdateUserRequest
StoreEdificioRequest
UpdateEdificioRequest
StorePisoRequest
UpdatePisoRequest
StoreSetorRequest
UpdateSetorRequest
StoreSecretariaRequest
UpdateSecretariaRequest
StoreReservaRequest
UpdateReservaRequest
```

Nos endpoints de autenticação, o `AuthController` utiliza validação direta por se tratar de operações específicas e não de CRUD administrativo.

---

## 5.5 Resources

Os endpoints da API devem devolver Resources.

Exemplos:

```text
UserResource
EdificioResource
PisoResource
SetorResource
SecretariaResource
ReservaResource
PagamentoResource
```

Deve ser evitada a exposição direta de Models em respostas JSON.

---

## 5.6 Route Model Binding

Deve ser utilizado Route Model Binding.

Correto:

```php
public function show(User $user): UserResource
```

Evitar:

```php
public function show(int $id)
{
    $user = User::findOrFail($id);
}
```

---

## 5.7 Passwords

As passwords devem ser sempre protegidas por hashing.

Utilizar:

```php
Hash::make($password)
```

O Model `User` também utiliza o cast:

```php
'password' => 'hashed'
```

Nunca guardar passwords em texto simples.

## 5.8 Services

As regras de negócio que envolvem mais do que uma operação ou entidade podem ser organizadas em Services.

Este padrão é particularmente útil em operações como:

* criação de reservas;
* confirmação de pagamentos;
* cancelamento de pagamentos;
* expiração automática de reservas;
* atualização de estatísticas;
* emissão de eventos em tempo real.

A utilização de Services evita que os Controllers concentrem demasiadas responsabilidades e facilita a reutilização e o teste da lógica de negócio.


---

# 6. Autenticação

A API utiliza Laravel Sanctum.

Endpoints implementados:

- registo;
- login;
- logout;
- consulta do utilizador autenticado;
- pedido de recuperação de password;
- redefinição de password.

Rotas principais:

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
POST /api/forgot-password
POST /api/reset-password
```

As rotas privadas da API utilizam:

```text
auth:sanctum
```

As páginas privadas da aplicação web utilizam:

```text
auth
```

Utilizadores inativos:

- não podem iniciar sessão;
- são bloqueados nas Policies;
- não podem executar operações protegidas.

Após uma redefinição de password, os tokens Sanctum antigos são revogados.

---

# 7. Autorização

A autorização é realizada através de:

- Policies;
- Gates;
- Middleware de papéis.

Existe um middleware personalizado:

```text
RoleMiddleware
```

Alias registado:

```text
role
```

Exemplo de utilização:

```php
Route::middleware([
    'auth:sanctum',
    'role:Administrador',
]);
```

Nos Controllers da API é utilizado:

```php
Gate::authorize(...)
```

Policies principais:

```text
UserPolicy
EdificioPolicy
PisoPolicy
SetorPolicy
SecretariaPolicy
ReservaPolicy
```

A `ReservaPolicy` bloqueia globalmente utilizadores inativos através do método `before()`.

---

# 8. Gestão de Espaços

A gestão dos espaços segue a hierarquia:

```text
Edifício
    ↓
Piso
    ↓
Setor
    ↓
Secretária
```

## 8.1 Edifícios

Funcionalidades:

- listar;
- consultar;
- criar;
- atualizar;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- ativar ou desativar.

---

## 8.2 Pisos

Funcionalidades:

- listar;
- consultar;
- criar;
- atualizar;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- ativar ou desativar;
- carregar uma planta;
- substituir a planta existente.

As plantas são armazenadas em:

```text
storage/app/public/pisos/plantas
```

---

## 8.3 Setores

Funcionalidades:

- listar;
- consultar;
- criar;
- atualizar;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- ativar ou desativar;
- configurar tipo;
- configurar capacidade;
- configurar reservabilidade;
- posicionar no editor de mapa.

---

## 8.4 Secretárias

Funcionalidades:

- listar;
- consultar;
- criar;
- atualizar;
- filtrar;
- ordenar;
- paginar;
- ativar ou desativar;
- configurar características;
- configurar posição;
- gerar QR Code único.

Características disponíveis:

- monitor;
- dock USB;
- junto à janela;
- ergonómica;
- reservável;
- ativa.

---

# 9. Gestão de Utilizadores

Funcionalidades:

- listar utilizadores;
- consultar utilizador;
- criar utilizador;
- atualizar utilizador;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- alterar papel;
- ativar ou desativar;
- carregar fotografia;
- substituir fotografia.

As fotografias são armazenadas em:

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

Um Administrador não pode desativar a própria conta.

---

# 10. Reservas

O módulo de reservas suporta:

- criação de reservas;
- consulta de reservas;
- atualização;
- cancelamento;
- consulta de disponibilidade;
- validação de duplicações;
- validação de regras de negócio;
- atualização do mapa.
* associação de pagamentos;
* consulta do pagamento associado;
* expiração automática de reservas pendentes;
* execução de tarefas agendadas;
* emissão de eventos após alterações relevantes.

## 10.1 Regras principais

Uma secretária apenas pode possuir uma reserva ativa para a mesma data e período.

Um utilizador apenas pode possuir uma reserva para a mesma data e período.

Apenas secretárias:

- ativas;
- reserváveis;
- disponíveis

podem receber reservas.

Não podem ser atualizadas reservas:

- canceladas;
- expiradas;
- com check-in efetuado.

Não podem ser canceladas reservas:

- já canceladas;
- confirmadas;
- expiradas;
- com check-in.

O utilizador comum apenas pode cancelar reservas próprias, futuras e elegíveis.

---

## 10.2 Períodos

Os períodos implementados são:

- Manhã;
- Tarde.

---

## 10.3 Disponibilidade

A disponibilidade considera:

- data;
- período;
- estado da secretária;
- atributo reservável;
- reservas ativas existentes.

## 10.4 Expiração automática

As reservas pendentes podem ser automaticamente marcadas como expiradas quando o utilizador não realiza o check-in dentro do prazo estabelecido.

A aplicação utiliza um comando Artisan específico para identificar e atualizar reservas expiradas.

Exemplo:

```bash
php artisan reservas:cancelar-expiradas
```

O comando é executado periodicamente através do Scheduler do Laravel.

Esta automatização evita que reservas abandonadas continuem a bloquear secretárias que poderiam ser utilizadas por outros utilizadores.

## 10.5 Integração com pagamentos

Uma reserva pode originar um pagamento quando a utilização do espaço estiver sujeita a cobrança.

O pagamento mantém informação sobre:

* a reserva associada;
* o valor;
* o método escolhido;
* o estado;
* a referência;
* a data de confirmação.

No contexto académico, o pagamento é simulado e não comunica com instituições bancárias ou fornecedores externos.


---

# 11. Pagamentos

O módulo de pagamentos permite associar uma operação financeira simulada a uma reserva.

Funcionalidades implementadas:

* criação de pagamentos;
* associação do pagamento a uma reserva;
* geração de referência única;
* consulta do estado do pagamento;
* confirmação de pagamentos;
* cancelamento de pagamentos;
* consulta do histórico;
* validação das transições de estado;
* apresentação da informação no frontend;
* controlo de acesso às operações.

## 11.1 Estados dos pagamentos

Os estados utilizados são:

* `pendente`;
* `pago`;
* `cancelado`.

Um pagamento é inicialmente criado com o estado `pendente`.

Após confirmação, passa para o estado `pago`.

Quando é cancelado, passa para o estado `cancelado`.

## 11.2 Regras de negócio

As principais regras são:

* cada pagamento pertence obrigatoriamente a uma reserva;
* uma reserva não deve possuir pagamentos duplicados;
* o valor deve ser igual ou superior a zero;
* a referência deve ser única;
* apenas pagamentos pendentes podem ser confirmados;
* apenas pagamentos elegíveis podem ser cancelados;
* pagamentos pagos ou cancelados não devem regressar ao estado pendente;
* um utilizador apenas pode consultar pagamentos associados às suas próprias reservas, exceto quando possui permissões administrativas.

## 11.3 Natureza académica

O sistema de pagamentos foi implementado como uma simulação funcional.

Não existe comunicação com:

* bancos;
* redes de cartões;
* MB Way;
* gateways de pagamento;
* serviços financeiros externos.

Uma integração real com Stripe, PayPal, Ifthenpay, Eupago ou outro fornecedor deverá ser considerada trabalho futuro.


# 12. QR Code e Check-in

Cada secretária possui um `qr_token` único.

O QR Code permite iniciar o processo de check-in.

Durante o check-in são validados:

- utilizador autenticado;
- propriedade da reserva;
- data;
- período;
- secretária;
- QR Code;
- estado da reserva;
- inexistência de cancelamento.

Após check-in:

- é preenchido `check_in_at`;
- a reserva passa ao estado `confirmada`;
- o mapa é atualizado.

Tecnologias utilizadas:

- Simple QR Code;
- html5-qrcode.

---

# 13. Dashboard, Estatísticas e Mapa

Funcionalidades implementadas:

- dashboard;
- estatísticas;
- taxa de ocupação;
- reservas por período;
- reservas por estado;
- reservas por edifício;
- mapa interativo;
- editor gráfico dos setores;
- atualização do mapa em tempo real.

O evento utilizado para atualização do mapa é:

```text
MapaAtualizado
```

Tecnologias utilizadas:

- React;
- Inertia.js;
- Recharts;
- Broadcasting;
- Laravel Echo;
- Laravel Reverb.

---

# 14. Help Center e Suporte

# Help Center e Suporte

O SpaceHub disponibiliza uma área de apoio aos utilizadores.

Funcionalidades implementadas:

* consulta do Help Center;
* consulta de perguntas frequentes;
* organização das FAQs por categorias;
* apresentação apenas de conteúdos ativos;
* submissão de pedidos de suporte;
* reporte de problemas e avarias;
* acompanhamento do estado dos pedidos;
* resposta administrativa;
* associação dos pedidos ao utilizador autenticado.

Entidades principais:

```text
Faq
PedidoSuporte
```

Controllers principais:

```text
FaqController
PedidoSuporteController
```

Seeder associado:

```text
FaqSeeder
```

Os pedidos de suporte podem passar por diferentes estados, nomeadamente:

* aberto;
* em tratamento;
* resolvido;
* fechado.

O módulo permite centralizar pedidos de ajuda e reduzir a necessidade de comunicação externa para problemas relacionados com a utilização da plataforma ou dos espaços.


# 15. Sistema de Chat e WebSockets

Foi integrada uma funcionalidade experimental de comunicação em tempo real.

Componentes integrados:

- Laravel Reverb;
- Laravel Echo;
- Broadcasting;
- ChatController;
- evento `EnviarMensagem`;
- página React `TesteChat`;
- configuração de WebSockets.

Esta integração teve origem na branch:

```text
feature/update-eduardo
```

Fluxo de integração utilizado:

```text
feature/update-eduardo
        ↓
integration/update-eduardo
        ↓
Pull Request
        ↓
Create a merge commit
        ↓
main
```

A autoria dos commits foi preservada.

Não foi utilizado:

- rebase;
- Squash and merge;
- alteração do histórico da branch do c# Testes

O projeto utiliza PHPUnit para testes automatizados.

Situação atual:

```text
154 testes aprovados
```

Os testes cobrem:

* autenticação;
* registo;
* login;
* logout;
* recuperação de password;
* redefinição de password;
* revogação de tokens;
* autorização;
* Policies;
* Gates;
* Middleware;
* bloqueio de utilizadores inativos;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* reservas;
* disponibilidade;
* atualização de reservas;
* cancelamento;
* estados das reservas;
* expiração automática;
* check-in;
* QR Code;
* pagamentos;
* estados dos pagamentos;
* confirmação de pagamentos;
* cancelamento de pagamentos;
* dashboard;
* estatísticas;
* mapa interativo;
* atualização em tempo real;
* Help Center;
* FAQs;
* pedidos de suporte;
* uploads;
* substituição segura de ficheiros;
* pesquisa;
* filtros;
* ordenação;
* paginação;
* validação;
* integridade das relações;
* regras de negócio;
* performance de queries.

Comando principal:

```bash
php artisan test
```

Antes de uma integração ou entrega devem ser executados:

```bash
php artisan optimize:clear
composer dump-autoload
npm.cmd run build
php artisan test
php artisan route:list
```

No Windows PowerShell deve ser utilizado:

```bash
npm.cmd run build
```

caso a execução de `npm.ps1` esteja bloqueada pela política do sistema.

A aprovação dos 154 testes demonstra que as principais funcionalidades e regras de autorização permanecem estáveis após a integração dos diferentes módulos.
olaborador.

---

# 16. Testes

# Testes

O projeto utiliza PHPUnit para testes automatizados.

Situação atual:

```text
154 testes aprovados
```

Os testes cobrem:

* autenticação;
* registo;
* login;
* logout;
* recuperação de password;
* redefinição de password;
* revogação de tokens;
* autorização;
* Policies;
* Gates;
* Middleware;
* bloqueio de utilizadores inativos;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* reservas;
* disponibilidade;
* atualização de reservas;
* cancelamento;
* estados das reservas;
* expiração automática;
* check-in;
* QR Code;
* pagamentos;
* estados dos pagamentos;
* confirmação de pagamentos;
* cancelamento de pagamentos;
* dashboard;
* estatísticas;
* mapa interativo;
* atualização em tempo real;
* Help Center;
* FAQs;
* pedidos de suporte;
* uploads;
* substituição segura de ficheiros;
* pesquisa;
* filtros;
* ordenação;
* paginação;
* validação;
* integridade das relações;
* regras de negócio;
* performance de queries.

Comando principal:

```bash
php artisan test
```

Antes de uma integração ou entrega devem ser executados:

```bash
php artisan optimize:clear
composer dump-autoload
npm.cmd run build
php artisan test
php artisan route:list
```

No Windows PowerShell deve ser utilizado:

```bash
npm.cmd run build
```

caso a execução de `npm.ps1` esteja bloqueada pela política do sistema.

A aprovação dos 154 testes demonstra que as principais funcionalidades e regras de autorização permanecem estáveis após a integração dos diferentes módulos.


# 17. Rotas da API

# Rotas da API

A API encontra-se organizada por grupos funcionais e protegida através de autenticação, middleware e Policies.

Grupos principais:

* autenticação;
* utilizadores;
* edifícios;
* pisos;
* setores;
* secretárias;
* reservas;
* disponibilidade;
* pagamentos;
* Help Center;
* pedidos de suporte;
* ações de ativação e desativação;
* cancelamentos;
* operações administrativas.

O número total de rotas deve ser atualizado após a execução de:

```bash
php artisan route:list --path=api
```

As atualizações normais utilizam preferencialmente `PUT`.

As operações específicas, como ativação, cancelamento ou confirmação, utilizam `PATCH` ou `POST`, consoante a semântica definida na rota.

As funcionalidades de dashboard, mapa, QR Code, check-in, Help Center e comunicação em tempo real também podem utilizar rotas web específicas, não pertencendo obrigatoriamente ao prefixo `/api`.

As atualizações normais utilizam `PUT`.

Exemplos:

```text
PUT /api/users/{user}
PUT /api/edificios/{edificio}
PUT /api/pisos/{piso}
PUT /api/setores/{setor}
PUT /api/secretarias/{secretaria}
PUT /api/reservas/{reserva}
```

As operações especiais utilizam `PATCH`.

Exemplos:

```text
PATCH /api/users/{user}/toggle-ativo
PATCH /api/edificios/{edificio}/toggle-ativo
PATCH /api/pisos/{piso}/toggle-ativo
PATCH /api/setores/{setor}/toggle-ativo
PATCH /api/secretarias/{secretaria}/toggle-ativo
PATCH /api/reservas/{reserva}/cancelar
```

Existe atualmente uma rota técnica:

```text
GET /api/admin/teste
```

php artisan route:list --path=api

Esta rota deve ser revista antes da entrega final e removida caso já não seja necessária.

As funcionalidades de dashboard, mapa, QR Code e check-in utilizam rotas web específicas e não pertencem necessariamente ao grupo `/api`.

---

# 18. Seeders

Seeders principais:

```text
RoleSeeder
PeriodoSeeder
EstadoReservaSeeder
UserSeeder
SpaceHubEstruturaSeeder
ReservaSeeder
FaqSeeder
```

O projeto deve funcionar após:

```bash
php artisan migrate:fresh --seed
```

Estados criados pelo `EstadoReservaSeeder`:

```text
RoleSeeder
PeriodoSeeder
EstadoReservaSeeder
UserSeeder
SpaceHubEstruturaSeeder
ReservaSeeder
FaqSeeder
PagamentoSeeder
```

---

# 19. Uploads

Uploads implementados:

## Fotografia dos utilizadores

Diretório:

```text
storage/app/public/utilizadores/fotografias
```

## Planta dos pisos

Diretório:

```text
storage/app/public/pisos/plantas
```

O link público é criado através de:

```bash
php artisan storage:link
```

Os ficheiros antigos são removidos quando ocorre substituição bem-sucedida.

Se a gravação na base de dados falhar, o novo ficheiro é eliminado para evitar ficheiros órfãos.

---

# 20. Documentação Técnica

A pasta `docs` contém:

```text
01-Requisitos.md
02-CasosDeUso.md
03-ModeloBaseDados.md
04-Arquitetura.md
05-API.md
06-EvolucaoProjeto.md
07-DicionarioDados.md
08-DocumentoMestre.md
```

Finalidade dos documentos:

| Documento | Finalidade |
|-----------|------------|
| 01 — Requisitos | Requisitos funcionais, não funcionais e regras de negócio |
| 02 — Casos de Uso | Interações entre atores e sistema |
| 03 — Modelo da Base de Dados | Entidades, relações e decisões de modelação |
| 04 — Arquitetura | Estrutura técnica da aplicação |
| 05 — API | Endpoints, autenticação e respostas |
| 06 — Evolução do Projeto | Desenvolvimento e trabalho futuro |
| 07 — Dicionário de Dados | Tabelas e campos da base de dados |
| 08 — Documento Mestre | Contexto permanente e decisões consolidadas |

A documentação deve ser atualizada sempre que existirem alterações estruturais relevantes.

---

# 21. Git e Integração

O fluxo utilizado é:

```text
Branch de funcionalidade
        ↓
Commit
        ↓
Push
        ↓
Pull Request
        ↓
Create a merge commit
        ↓
main
```

Este fluxo permite:

- preservar autoria;
- manter o histórico completo;
- associar alterações a Pull Requests;
- facilitar revisão;
- evitar perda de commits.

Não apagar branches antes da validação.

Evitar `Squash and merge` quando for necessário preservar a autoria individual.

---

# 22. Integrações Realizadas

## Pull Request 1

Funcionalidades:

- Dashboard;
- Estatísticas;
- QR Code;
- Check-in;
- Mapa Interativo.

---

## Pull Request 2

Funcionalidades:

- histórico de reservas;
- funcionalidades adicionais do módulo de reservas.

---

## Pull Request 3

Funcionalidades:

- Help Center;
- FAQs;
- sistema de pedidos de suporte.

---

## Integração de julho de 2026

Branch:

```text
feature/update-eduardo
```

Funcionalidades:

- Laravel Reverb;
- Laravel Echo;
- Broadcasting;
- sistema de chat;
- WebSockets.

Validação executada na integração:

```bash
php artisan optimize:clear
composer dump-autoload
npm install
npm.cmd run build
php artisan test
php artisan route:list
```

---

# 23. Estado das Sprints

## Sprint 1 — Base de Dados

Estado:

```text
Concluída
```

Inclui:

- migrations;
- Models;
- relações;
- seeders;
- documentação inicial.

---

## Sprint 2 — Autenticação

Estado:

```text
Concluída
```

Inclui:

- registo;
- login;
- logout;
- consulta do utilizador autenticado;
- Laravel Sanctum.

---

## Sprint 3 — Recuperação de Password

Estado:

```text
Concluída
```

Inclui:

- pedido de recuperação;
- redefinição de password;
- revogação dos tokens antigos.

---

## Sprint 4 — Gestão de Utilizadores

Estado:

```text
Concluída
```

Inclui:

- listagem;
- criação;
- atualização;
- ativação e desativação;
- papéis;
- fotografia;
- pesquisa;
- filtros;
- ordenação;
- paginação.

---

## Sprint 5 — Gestão de Espaços

Estado:

```text
Concluída
```

Inclui:

- edifícios;
- pisos;
- setores;
- secretárias;
- plantas;
- mapa;
- QR Codes.

---

## Sprint 6 — Reservas

Estado:

```text
Concluída
```

Inclui:

- criação;
- atualização;
- consulta;
- disponibilidade;
- cancelamento;
- regras de negócio;
- check-in.

---

## Sprint 7 — Funcionalidades Avançadas

Estado:

```text
Integrada
```

Inclui:

- dashboard;
- estatísticas;
- QR Code;
- check-in;
- mapa interativo;
- editor gráfico;
- Help Center;
- FAQs;
- pedidos de suporte;
- atualização em tempo real.

## Sprint 8 — Pagamentos e Consolidação Final

Estado:

```text
Concluída
```

Inclui:

* criação do módulo de pagamentos;
* associação entre pagamentos e reservas;
* estados dos pagamentos;
* referências únicas;
* confirmação e cancelamento;
* interface de pagamentos;
* validação das regras de negócio;
* autorização;
* testes automatizados;
* atualização da API;
* atualização da documentação;
* revisão de arquitetura;
* revisão do modelo de dados;
* preparação da entrega final.


---

# 24. Estado Atual

C# Estado Atual

Concluído:

* backend Laravel;
* frontend React com Inertia.js;
* autenticação;
* recuperação de password;
* autorização;
* Policies;
* Middleware;
* gestão de utilizadores;
* gestão de edifícios;
* gestão de pisos;
* gestão de setores;
* gestão de secretárias;
* reservas;
* disponibilidade;
* cancelamento;
* QR Code;
* check-in;
* expiração automática de reservas;
* pagamentos simulados;
* dashboard;
* estatísticas;
* mapa interativo;
* editor gráfico;
* uploads;
* Help Center;
* FAQs;
* pedidos de suporte;
* comunicação em tempo real;
* Laravel Reverb;
* Laravel Echo;
* testes automatizados;
* revisão de Models;
* revisão de Form Requests;
* revisão de Resources;
* revisão de Policies;
* revisão de Controllers;
* revisão das regras de negócio;
* atualização da documentação técnica.

Situação de validação:

```text
154 testes aprovados
```

Em curso:

* atualização final do README;
* revisão visual do frontend;
* verificação do número final de rotas;
* limpeza de rotas técnicas;
* remoção de código temporário;
* revisão da consistência documental;
* preparação da apresentação;
* preparação da entrega.

Trabalho futuro:

* integração com um fornecedor real de pagamentos;
* auditoria persistente em base de dados;
* notificações por email e em tempo real;
* integração com Google Calendar;
* integração com Microsoft Outlook;
* aplicação mobile;
* estatísticas avançadas;
* Single Sign-On;
* gestão avançada de mensagens;
* Inteligência Artificial para previsão de ocupação;
* eventual estado `concluida` com ciclo de vida formal;
* integração com sistemas externos de controlo de acessos.


# 25. Regras de Continuidade

Ao continuar o projeto:

- não alterar a arquitetura sem explicar o impacto;
- não renomear ficheiros, classes, métodos ou rotas sem necessidade;
- não efetuar refactors automáticos globais;
- manter compatibilidade com os testes existentes;
- utilizar Route Model Binding;
- utilizar Form Requests nos CRUDs;
- utilizar Resources na API;
- utilizar Policies e Gates;
- preservar a desativação lógica;
- não criar CRUD de papéis;
- não recriar a entidade Localidade;
- não adicionar o estado `concluida` sem definir o ciclo de vida;
- executar os testes após cada bloco;
- fornecer ficheiros completos quando forem necessárias alterações;
- confirmar nomes reais das rotas, campos e estados antes de documentar;
- evitar funcionalidades novas durante a fase final, salvo requisito obrigatório.

---

# 25. Estado Técnico Resumido

# Estado Técnico Resumido

```text
Backend:
Laravel 12
PHP 8
Laravel Sanctum
Eloquent ORM
Policies
Gates
Middleware
Form Requests
Resources
Services
Events
Broadcasting
Scheduler
Commands Artisan

Frontend:
React
Inertia.js
Tailwind CSS
Vite
Recharts
html5-qrcode
Laravel Echo

Tempo real:
Laravel Reverb
Broadcasting
MapaAtualizado
EnviarMensagem

Base de dados:
MySQL

Entidades principais:
Role
User
Edificio
Piso
Setor
Secretaria
Periodo
EstadoReserva
Reserva
Pagamento
Faq
PedidoSuporte

Uploads:
Fotografias dos utilizadores
Plantas dos pisos

Funcionalidades:
Gestão de utilizadores
Gestão de espaços
Reservas
Disponibilidade
QR Code
Check-in
Pagamentos simulados
Dashboard
Estatísticas
Mapa interativo
Help Center
Pedidos de suporte
Chat e comunicação em tempo real

Testes:
154 testes aprovados

API:
Número final de rotas a confirmar com php artisan route:list --path=api

Estado geral:
Projeto estável, testado, documentado e em preparação para a entrega final.
```
