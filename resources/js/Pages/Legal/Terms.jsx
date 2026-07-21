import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

const SECTIONS = [
    { id: 'aceitacao', title: 'Aceitação dos termos' },
    { id: 'conta', title: 'Conta de utilizador' },
    { id: 'reservas', title: 'Reservas e check-in' },
    { id: 'conduta', title: 'Regras de utilização' },
    { id: 'propriedade', title: 'Propriedade intelectual' },
    { id: 'suspensao', title: 'Suspensão e encerramento' },
    { id: 'responsabilidade', title: 'Limitação de responsabilidade' },
    { id: 'alteracoes', title: 'Alterações aos termos' },
    { id: 'contacto', title: 'Contacto' },
];

export default function Terms() {
    return (
        <>
            <Head title="Termos de Utilização" />

            <LegalLayout
                icon={FileText}
                title="Termos de Utilização"
                subtitle="Estas condições regulam o acesso e a utilização da plataforma SpaceHub. Ao criar uma conta, confirma que leu e aceita os termos abaixo."
                updatedAt="17 de julho de 2026"
                sections={SECTIONS}
            >
                <LegalSection
                    id="aceitacao"
                    number={1}
                    title="Aceitação dos termos"
                >
                    <p>
                        Ao aceder ou utilizar o SpaceHub, o utilizador
                        declara ter lido, compreendido e aceite estes
                        Termos de Utilização, bem como a nossa{' '}
                        <a href="/politica-privacidade">
                            Política de Privacidade
                        </a>
                        . Caso não concorde com alguma destas condições,
                        não deverá utilizar a plataforma.
                    </p>
                </LegalSection>

                <LegalSection
                    id="conta"
                    number={2}
                    title="Conta de utilizador"
                >
                    <p>
                        Para utilizar a maioria das funcionalidades do
                        SpaceHub é necessário criar uma conta, através de
                        registo direto ou de início de sessão com o
                        Google. O utilizador é responsável por:
                    </p>

                    <ul>
                        <li>
                            Fornecer informação verdadeira, completa e
                            atualizada no momento do registo;
                        </li>
                        <li>
                            Manter a confidencialidade da sua senha e de
                            qualquer credencial de acesso;
                        </li>
                        <li>
                            Notificar a equipa responsável em caso de
                            utilização não autorizada da sua conta.
                        </li>
                    </ul>

                    <p>
                        Contas podem ser suspensas ou desativadas por um
                        administrador em caso de incumprimento destes
                        termos, sem prejuízo de outras medidas aplicáveis.
                    </p>
                </LegalSection>

                <LegalSection
                    id="reservas"
                    number={3}
                    title="Reservas e check-in"
                >
                    <p>
                        O SpaceHub permite reservar secretárias e espaços
                        de trabalho, consultar disponibilidade e efetuar
                        check-in através de código QR. Ao efetuar uma
                        reserva, o utilizador compromete-se a:
                    </p>

                    <ul>
                        <li>
                            Utilizar o espaço reservado apenas durante o
                            período confirmado;
                        </li>
                        <li>
                            Cancelar a reserva com a devida antecedência
                            caso não pretenda comparecer;
                        </li>
                        <li>
                            Não efetuar reservas duplicadas ou em nome de
                            terceiros sem autorização.
                        </li>
                    </ul>

                    <p>
                        A organização reserva-se o direito de cancelar
                        reservas em situações excecionais (manutenção,
                        indisponibilidade do espaço ou motivos de força
                        maior), procurando sempre notificar o utilizador
                        com a maior antecedência possível.
                    </p>
                </LegalSection>

                <LegalSection
                    id="conduta"
                    number={4}
                    title="Regras de utilização"
                >
                    <p>Ao utilizar o SpaceHub, o utilizador compromete-se a não:</p>

                    <ul>
                        <li>
                            Tentar aceder a áreas, contas ou dados a que
                            não tenha autorização;
                        </li>
                        <li>
                            Utilizar a plataforma para fins fraudulentos,
                            ilícitos ou que violem direitos de terceiros;
                        </li>
                        <li>
                            Interferir com o normal funcionamento do
                            serviço, incluindo tentativas de sobrecarga
                            ou exploração de vulnerabilidades.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection
                    id="propriedade"
                    number={5}
                    title="Propriedade intelectual"
                >
                    <p>
                        O nome SpaceHub, o respetivo logótipo, interface e
                        conteúdos originais são propriedade da
                        organização responsável pela plataforma. É
                        proibida a reprodução, distribuição ou
                        modificação destes elementos sem autorização
                        prévia.
                    </p>
                </LegalSection>

                <LegalSection
                    id="suspensao"
                    number={6}
                    title="Suspensão e encerramento"
                >
                    <p>
                        Podemos suspender ou encerrar o acesso de um
                        utilizador à plataforma, total ou parcialmente,
                        em caso de violação destes termos, utilização
                        indevida do serviço ou por indicação de um
                        administrador responsável pela gestão dos
                        espaços. O utilizador pode, a qualquer momento,
                        solicitar o encerramento da sua conta através do
                        Centro de Ajuda.
                    </p>
                </LegalSection>

                <LegalSection
                    id="responsabilidade"
                    number={7}
                    title="Limitação de responsabilidade"
                >
                    <p>
                        O SpaceHub é disponibilizado "tal como está".
                        Envidamos esforços razoáveis para garantir a
                        disponibilidade e o correto funcionamento da
                        plataforma, mas não garantimos que o serviço
                        estará sempre livre de interrupções, atrasos ou
                        erros pontuais, nomeadamente durante operações de
                        manutenção.
                    </p>

                    <p>
                        Na medida permitida por lei, não nos
                        responsabilizamos por danos indiretos, lucros
                        cessantes ou perdas de oportunidade resultantes da
                        utilização, impossibilidade de utilização ou
                        indisponibilidade temporária do serviço. Esta
                        limitação não afeta quaisquer direitos que não
                        possam ser excluídos ou limitados nos termos da
                        lei aplicável.
                    </p>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={8}
                    title="Alterações aos termos"
                >
                    <p>
                        Estes termos podem ser atualizados periodicamente
                        para refletir alterações ao serviço ou a
                        requisitos legais. Alterações significativas
                        serão comunicadas através da plataforma. A
                        utilização continuada do SpaceHub após uma
                        alteração implica a aceitação dos novos termos.
                    </p>
                </LegalSection>

                <LegalSection
                    id="contacto"
                    number={9}
                    title="Contacto"
                >
                    <p>
                        Para questões relacionadas com estes Termos de
                        Utilização, entre em contacto com a equipa do
                        SpaceHub através do Centro de Ajuda da
                        plataforma.
                    </p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
