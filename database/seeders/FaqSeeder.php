<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Executa o seeder das FAQs.
     */
    public function run(): void
    {
        $faqs = [
            // Reservas      

            [
                'categoria' => 'Reservas',
                'pergunta' => 'Como posso reservar uma secretária?',
                'resposta' => 'Selecione a data, o período (Manhã ou Tarde) e escolha uma das secretárias disponíveis. Depois basta confirmar a reserva.',
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
                'pergunta' => 'Posso reservar para outro dia?',
                'resposta' => 'Sim. Desde que existam lugares disponíveis, é possível efetuar reservas para datas futuras.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'O que acontece se já não existirem lugares disponíveis?',
                'resposta' => 'A lista de secretárias apresenta apenas os lugares disponíveis para a data e período selecionados. Se todos estiverem ocupados, não será possível concluir a reserva.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso cancelar uma reserva?',
                'resposta' => 'Sim. A reserva pode ser cancelada antes do início do período reservado.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Check-in',
                'pergunta' => 'O que acontece se não fizer check-in?',
                'resposta' => 'Se não realizar o check-in nos primeiros 30 minutos após o início do período reservado, a reserva é automaticamente marcada como expirada e o lugar fica novamente disponível.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Check-in',
                'pergunta' => 'Como faço o check-in?',
                'resposta' => 'O check-in pode ser efetuado de três formas: diretamente na plataforma SPACE HUB, através da leitura do QR Code existente na secretária reservada ou presencialmente na receção.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços',
                'pergunta' => 'Qual é a diferença entre Open Space Central e Open Space Norte?',
                'resposta' => 'xxxxxx',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Espaços',
                'pergunta' => 'Qual é a diferença entre Open Space Central e Open Space Norte?',
                'resposta' => 'xxxxxx',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'O que são os Phone Booths?',
                'resposta' => 'São cabines individuais destinadas à realização de chamadas ou videoconferências, reduzindo o ruído nas restantes áreas de trabalho.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Como sei quais as secretárias disponíveis?',
                'resposta' => 'Depois de selecionar a data e o período, o sistema apresenta apenas as secretárias que ainda se encontram livres.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Como altero os meus dados?',
                'resposta' => 'Pode atualizar as suas informações através da página Perfil.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Como altero os meus dados?',
                'resposta' => 'Pode atualizar as suas informações através da página Perfil.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Esqueci-me da palavra-passe.',
                'resposta' => 'Utilize a opção Recuperar Palavra-passe disponível na página de autenticação e/ou através da página Perfil.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'O que é o SPACE HUB?',
                'resposta' => 'O SPACE HUB é uma plataforma de gestão e reserva de espaços de trabalho concebida para empresas que utilizam modelos de trabalho híbridos e flexíveis.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'Quem pode utilizar a plataforma?',
                'resposta' => 'A plataforma destina-se a colaboradores autenticados e autorizados pela organização.',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'Porque devo reservar previamente?',
                'resposta' => 'A reserva permite uma melhor organização dos espaços de trabalho, evita conflitos entre utilizadores e contribui para uma utilização mais eficiente dos recursos disponíveis.',
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
