<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

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
                'pergunta_en' => 'What is SpaceHub?',
                'resposta_en' => 'SpaceHub is a workspace management and booking platform designed for companies using hybrid and flexible work models.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Sobre o SpaceHub',
                'pergunta' => 'Quem pode utilizar a plataforma?',
                'resposta' => 'A plataforma destina-se a colaboradores autenticados e autorizados pela organização.',
                'pergunta_en' => 'Who can use the platform?',
                'resposta_en' => 'The platform is intended for employees who are authenticated and authorised by the organisation.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Sobre o SpaceHub',
                'pergunta' => 'Porque devo reservar previamente?',
                'resposta' => 'A reserva permite uma melhor organização dos espaços de trabalho, evita conflitos entre utilizadores e contribui para uma utilização mais eficiente dos recursos disponíveis.',
                'pergunta_en' => 'Why should I book in advance?',
                'resposta_en' => 'Booking ahead makes workspace organisation easier, avoids conflicts between users, and helps make more efficient use of the available resources.',
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
                'pergunta_en' => 'How do I know which spaces are available?',
                'resposta_en' => 'Once you select the date and period you want, the system automatically shows only the available spaces.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços e disponibilidade',
                'pergunta' => 'Qual é a diferença entre Open Space Central e Open Space Norte?',
                'resposta' => 'O Open Space Central localiza-se junto às principais áreas comuns, como a receção e a zona de convívio. O Open Space Norte oferece um ambiente mais reservado e silencioso, sendo recomendado para tarefas que exigem maior concentração.',
                'pergunta_en' => "What's the difference between Open Space Central and Open Space Norte?",
                'resposta_en' => 'Open Space Central is located near the main common areas, such as reception and the lounge. Open Space Norte offers a quieter, more private setting, recommended for tasks that need more concentration.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços e disponibilidade',
                'pergunta' => 'O que são os Phone Booths?',
                'resposta' => 'São cabines individuais destinadas à realização de chamadas ou videoconferências, reduzindo o ruído nas restantes áreas de trabalho.',
                'pergunta_en' => 'What are the Phone Booths?',
                'resposta_en' => "They're individual booths for phone calls or video conferences, helping reduce noise in the rest of the workspace.",
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
                'pergunta_en' => 'How do I book a space?',
                'resposta_en' => 'Select the date, the period (Morning or Afternoon), and choose one of the available spaces. Then just confirm the booking.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar para outro dia?',
                'resposta' => 'Sim. Desde que existam lugares disponíveis, é possível efetuar reservas para datas futuras.',
                'pergunta_en' => 'Can I book for another day?',
                'resposta_en' => 'Yes. As long as spaces are available, you can make bookings for future dates.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar qualquer espaço?',
                'resposta' => 'Sim. O sistema apresenta todos os espaços disponíveis para a data e período selecionados.',
                'pergunta_en' => 'Can I book any space?',
                'resposta_en' => 'Yes. The system shows every space available for the date and period you selected.',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso ter mais do que uma reserva?',
                'resposta' => 'Não. Cada utilizador pode ter apenas uma reserva ativa para o mesmo período.',
                'pergunta_en' => 'Can I have more than one booking?',
                'resposta_en' => 'No. Each user can only have one active booking for the same period.',
                'ordem' => 4,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'O que acontece se já não existirem lugares disponíveis?',
                'resposta' => 'A lista de espaços apresenta apenas os lugares disponíveis para a data e período selecionados. Se todos estiverem ocupados, não será possível concluir a reserva.',
                'pergunta_en' => "What happens if there aren't any spaces left?",
                'resposta_en' => "The list of spaces only shows what's available for the date and period you selected. If everything's taken, you won't be able to complete the booking.",
                'ordem' => 5,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso alterar uma reserva?',
                'resposta' => 'Sim. Desde que ainda não tenha efetuado o check-in e existam lugares disponíveis, pode alterar a sua reserva, escolhendo uma nova data, período ou espaço. Caso já tenha realizado o check-in, a reserva deixa de poder ser alterada.',
                'pergunta_en' => 'Can I change a booking?',
                'resposta_en' => "Yes. As long as you haven't checked in yet and spaces are available, you can change your booking's date, period, or space. Once you've checked in, the booking can no longer be changed.",
                'ordem' => 6,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso cancelar uma reserva?',
                'resposta' => 'Sim. A reserva pode ser cancelada antes do início do período reservado.',
                'pergunta_en' => 'Can I cancel a booking?',
                'resposta_en' => 'Yes. A booking can be cancelled before the reserved period starts.',
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
                'pergunta_en' => 'How do I pay for a booking?',
                'resposta_en' => 'Once you create a booking, the payment stays pending. To complete it, go to Payments, select the booking, and choose the payment method you want.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Quais são os métodos de pagamento disponíveis?',
                'resposta' => 'Cartão, MB Way, Transferência bancária e PayPal.',
                'pergunta_en' => 'What payment methods are available?',
                'resposta_en' => 'Card, MB Way, bank transfer, and PayPal.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Onde posso consultar os meus pagamentos?',
                'resposta' => 'Na página Pagamentos, disponível no menu lateral, onde pode consultar o histórico e o estado de cada pagamento.',
                'pergunta_en' => 'Where can I check my payments?',
                'resposta_en' => 'On the Payments page, available in the side menu, where you can see the history and status of each payment.',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'Como posso obter o comprovativo de pagamento?',
                'resposta' => 'Depois de o pagamento ficar confirmado como Pago, pode aceder ao comprovativo a partir do detalhe desse pagamento.',
                'pergunta_en' => 'How do I get a payment receipt?',
                'resposta_en' => "Once a payment is confirmed as Paid, you can access the receipt from that payment's details.",
                'ordem' => 4,
                'ativo' => true,
            ],
            [
                'categoria' => 'Pagamentos',
                'pergunta' => 'O que significam os diferentes estados do pagamento?',
                'resposta' => 'Pendente: ainda não foi pago. Pago: o pagamento foi confirmado. Recusado: o pagamento não foi aceite. Reembolsado: o valor foi devolvido. Cancelado: o pagamento foi cancelado, normalmente por a reserva associada ter sido cancelada antes de ser paga.',
                'pergunta_en' => 'What do the different payment statuses mean?',
                'resposta_en' => "Pending: not yet paid. Paid: the payment has been confirmed. Declined: the payment wasn't accepted. Refunded: the amount was returned. Cancelled: the payment was cancelled, usually because the related booking was cancelled before it was paid.",
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
                'pergunta_en' => 'How do I check in?',
                'resposta_en' => 'You can check in three ways: directly on the SpaceHub platform, by scanning the QR Code at the reserved space, or in person at reception.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Check-in',
                'pergunta' => 'O que acontece se não fizer check-in?',
                'resposta' => 'Se não realizar o check-in nos primeiros 30 minutos após o início do período reservado, a reserva é automaticamente marcada como expirada e o lugar fica novamente disponível.',
                'pergunta_en' => "What happens if I don't check in?",
                'resposta_en' => "If you don't check in within the first 30 minutes after the reserved period starts, the booking is automatically marked as expired and the space becomes available again.",
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
                'pergunta_en' => 'How do I change my details?',
                'resposta_en' => 'You can update your information on the Profile page.',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Esqueci-me da palavra-passe.',
                'resposta' => 'Utilize a opção "Recuperar Palavra-passe" disponível na página de autenticação. Depois de iniciar sessão, também poderá alterar a palavra-passe na página Perfil.',
                'pergunta_en' => 'I forgot my password.',
                'resposta_en' => 'Use the "Forgot Password" option on the login page. Once logged in, you can also change your password on the Profile page.',
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
