import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

const SECTIONS = [
    { id: 'introducao', title: 'Introdução' },
    { id: 'dados-recolhidos', title: 'Dados recolhidos' },
    { id: 'finalidade', title: 'Finalidade do tratamento' },
    { id: 'base-legal', title: 'Base legal' },
    { id: 'partilha', title: 'Partilha com terceiros' },
    { id: 'conservacao', title: 'Conservação dos dados' },
    { id: 'direitos', title: 'Os seus direitos' },
    { id: 'seguranca', title: 'Segurança' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'alteracoes', title: 'Alterações a esta política' },
    { id: 'contacto', title: 'Contacto' },
];

export default function Privacy() {
    return (
        <>
            <Head title="Política de Privacidade" />

            <LegalLayout
                icon={ShieldCheck}
                title="Política de Privacidade"
                subtitle="Explicamos aqui que dados pessoais recolhemos, para que finalidade, e quais os direitos que tem sobre a sua informação enquanto utilizador do SpaceHub."
                updatedAt="17 de julho de 2026"
                sections={SECTIONS}
            >
                <LegalSection
                    id="introducao"
                    number={1}
                    title="Introdução"
                >
                    <p>
                        Esta Política de Privacidade descreve como o
                        SpaceHub recolhe, utiliza e protege os dados
                        pessoais dos seus utilizadores, em conformidade
                        com o Regulamento Geral sobre a Proteção de Dados
                        (RGPD). Ao utilizar a plataforma, aceita as
                        práticas aqui descritas.
                    </p>
                </LegalSection>

                <LegalSection
                    id="dados-recolhidos"
                    number={2}
                    title="Dados recolhidos"
                >
                    <p>Recolhemos os seguintes tipos de dados:</p>

                    <ul>
                        <li>
                            <strong>Dados de identificação:</strong> nome,
                            endereço de e-mail e, opcionalmente,
                            fotografia de perfil;
                        </li>
                        <li>
                            <strong>Dados de autenticação:</strong> senha
                            encriptada, ou identificador da conta Google
                            quando o início de sessão é feito através
                            desse serviço;
                        </li>
                        <li>
                            <strong>Dados de utilização:</strong>{' '}
                            reservas efetuadas, datas e períodos
                            reservados, secretárias e espaços utilizados,
                            registos de check-in;
                        </li>
                        <li>
                            <strong>Dados técnicos:</strong> endereço IP e
                            informação de sessão, utilizados para
                            segurança e prevenção de abuso (ex.: limite de
                            tentativas de login).
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="finalidade"
                    number={3}
                    title="Finalidade do tratamento"
                >
                    <p>Os dados recolhidos são utilizados para:</p>

                    <ul>
                        <li>Criar e gerir a sua conta de utilizador;</li>
                        <li>
                            Processar reservas de espaços e permitir o
                            check-in através de código QR;
                        </li>
                        <li>
                            Enviar comunicações relacionadas com a sua
                            conta (confirmações, recuperação de senha,
                            verificação de e-mail);
                        </li>
                        <li>
                            Garantir a segurança da plataforma e prevenir
                            utilização indevida.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="base-legal"
                    number={4}
                    title="Base legal"
                >
                    <p>
                        Tratamos os seus dados com base em três
                        fundamentos: a <strong>execução do contrato</strong>{' '}
                        de utilização estabelecido ao criar a conta
                        (necessário para gerir reservas e check-ins), o{' '}
                        <strong>cumprimento de obrigações legais</strong> a
                        que estamos sujeitos, e o seu{' '}
                        <strong>consentimento explícito</strong>, dado ao
                        aceitar estes termos no momento do registo — o
                        qual pode ser retirado a qualquer momento, sem
                        comprometer a licitude do tratamento realizado
                        anteriormente.
                    </p>
                </LegalSection>

                <LegalSection
                    id="partilha"
                    number={5}
                    title="Partilha com terceiros"
                >
                    <p>
                        Não vendemos nem partilhamos os seus dados
                        pessoais com terceiros para fins comerciais.
                        Podemos partilhar dados limitados com:
                    </p>

                    <ul>
                        <li>
                            <strong>Google:</strong> caso opte por iniciar
                            sessão através do Google, este serviço
                            processa a autenticação de acordo com a
                            própria política de privacidade da Google;
                        </li>
                        <li>
                            <strong>Administradores da organização:</strong>{' '}
                            no âmbito da gestão de espaços, reservas e
                            segurança da plataforma.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="conservacao"
                    number={6}
                    title="Conservação dos dados"
                >
                    <p>
                        Os dados pessoais são conservados enquanto a conta
                        se mantiver ativa. Após o encerramento de uma
                        conta, os dados poderão ser conservados por um
                        período adicional limitado, quando exigido por
                        obrigações legais ou para efeitos de segurança e
                        resolução de eventuais litígios.
                    </p>
                </LegalSection>

                <LegalSection
                    id="direitos"
                    number={7}
                    title="Os seus direitos"
                >
                    <p>
                        Nos termos do RGPD, tem direito a aceder,
                        retificar, apagar ou limitar o tratamento dos
                        seus dados pessoais, bem como a solicitar a
                        portabilidade dos mesmos e a opor-se ao seu
                        tratamento em determinadas circunstâncias. Pode
                        exercer estes direitos a qualquer momento através
                        do Centro de Ajuda.
                    </p>

                    <p>
                        Caso considere que o tratamento dos seus dados
                        viola a legislação aplicável, tem ainda o direito
                        de apresentar reclamação junto da Comissão
                        Nacional de Proteção de Dados (CNPD), enquanto
                        autoridade de controlo competente.
                    </p>
                </LegalSection>

                <LegalSection
                    id="seguranca"
                    number={8}
                    title="Segurança"
                >
                    <p>
                        Adotamos medidas técnicas e organizativas
                        adequadas para proteger os seus dados, incluindo
                        encriptação de senhas, controlo de acesso baseado
                        em funções e limitação de tentativas de
                        autenticação. Nenhum sistema é, no entanto,
                        totalmente imune a riscos, pelo que recomendamos a
                        utilização de uma senha forte e exclusiva.
                    </p>
                </LegalSection>

                <LegalSection
                    id="cookies"
                    number={9}
                    title="Cookies"
                >
                    <p>
                        Utilizamos cookies e armazenamento local
                        estritamente necessários ao funcionamento da
                        plataforma, nomeadamente para manter a sua sessão
                        iniciada e guardar a sua preferência de tema
                        (claro/escuro). Não utilizamos cookies de
                        publicidade ou de rastreamento de terceiros.
                    </p>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={10}
                    title="Alterações a esta política"
                >
                    <p>
                        Esta Política de Privacidade pode ser atualizada
                        periodicamente. Notificaremos alterações
                        relevantes através da plataforma, sendo a
                        utilização continuada do SpaceHub considerada
                        como aceitação da versão mais recente.
                    </p>
                </LegalSection>

                <LegalSection
                    id="contacto"
                    number={11}
                    title="Contacto"
                >
                    <p>
                        Para exercer os seus direitos ou esclarecer
                        qualquer dúvida sobre esta Política de
                        Privacidade, entre em contacto com a equipa do
                        SpaceHub através do Centro de Ajuda da
                        plataforma.
                    </p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
