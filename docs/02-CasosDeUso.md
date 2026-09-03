2. Casos de Uso

2.1 Introdução

Os casos de uso descrevem as principais funcionalidades disponibilizadas pelo SpaceHub e a forma como os diferentes atores interagem com o sistema.

Cada caso de uso apresenta:

objetivo;

atores;

pré-condições;

fluxo principal;

fluxos alternativos;

pós-condições.

Os atores considerados são:

Administrador;

Gestor;

Colaborador;

Utilizador.

UC01 — Registo de Utilizador

Objetivo

Permitir o registo de novos utilizadores na aplicação.

Atores

Utilizador

Pré-condições

O utilizador ainda não possui uma conta.

O endereço de email não se encontra registado.

Fluxo principal

O utilizador acede ao formulário de registo.

Introduz o nome, email, palavra-passe e confirmação da palavra-passe.

O sistema valida os dados introduzidos.

O sistema cria a conta.

O papel Utilizador é atribuído automaticamente.

O utilizador é autenticado e redirecionado para a aplicação.

Fluxos alternativos

A1 — Email já registado

O sistema identifica que o email já está associado a uma conta.

É apresentada uma mensagem de erro.

O registo não é concluído.

A2 — Dados inválidos

O sistema identifica campos em falta ou dados inválidos.

São apresentadas mensagens de validação.

O utilizador pode corrigir os dados e submeter novamente o formulário.

Pós-condições

O utilizador fica registado com o papel Utilizador.

A sessão fica iniciada.

UC02 — Autenticação e encerramento de sessão

Objetivo

Permitir que os utilizadores iniciem e terminem sessão em segurança.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O utilizador possui uma conta registada.

A conta encontra-se ativa.

Fluxo principal

O utilizador introduz o email e a palavra-passe.

O sistema valida as credenciais.

O sistema confirma que a conta está ativa.

A sessão é iniciada.

O utilizador é redirecionado para o dashboard.

Quando pretender sair, seleciona a opção de terminar sessão.

O sistema invalida a sessão ou o token de autenticação.

Fluxos alternativos

A1 — Credenciais inválidas

O sistema rejeita a autenticação.

É apresentada uma mensagem de erro.

A2 — Conta desativada

O sistema bloqueia o acesso.

É apresentada uma mensagem a informar que a conta se encontra inativa.

Pós-condições

O utilizador fica autenticado ou, no caso de logout, a sessão fica terminada.

UC03 — Recuperação e alteração da palavra-passe

Objetivo

Permitir recuperar ou alterar a palavra-passe de acesso à aplicação.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O utilizador possui uma conta registada.

Fluxo principal

O utilizador seleciona a opção de recuperação da palavra-passe.

Introduz o endereço de email associado à conta.

O sistema envia as instruções de recuperação.

O utilizador define uma nova palavra-passe.

O sistema valida e guarda a nova palavra-passe.

Fluxos alternativos

A1 — Email inexistente ou inválido

O sistema não encontra uma conta correspondente.

É apresentada uma mensagem adequada.

A2 — Token inválido ou expirado

O sistema rejeita o pedido.

O utilizador deve solicitar um novo link de recuperação.

Pós-condições

A palavra-passe fica atualizada.

UC04 — Gestão do perfil

Objetivo

Permitir ao utilizador consultar e atualizar os próprios dados.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O utilizador encontra-se autenticado.

A conta encontra-se ativa.

Fluxo principal

O utilizador acede ao perfil.

Consulta os seus dados.

Altera os campos permitidos.

Pode carregar ou substituir a fotografia de perfil.

O sistema valida os dados.

As alterações são guardadas.

Fluxos alternativos

A1 — Dados inválidos

O sistema apresenta os erros de validação.

As alterações não são guardadas.

A2 — Ficheiro de imagem inválido

O sistema rejeita o upload.

É apresentada uma mensagem de erro.

Pós-condições

O perfil fica atualizado.

UC05 — Gestão de utilizadores

Objetivo

Permitir ao Administrador gerir os utilizadores da aplicação.

Atores

Administrador

Pré-condições

O Administrador encontra-se autenticado.

A conta encontra-se ativa.

Fluxo principal

O Administrador acede à área de utilizadores.

Consulta a listagem existente.

Pode pesquisar, filtrar, ordenar e paginar os resultados.

Pode criar um novo utilizador.

Pode editar os dados de um utilizador.

Pode associar ou alterar o respetivo papel.

Pode ativar ou desativar a conta.

O sistema valida e guarda as alterações.

Fluxos alternativos

A1 — Email já existente

O sistema rejeita a operação.

É apresentada uma mensagem de erro.

A2 — Dados inválidos

O sistema apresenta os erros de validação.

As alterações não são guardadas.

A3 — Operação não autorizada

O sistema bloqueia a ação.

É devolvida uma resposta de acesso negado.

Pós-condições

A informação do utilizador fica criada ou atualizada.

O histórico das reservas e restantes relações é preservado.

UC06 — Gestão de edifícios

Objetivo

Permitir gerir os edifícios registados no sistema.

Atores

Administrador

Gestor

Pré-condições

O ator encontra-se autenticado.

Possui permissões de gestão de espaços.

Fluxo principal

O ator acede à área de edifícios.

Consulta a listagem.

Pode pesquisar, filtrar, ordenar e paginar os resultados.

Pode criar um edifício.

Pode editar os respetivos dados.

Pode ativar ou desativar o edifício.

O sistema valida e guarda a operação.

Fluxos alternativos

A1 — Dados inválidos

O sistema apresenta os erros de validação.

A operação não é concluída.

A2 — Operação não autorizada

O sistema bloqueia a ação.

É apresentada uma mensagem de acesso negado.

Pós-condições

A informação do edifício fica atualizada.

A desativação não elimina o respetivo histórico.

UC07 — Gestão de pisos

Objetivo

Permitir gerir os pisos associados a um edifício.

Atores

Administrador

Gestor

Pré-condições

O ator encontra-se autenticado.

O edifício associado existe.

Fluxo principal

O ator acede à área de pisos.

Consulta, pesquisa, filtra e ordena a listagem.

Pode criar um piso associado a um edifício.

Pode editar os dados do piso.

Pode carregar ou substituir a planta.

Pode ativar ou desativar o piso.

O sistema valida e guarda a operação.

Fluxos alternativos

A1 — Código duplicado no mesmo edifício

O sistema rejeita a operação.

É apresentada uma mensagem de erro.

A2 — Planta inválida

O sistema rejeita o ficheiro.

É apresentada uma mensagem com os requisitos do upload.

Pós-condições

O piso fica criado ou atualizado.

A planta, quando fornecida, fica disponível para o mapa.

UC08 — Gestão de setores

Objetivo

Permitir gerir os setores existentes num piso.

Atores

Administrador

Gestor

Pré-condições

O ator encontra-se autenticado.

O piso associado existe.

Fluxo principal

O ator acede à área de setores.

Consulta a listagem.

Pode criar ou editar um setor.

Define as respetivas características e preços.

Pode posicionar e redimensionar o setor na planta.

Pode ativar, desativar ou definir se o setor é reservável.

O sistema valida e guarda as alterações.

Fluxos alternativos

A1 — Dados inválidos

O sistema apresenta os erros de validação.

As alterações não são guardadas.

A2 — Posição inválida na planta

O sistema rejeita a atualização.

A posição anterior é mantida.

Pós-condições

O setor fica atualizado e representado no mapa.

Os preços ficam disponíveis para o cálculo das reservas.

UC09 — Gestão de secretárias

Objetivo

Permitir gerir as secretárias disponíveis nos setores.

Atores

Administrador

Gestor

Pré-condições

O ator encontra-se autenticado.

O setor associado existe.

Fluxo principal

O ator acede à área de secretárias.

Consulta, pesquisa e filtra a listagem.

Pode criar ou editar uma secretária.

Configura as respetivas características, posição, estado e disponibilidade.

O sistema gera ou mantém um QR Code único.

O ator pode ativar, desativar ou definir a secretária como reservável.

O sistema valida e guarda as alterações.

Fluxos alternativos

A1 — Código duplicado

O sistema rejeita a operação.

É apresentada uma mensagem de erro.

A2 — Setor inativo ou inexistente

O sistema impede a associação.

A operação não é concluída.

Pós-condições

A secretária fica criada ou atualizada.

Quando ativa e reservável, fica disponível no processo de reserva.

UC10 — Consultar disponibilidade e mapa

Objetivo

Permitir consultar os espaços e secretárias disponíveis para uma data e duração específicas.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

A conta encontra-se ativa.

Fluxo principal

O ator acede ao mapa ou à página de disponibilidade.

Seleciona a data de início.

Seleciona a duração da reserva.

Quando aplicável, seleciona o período.

O sistema determina a data final.

O sistema verifica os edifícios, pisos, setores e secretárias elegíveis.

São apresentadas apenas as secretárias ativas, reserváveis e livres.

O mapa identifica visualmente os diferentes estados das secretárias.

Fluxos alternativos

A1 — Não existem secretárias disponíveis

O sistema apresenta uma mensagem informativa.

O utilizador pode alterar a data, duração, período ou filtros.

A2 — Seleção inválida

O sistema apresenta os erros de validação.

A consulta não é efetuada.

Pós-condições

A disponibilidade é apresentada sem alterar dados do sistema.

UC11 — Criar reserva

Objetivo

Permitir reservar uma secretária por uma duração diária, semanal, mensal ou anual.

Atores

Utilizador

Colaborador

Gestor

Administrador

Pré-condições

O ator encontra-se autenticado.

A conta encontra-se ativa.

A secretária encontra-se ativa e reservável.

Fluxo principal

O ator inicia o processo de reserva.

Seleciona a data de início.

Seleciona a duração:

diária;

semanal;

mensal;

anual.

Numa reserva diária, seleciona o período:

Manhã;

Tarde;

Dia inteiro.

Nas reservas semanais, mensais ou anuais, o sistema utiliza automaticamente o período Dia inteiro.

O sistema calcula a data final.

O ator escolhe uma secretária disponível.

O sistema valida conflitos e regras de negócio.

O sistema calcula o preço de acordo com a duração, o período e os valores definidos no setor.

O sistema cria uma única reserva.

O sistema cria o pagamento associado.

A reserva e o mapa são atualizados.

Fluxos alternativos

A1 — Secretária indisponível

O sistema rejeita a reserva.

É apresentada uma mensagem informativa.

A2 — Conflito com outra reserva

O sistema deteta sobreposição de datas ou períodos.

A reserva não é criada.

A3 — Utilizador já possui uma reserva incompatível

O sistema rejeita a operação.

É apresentada uma mensagem de conflito.

A4 — Secretária ou setor não reservável

O sistema impede a criação da reserva.

A5 — Dados inválidos

O sistema apresenta os erros de validação.

A reserva não é criada.

Pós-condições

É criada uma reserva.

É criado um pagamento associado.

A secretária deixa de aparecer como disponível no intervalo reservado.

UC12 — Consultar, editar e cancelar reservas

Objetivo

Permitir acompanhar e gerir reservas existentes.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

Existe pelo menos uma reserva acessível ao ator.

Fluxo principal

O ator acede à área de reservas.

Consulta reservas futuras e o histórico.

Pode aplicar pesquisa, filtros, ordenação e paginação.

Seleciona uma reserva para consultar os detalhes.

Quando permitido, pode editar a reserva.

Quando elegível, pode solicitar o cancelamento.

O sistema valida a autorização e o estado.

O sistema guarda as alterações e atualiza o mapa.

Fluxos alternativos

A1 — Reserva não pertence ao utilizador

O sistema bloqueia a operação.

É devolvida uma resposta de acesso negado.

A2 — Reserva confirmada, cancelada ou expirada

O sistema impede alterações incompatíveis com o estado atual.

É apresentada uma mensagem explicativa.

A3 — Reserva com pagamento não elegível para cancelamento

O sistema rejeita a operação de acordo com as regras definidas.

Pós-condições

A reserva mantém-se inalterada ou passa ao estado resultante da operação.

A disponibilidade é recalculada quando aplicável.

UC13 — Realizar check-in por QR Code

Objetivo

Permitir confirmar a presença do utilizador na secretária reservada.

Atores

Utilizador

Colaborador

Gestor

Administrador

Pré-condições

Existe uma reserva válida.

A reserva pertence ao utilizador autenticado.

A data e o período permitem o check-in.

O QR Code pertence à secretária reservada.

Fluxo principal

O ator acede à funcionalidade de check-in.

Lê o QR Code da secretária.

O sistema identifica a secretária.

Valida o utilizador, a reserva, a data, o período e o estado.

O utilizador confirma a operação.

O sistema regista o check-in.

O estado da reserva é atualizado para Confirmada.

Fluxos alternativos

A1 — QR Code inválido

O sistema não identifica uma secretária válida.

O check-in é rejeitado.

A2 — Reserva inexistente

O sistema não encontra uma reserva elegível.

É apresentada uma mensagem de erro.

A3 — Reserva de outro utilizador

O sistema bloqueia o check-in.

A4 — Data, período ou estado inválido

O sistema rejeita a operação.

É apresentada a respetiva justificação.

Pós-condições

O check-in fica registado.

A reserva passa ao estado Confirmada.

UC13A — Confirmar check-in presencial na receção

Objetivo

Permitir que um funcionário confirme presencialmente a chegada de um utilizador com uma reserva elegível para o dia atual.

Atores

Administrador

Gestor

Colaborador

Pré-condições

O funcionário encontra-se autenticado e possui um dos papéis autorizados.

Existe uma reserva ativa para o dia atual, ainda sem check-in.

A reserva encontra-se dentro da janela horária permitida e não possui pagamento pendente.

Fluxo principal

O funcionário acede à área Check-in na receção.

Pesquisa a reserva pelo nome, e-mail ou código da secretária.

O sistema apresenta o utilizador, o espaço, o horário e o estado de elegibilidade.

O funcionário seleciona Confirmar check-in e confirma a operação no modal.

O sistema regista a data e hora do check-in, identifica o funcionário responsável no registo de atividade e atualiza o mapa.

Fluxos alternativos

A1 — Reserva fora da janela horária

O sistema bloqueia a confirmação e apresenta o respetivo estado.

A2 — Pagamento pendente, reserva inativa ou check-in já efetuado

O sistema rejeita a operação sem alterar a reserva.

A3 — Perfil sem autorização

O sistema devolve acesso negado.

Pós-condições

O check-in fica registado e a operação permanece auditável, incluindo o funcionário e o utilizador associado à reserva.

UC14 — Gerir pagamentos

Objetivo

Permitir consultar e confirmar os pagamentos simulados associados às reservas.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

Existe uma reserva com pagamento associado.

Fluxo principal

O ator acede à área de pagamentos.

Consulta o histórico e os detalhes dos pagamentos permitidos.

Seleciona um pagamento pendente.

Escolhe um método:

Cartão;

MB Way;

Transferência;

PayPal.

Confirma a operação.

O sistema atualiza o estado do pagamento.

Quando aplicável, o estado da reserva é atualizado.

Fluxos alternativos

A1 — Pagamento já processado

O sistema impede uma nova confirmação.

É apresentada uma mensagem informativa.

A2 — Pagamento não pertence ao utilizador

O sistema bloqueia o acesso ou a operação.

A3 — Método de pagamento inválido

O sistema rejeita a confirmação.

O estado permanece inalterado.

Pós-condições

O pagamento fica registado com o estado resultante da operação.

A reserva associada é atualizada quando aplicável.

UC15 — Consultar o dashboard e estatísticas

Objetivo

Disponibilizar uma visão geral da utilização e ocupação dos espaços.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

A conta encontra-se ativa.

Fluxo principal

O ator acede ao dashboard.

O sistema carrega os indicadores autorizados para o respetivo papel.

São apresentadas informações como:

reservas totais;

reservas por estado;

reservas por período;

taxa de ocupação;

ocupação por edifício ou setor;

próximas reservas;

informação financeira, quando aplicável.

O ator pode aplicar filtros temporais ou de localização.

Os indicadores e gráficos são atualizados.

Fluxos alternativos

A1 — Não existem dados para o filtro selecionado

O sistema apresenta os indicadores sem valores ou uma mensagem informativa.

A2 — Dados temporariamente indisponíveis

O sistema apresenta uma mensagem de erro.

O utilizador pode repetir a consulta.

Pós-condições

Os indicadores são apresentados sem alterar os dados do sistema.

UC16 — Submeter e moderar avaliações

Objetivo

Permitir avaliar uma reserva concluída e gerir a moderação das avaliações.

Atores

Utilizador

Administrador

Gestor

Pré-condições

O utilizador encontra-se autenticado.

A reserva é elegível para avaliação.

A avaliação ainda não foi submetida para essa reserva.

Fluxo principal

O utilizador acede ao histórico de reservas.

Seleciona uma reserva elegível.

Introduz a classificação e, quando aplicável, um comentário.

O sistema valida e regista a avaliação.

A média do setor é recalculada.

Um utilizador com permissões de moderação pode consultar e moderar a avaliação.

Fluxos alternativos

A1 — Reserva não elegível

O sistema impede a avaliação.

É apresentada uma mensagem explicativa.

A2 — Avaliação duplicada

O sistema rejeita uma segunda avaliação para a mesma reserva.

A3 — Conteúdo inválido

O sistema apresenta os erros de validação.

A avaliação não é guardada.

Pós-condições

A avaliação fica registada.

As estatísticas do setor são atualizadas.

UC17 — Consultar notificações

Objetivo

Permitir acompanhar acontecimentos relevantes relacionados com a utilização da plataforma.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

Fluxo principal

O ator acede ao centro de notificações.

O sistema apresenta as notificações associadas à conta.

O utilizador consulta o conteúdo.

Pode marcar uma notificação como lida.

Quando aplicável, pode seguir a ligação para a funcionalidade relacionada.

Fluxos alternativos

A1 — Não existem notificações

O sistema apresenta uma mensagem informativa.

A2 — Recurso associado indisponível

O sistema impede o acesso ao recurso.

A notificação permanece disponível para consulta.

Pós-condições

O estado de leitura das notificações fica atualizado.

UC18 — Utilizar o assistente virtual

Objetivo

Permitir obter respostas rápidas a partir das FAQs configuradas na aplicação.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado.

Existem FAQs ativas e configuradas com perguntas, respostas e palavras-chave.

Fluxo principal

O ator abre o assistente virtual e introduz uma pergunta.

O sistema normaliza os termos e compara-os com as perguntas, respostas e palavras-chave das FAQs.

O sistema devolve a resposta da FAQ com maior relevância.

Fluxos alternativos

A1 — Pergunta sem correspondência relevante

O sistema informa que não encontrou uma resposta exata e encaminha o utilizador para o apoio.

A2 — Pergunta inválida

O sistema rejeita o envio.

O utilizador pode corrigir o conteúdo.

Pós-condições

A resposta é apresentada sem persistir uma conversa ou mensagem.

UC19 — Utilizar o Help Center

Objetivo

Disponibilizar apoio ao utilizador através de perguntas frequentes e pedidos de suporte.

Atores

Administrador

Gestor

Colaborador

Utilizador

Pré-condições

O ator encontra-se autenticado para submeter ou acompanhar pedidos de suporte.

Fluxo principal

O ator acede ao Help Center.

Consulta as perguntas frequentes.

Pode pesquisar informação de apoio.

Quando necessário, cria um pedido de suporte.

Introduz o assunto e a descrição.

O sistema valida e regista o pedido.

O utilizador pode acompanhar o respetivo estado.

Os responsáveis autorizados podem analisar e responder ao pedido.

Fluxos alternativos

A1 — Dados obrigatórios em falta

O sistema apresenta os erros de validação.

O pedido não é criado.

A2 — Pedido inacessível ao utilizador

O sistema bloqueia a consulta.

É apresentada uma mensagem de acesso negado.

Pós-condições

O pedido de suporte fica registado e disponível para acompanhamento.

UC20 — Atualização automática de estados

Objetivo

Garantir que as reservas e pagamentos mantêm estados coerentes com as regras de negócio.

Atores

Sistema

Pré-condições

Existem reservas ou pagamentos sujeitos a atualização automática.

Fluxo principal

O sistema executa as tarefas agendadas.

Identifica reservas sem check-in dentro do prazo definido.

Identifica reservas com pagamento pendente que ultrapassaram o limite permitido.

Atualiza os estados aplicáveis.

Liberta as secretárias quando necessário.

Regista ou envia as notificações correspondentes.

Fluxos alternativos

A1 — Nenhum registo elegível

A tarefa termina sem alterações.

A2 — Falha durante o processamento

O sistema preserva os registos ainda não processados.

A falha pode ser registada para análise.

Pós-condições

As reservas, pagamentos e disponibilidades ficam coerentes com as regras definidas.

2.2 Considerações finais

Os casos de uso apresentados cobrem as principais interações entre os atores e o SpaceHub, desde a autenticação e gestão dos espaços até às reservas, pagamentos, check-in, avaliações, notificações, comunicação e suporte.

A autorização de cada operação é validada de acordo com o papel do utilizador, o estado das entidades e as regras de negócio aplicáveis.
