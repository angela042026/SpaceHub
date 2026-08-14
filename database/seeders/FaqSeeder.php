<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Executa o seeder das FAQs.
     *
     * Limpa a tabela antes de inserir: as categorias e perguntas foram
     * reorganizadas (ex: "Space Hub" -> "Sobre o SpaceHub", "Como sei
     * quais as secretárias disponíveis?" mudou de categoria e de texto),
     * por isso um simples updateOrCreate por categoria+pergunta deixaria
     * as linhas antigas paradas na tabela como duplicados.
     */
    public function run(): void
    {
        Faq::query()->delete();

        $faqs = [

            /*
            |--------------------------------------------------------------------------
            | Sobre o SpaceHub
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Sobre o SpaceHub',
                'pergunta' => 'O que é o SpaceHub?',
                'resposta' => 'O SpaceHub é uma plataforma de gestão e reserva de espaços de trabalho concebida para empresas que utilizam modelos de trabalho híbridos e flexíveis.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Sobre o SpaceHub',
                'pergunta' => 'Quem pode utilizar a plataforma?',
                'resposta' => 'A plataforma destina-se a colaboradores autenticados e autorizados pela organização.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Sobre o SpaceHub',
                'pergunta' => 'Porque devo reservar previamente?',
                'resposta' => 'A reserva permite uma melhor organização dos espaços de trabalho, evita conflitos entre utilizadores e contribui para uma utilização mais eficiente dos recursos disponíveis.',
                'ordem' => 3,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Espaços e disponibilidade
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Espaços e disponibilidade',
                'pergunta' => 'Como sei quais os espaços disponíveis?',
                'resposta' => 'Após selecionar a data e o período pretendidos, o sistema apresenta automaticamente apenas os espaços disponíveis.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços e disponibilidade',
                'pergunta' => 'Qual é a diferença entre Open Space Central e Open Space Norte?',
                'resposta' => 'O Open Space Central localiza-se junto às principais áreas comuns, como a receção e a zona de convívio. O Open Space Norte oferece um ambiente mais reservado e silencioso, sendo recomendado para tarefas que exigem maior concentração.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços e disponibilidade',
                'pergunta' => 'O que são os Phone Booths?',
                'resposta' => 'São cabines individuais destinadas à realização de chamadas ou videoconferências, reduzindo o ruído nas restantes áreas de trabalho.',
                'ordem' => 3,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Reservas
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Reservas',
                'pergunta' => 'Como posso reservar um espaço?',
                'resposta' => 'Selecione a data, o período (Manhã ou Tarde) e escolha um dos espaços disponíveis. Depois basta confirmar a reserva.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar para outro dia?',
                'resposta' => 'Sim. Desde que existam lugares disponíveis, é possível efetuar reservas para datas futuras.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar qualquer espaço?',
                'resposta' => 'Sim. O sistema apresenta todos os espaços disponíveis para a data e período selecionados.',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso ter mais do que uma reserva?',
                'resposta' => 'Não. Cada utilizador pode ter apenas uma reserva ativa para o mesmo período.',
                'ordem' => 4,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'O que acontece se já não existirem lugares disponíveis?',
                'resposta' => 'A lista de espaços apresenta apenas os lugares disponíveis para a data e período selecionados. Se todos estiverem ocupados, não será possível concluir a reserva.',
                'ordem' => 5,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso alterar uma reserva?',
                'resposta' => 'Sim. Desde que ainda não tenha efetuado o check-in e existam lugares disponíveis, pode alterar a sua reserva, escolhendo uma nova data, período ou espaço. Caso já tenha realizado o check-in, a reserva deixa de poder ser alterada.',
                'ordem' => 6,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso cancelar uma reserva?',
                'resposta' => 'Sim. A reserva pode ser cancelada antes do início do período reservado.',
                'ordem' => 7,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Pagamentos
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Como posso pagar uma reserva?',
                'resposta' => 'Depois de criar a reserva, o pagamento fica pendente. Para o concluir, aceda a Pagamentos, selecione a reserva e escolha o método de pagamento pretendido.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Quais são os métodos de pagamento disponíveis?',
                'resposta' => 'Cartão, MB Way, Transferência bancária e PayPal.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Onde posso consultar os meus pagamentos?',
                'resposta' => 'Na página Pagamentos, disponível no menu lateral, onde pode consultar o histórico e o estado de cada pagamento.',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Como posso obter o comprovativo de pagamento?',
                'resposta' => 'Depois de o pagamento ficar confirmado como Pago, pode aceder ao comprovativo a partir do detalhe desse pagamento.',
                'ordem' => 4,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'O que significam os diferentes estados do pagamento?',
                'resposta' => 'Pendente: ainda não foi pago. Pago: o pagamento foi confirmado. Recusado: o pagamento não foi aceite. Reembolsado: o valor foi devolvido. Cancelado: o pagamento foi cancelado, normalmente por a reserva associada ter sido cancelada antes de ser paga.',
                'ordem' => 5,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Check-in
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Check-in',
                'pergunta' => 'Como faço o check-in?',
                'resposta' => 'O check-in pode ser efetuado de três formas: diretamente na plataforma SpaceHub, através da leitura do QR Code existente no espaço reservado ou presencialmente na receção.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Check-in',
                'pergunta' => 'O que acontece se não fizer check-in?',
                'resposta' => 'Se não realizar o check-in nos primeiros 30 minutos após o início do período reservado, a reserva é automaticamente marcada como expirada e o lugar fica novamente disponível.',
                'ordem' => 2,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Conta
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Conta',
                'pergunta' => 'Como altero os meus dados?',
                'resposta' => 'Pode atualizar as suas informações através da página Perfil.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Esqueci-me da palavra-passe.',
                'resposta' => 'Utilize a opção "Recuperar Palavra-passe" disponível na página de autenticação. Depois de iniciar sessão, também poderá alterar a palavra-passe na página Perfil.',
                'ordem' => 2,
                'ativo' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                [
                    'categoria' => $faq['categoria'],
                    'pergunta' => $faq['pergunta'],
                ],
                $faq
            );
        }
    }
}
