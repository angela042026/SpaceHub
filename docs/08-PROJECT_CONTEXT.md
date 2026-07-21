# Documento Mestre do Projeto — SpaceHub

**Versão:** 2.0  
**Estado:** Revisão final e preparação da entrega  
**Framework:** Laravel 12 + Sanctum + Inertia.js + React + Tailwind CSS  
**Base de dados:** MySQL  
**Testes automatizados:** 111 testes aprovados  
**Rotas da API:** 38 rotas registadas  

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

A base de dados utilizada é MySQL.

As principais entidades são:

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
Faq
PedidoSuporte
```

Existem ainda tabelas técnicas do Laravel, nomeadamente:

- sessions;
- password_reset_tokens;
- personal_access_tokens;
- cache;
- jobs.

---

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

---

# 11. QR Code e Check-in

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

# 12. Dashboard, Estatísticas e Mapa

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

# 13. Help Center e Suporte

Funcionalidades implementadas:

- Help Center;
- FAQs;
- pedidos de suporte;
- consulta de conteúdos de ajuda;
- reporte de problemas e avarias.

Controllers principais:

```text
FaqController
PedidoSuporteController
```

Seeders associados:

```text
FaqSeeder
```

---

# 14. Sistema de Chat e WebSockets

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
- alteração do histórico da branch do colaborador.

---

# 15. Testes

O projeto utiliza PHPUnit para testes automatizados.

Situação atual:

```text
111 testes aprovados
```

Os testes cobrem:

- autenticação;
- recuperação de password;
- autorização;
- Policies;
- utilizadores inativos;
- gestão de utilizadores;
- gestão de edifícios;
- gestão de pisos;
- gestão de setores;
- gestão de secretárias;
- reservas;
- disponibilidade;
- cancelamento;
- check-in;
- QR Code;
- dashboard;
- estatísticas;
- mapa;
- Help Center;
- uploads;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- performance de queries.

Comando principal:

```bash
php artisan test
```

Antes de uma integração ou entrega executar:

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

---

# 16. Rotas da API

À data da revisão existem:

```text
38 rotas de API
```

Grupos principais:

- autenticação;
- utilizadores;
- edifícios;
- pisos;
- setores;
- secretárias;
- reservas;
- disponibilidade;
- ações de ativação e desativação;
- cancelamento.

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

Esta rota deve ser revista antes da entrega final e removida caso já não seja necessária.

As funcionalidades de dashboard, mapa, QR Code e check-in utilizam rotas web específicas e não pertencem necessariamente ao grupo `/api`.

---

# 17. Seeders

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
pendente
confirmada
cancelada
expirada
```

---

# 18. Uploads

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

# 19. Documentação Técnica

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

# 20. Git e Integração

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

# 21. Integrações Realizadas

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

# 22. Estado das Sprints

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

---

# 23. Estado Atual

Concluído:

- backend;
- autenticação;
- autorização;
- CRUDs;
- reservas;
- disponibilidade;
- QR Code;
- check-in;
- dashboard;
- estatísticas;
- mapa;
- uploads;
- Help Center;
- suporte;
- testes automatizados;
- revisão de Models;
- revisão de Form Requests;
- revisão de Resources;
- revisão de Policies;
- revisão de Controllers;
- reforço das regras das reservas;
- atualização da documentação técnica.

Em curso:

- atualização do README;
- revisão final do frontend;
- limpeza de rotas e código temporário;
- preparação da apresentação;
- preparação da entrega.

Trabalho futuro:

- auditoria persistente em base de dados;
- notificações;
- integração com calendários;
- aplicação mobile;
- estatísticas avançadas;
- SSO;
- Inteligência Artificial para previsão de ocupação;
- eventual estado `concluida` com ciclo de vida formal.

---

# 24. Regras de Continuidade

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

```text
Backend:
Laravel 12
PHP 8
Laravel Sanctum
Eloquent ORM
Policies
Form Requests
Resources
Events
Broadcasting

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

Uploads:
Fotografia dos utilizadores
Planta dos pisos

Testes:
111 testes aprovados

API:
38 rotas registadas

Estado geral:
Projeto estável, revisto, documentado e em preparação para entrega.
