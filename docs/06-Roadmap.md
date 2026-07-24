# 6. Evolução do Projeto e Trabalho Futuro

# 6.1 Introdução

O desenvolvimento do SpaceHub foi realizado de forma incremental, permitindo validar continuamente as funcionalidades implementadas e adaptar a solução às necessidades identificadas durante o projeto.

Ao longo do desenvolvimento foram introduzidas melhorias na arquitetura, segurança, organização do código e experiência do utilizador, culminando numa aplicação estável e suportada por testes automatizados.

---

# 6.2 Evolução do Projeto

O desenvolvimento iniciou-se com a implementação da estrutura base da aplicação, incluindo autenticação, gestão de utilizadores e definição das principais entidades da base de dados.

Numa fase posterior foram desenvolvidos os módulos de gestão dos espaços físicos, organizando-os segundo a seguinte hierarquia:

- Edifícios;
- Pisos;
- Setores;
- Secretárias.

Posteriormente foi implementado o sistema de reservas, permitindo aos utilizadores reservar postos de trabalho para datas e períodos específicos.

Após estabilização das funcionalidades principais foram introduzidos diversos melhoramentos, nomeadamente:

- autenticação através de Laravel Sanctum;
- autorização baseada em Policies;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- upload de fotografias;
- upload das plantas dos pisos;
- dashboard estatístico;
- QR Codes;
- editor gráfico do mapa;
- atualização do mapa em tempo real;
- testes automatizados.
Numa fase posterior foram ainda desenvolvidos novos módulos que expandiram significativamente as funcionalidades da aplicação, destacando-se:

- sistema de pagamentos associado às reservas;
- Help Center com FAQs e pedidos de suporte;
- atualização em tempo real através de Laravel Reverb;
- melhoria da segurança através de middleware e Policies adicionais;
- automatização da expiração de reservas através do Laravel Scheduler;
- aumento da cobertura da suíte de testes automatizados.

---

# 6.3 Melhorias Introduzidas

Durante o desenvolvimento foram efetuadas várias refatorações com o objetivo de melhorar a qualidade do código.

Entre as principais melhorias destacam-se:

- utilização sistemática de Form Requests;
- utilização de API Resources;
- centralização das regras de autorização através de Policies;
- separação clara entre validação e lógica de negócio;
- organização consistente dos Controllers;
- utilização do sistema Storage para uploads;
- melhoria das consultas através de eager loading.

Estas alterações permitiram tornar o código mais organizado, reutilizável e fácil de manter.
- introdução da camada Service para centralização da lógica de negócio dos pagamentos;
- separação entre rotas web e API;
- integração do Laravel Reverb para comunicação em tempo real;
- implementação de tarefas automáticas através do Laravel Scheduler;
- melhoria da organização da documentação técnica;
- reforço da cobertura de testes automatizados.

---

# 6.4 Funcionalidades Implementadas

No final do desenvolvimento encontram-se implementadas as seguintes funcionalidades:

- autenticação;
- recuperação de password;
- gestão de utilizadores;
- gestão de papéis;
- gestão de edifícios;
- gestão de pisos;
- upload da planta dos pisos;
- gestão de setores;
- editor gráfico dos mapas;
- gestão de secretárias;
- geração de QR Code;
- reservas;
- consulta de disponibilidade;
- dashboard;
- estatísticas;
- uploads;
- testes automatizados.
- pagamentos;
- histórico de pagamentos;
- Help Center;
- FAQs;
- pedidos de suporte;
- atualização em tempo real com Laravel Reverb;
- expiração automática de reservas;
- middleware de contas ativas;
- Policies de autorização;
- 154 testes automatizados.
---

# 6.5 Trabalho Futuro

Embora o sistema se encontre funcional, existem diversas funcionalidades que poderão ser adicionadas em versões futuras.

Entre elas destacam-se:

## Notificações

Envio automático de notificações por email relativamente a:

- confirmação da reserva;
- cancelamento;
- lembretes de check-in.

---

## Integração com Calendário

Integração com:

- Microsoft Outlook;
- Google Calendar.

---

## Aplicação Mobile

Desenvolvimento de aplicações móveis para Android e iOS.

---

## Estatísticas Avançadas

Implementação de novos indicadores, como:

- ocupação média por edifício;
- utilização por utilizador;
- mapas de calor;
- evolução mensal.

---

## Gestão de Equipamentos

Possibilidade de associar equipamentos às secretárias, como:

- monitores;
- docks;
- cadeiras;
- equipamentos multimédia.

---

---

## Sistema de Avaliações

Possibilidade de os utilizadores avaliarem:

- a experiência de utilização;
- os espaços;
- os equipamentos;
- o processo de reserva.

As avaliações poderão contribuir para melhorar continuamente a qualidade do serviço disponibilizado.

---

## Comunicados Administrativos

Implementação de um sistema de comunicados apresentado após o início de sessão.

O módulo poderá incluir:

- mensagem do dia;
- avisos importantes;
- período de validade;
- confirmação de leitura;
- público-alvo por papel.

---

## Integração com Gateways de Pagamento

Substituição do sistema de pagamento simulado por integração com plataformas reais, como:

- Stripe;
- PayPal;
- MB Way;
- referências Multibanco.

## Auditoria

Registo detalhado das operações realizadas pelos utilizadores, incluindo:

- criação;
- atualização;
- cancelamento;
- check-in.

---

## Notificações em Tempo Real

Melhoria da comunicação em tempo real através de eventos WebSocket para todas as áreas administrativas.

---

## Inteligência Artificial

Numa evolução futura poderá ser incorporado um módulo baseado em Inteligência Artificial para auxiliar a gestão dos espaços.

Entre as possíveis funcionalidades incluem-se:

- previsão da ocupação;
- sugestão automática da melhor secretária;
- otimização da distribuição dos utilizadores;
- deteção de padrões de utilização.

# 6.6 Escalabilidade

A arquitetura adotada permite expandir facilmente o sistema.

Entre as possíveis evoluções destacam-se:

- múltiplos edifícios;
- múltiplas organizações;
- autenticação SSO;
- integração com Microsoft Entra ID;
- integração com Active Directory;
- APIs públicas;
- arquitetura baseada em microsserviços;
- integração com gateways externos de pagamento;
- comunicação entre serviços através de eventos;
- suporte para múltiplas localizações geográficas;
- infraestrutura cloud distribuída.
- relatórios exportáveis.

---

# 6.7 Considerações Finais

A evolução do SpaceHub ao longo do projeto permitiu desenvolver uma plataforma mais completa, segura e preparada para futuras extensões.

A introdução de módulos como os pagamentos, o Help Center, o sistema de comunicação em tempo real através do Laravel Reverb e a automatização de processos com o Laravel Scheduler demonstram a capacidade de evolução da arquitetura inicialmente definida.

A utilização de boas práticas de desenvolvimento, da separação de responsabilidades e de uma suíte composta por **154 testes automatizados**, todos aprovados, reforça a qualidade e a robustez da solução desenvolvida.

Desta forma, o SpaceHub apresenta uma base sólida para futuras evoluções e para uma eventual utilização em contextos organizacionais de maior dimensão.