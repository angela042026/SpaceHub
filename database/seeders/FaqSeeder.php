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

            /*
            |--------------------------------------------------------------------------
            | Reservas
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Reservas',
                'pergunta' => 'Como posso reservar uma secretária?',
                'resposta' => 'Selecione a data, o período (Manhã ou Tarde) e escolha uma das secretárias disponíveis. Depois basta confirmar a reserva.',
                'keywords' => 'reserv, mesa, lugar, secretária, agend, marcar',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar para outro dia?',
                'resposta' => 'Sim. Desde que existam lugares disponíveis, é possível efetuar reservas para datas futuras.',
                'keywords' => 'reserv, outro dia, data, data, adiar, reagendar',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Como sei quais as secretárias disponíveis?',
                'resposta' => 'Após selecionar a data e o período pretendidos, o sistema apresenta automaticamente apenas as secretárias disponíveis.',
                'keywords' => 'secretária, mesa, lugar, dispon',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso reservar qualquer secretária?',
                'resposta' => 'Sim. O sistema apresenta todas as secretárias disponíveis para a data e período selecionados.',
                'keywords' => 'reserv, secretária, mesa, lugar, dispon',
                'ordem' => 4,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso ter mais do que uma reserva?',
                'resposta' => 'Não. Cada utilizador pode ter apenas uma reserva ativa para o mesmo período.',
                'keywords' => 'reserv, várias, múltiplas, mais do que uma, duplicada',
                'ordem' => 5,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso alterar uma reserva?',
                'resposta' => 'Sim. Desde que ainda não tenha efetuado o check-in e existam lugares disponíveis, pode alterar a sua reserva, escolhendo uma nova data, período ou secretária. Caso já tenha realizado o check-in, a reserva deixa de poder ser alterada.',
                'keywords' => 'alter, alter, reserv, como alterar, como',
                'ordem' => 6,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'Posso cancelar uma reserva?',
                'resposta' => 'Sim. A reserva pode ser cancelada antes do início do período reservado.',
                'keywords' => 'cancel, reserv, anul, desist',
                'ordem' => 7,
                'ativo' => true,
            ],
            [
                'categoria' => 'Reservas',
                'pergunta' => 'O que acontece se já não existirem lugares disponíveis?',
                'resposta' => 'A lista de secretárias apresenta apenas os lugares disponíveis para a data e período selecionados. Se todos estiverem ocupados, não será possível concluir a reserva.',
                'keywords' => 'lugar, dispon, indispon, esgotado, cheio, ocupad',
                'ordem' => 8,
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
                'resposta' => 'O check-in pode ser efetuado de três formas: diretamente na plataforma SPACE HUB, através da leitura do QR Code existente na secretária reservada ou presencialmente na receção.',
                'keywords' => 'check, como fazer check-in, entrar, validar',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Check-in',
                'pergunta' => 'O que acontece se não fizer check-in?',
                'resposta' => 'Se não realizar o check-in nos primeiros 30 minutos após o início do período reservado, a reserva é automaticamente marcada como expirada e o lugar fica novamente disponível.',
                'keywords' => 'check, checkin, não faz, falh, expir, esquec',
                'ordem' => 2,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Espaços
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Espaços',
                'pergunta' => 'Qual é a diferença entre Open Space Central e Open Space Norte?',
                'resposta' => 'O Open Space Central localiza-se junto às principais áreas comuns, como a receção e a zona de convívio. O Open Space Norte oferece um ambiente mais reservado e silencioso, sendo recomendado para tarefas que exigem maior concentração.',
                'keywords' => 'open space, central, norte, diferença, zona, área, localização',
                'ordem' => 1,
                'ativo' => true,
            ],

            [
                'categoria' => 'Espaços',
                'pergunta' => 'O que são os Phone Booths?',
                'resposta' => 'São cabines individuais destinadas à realização de chamadas ou videoconferências, reduzindo o ruído nas restantes áreas de trabalho.',
                'keywords' => 'phone, booth, cabine, chamada, videoconferência, ruído',
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
                'keywords' => 'dados, perfil, nome, email, contacto',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Conta',
                'pergunta' => 'Esqueci-me da palavra-passe.',
                'resposta' => 'Utilize a opção "Recuperar Palavra-passe" disponível na página de autenticação. Depois de iniciar sessão, também poderá alterar a palavra-passe na página Perfil.',
                'keywords' => 'palavra-passe, recuperar, autenticação, senha, password, login',
                'ordem' => 2,
                'ativo' => true,
            ],

            /*
            |--------------------------------------------------------------------------
            | Space Hub
            |--------------------------------------------------------------------------
            */

            [
                'categoria' => 'Space Hub',
                'pergunta' => 'O que é o SPACE HUB?',
                'resposta' => 'O SPACE HUB é uma plataforma de gestão e reserva de espaços de trabalho concebida para empresas que utilizam modelos de trabalho híbridos e flexíveis.',
                'keywords' => 'space hub, plataforma, gestão, reserva, espaços, trabalho',
                'ordem' => 1,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'Quem pode utilizar a plataforma?',
                'resposta' => 'A plataforma destina-se a colaboradores autenticados e autorizados pela organização.',
                'keywords' => 'utiliza, quem, acesso',
                'ordem' => 2,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'Porque devo reservar previamente?',
                'resposta' => 'A reserva permite uma melhor organização dos espaços de trabalho, evita conflitos entre utilizadores e contribui para uma utilização mais eficiente dos recursos disponíveis.',
                'keywords' => 'antecipad, anteced',
                'ordem' => 3,
                'ativo' => true,
            ],
            [
                'categoria' => 'Space Hub',
                'pergunta' => 'Disponibilizam comida e bebidas?',
                'resposta' => 'O Space Hub disponibiliza serviços de suporte aos open spaces e salas de reuniões, como mini-bar e catering. Café, chá e bebidas variadas (estas com um custo adicional) estão disponíveis na copa do edifício. Para opções de catering, por favor contacte a nossa equipa de suporte.',
                'keywords' => 'serviços, disponíveis, local',
                'ordem' => 4,
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
