import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head, router } from '@inertiajs/react';
import { Cookie } from 'lucide-react';

const SECTIONS = [
    { id: 'introducao', title: 'O que são cookies' },
    { id: 'essenciais', title: 'Cookies essenciais' },
    { id: 'opcionais', title: 'Cookies opcionais' },
    { id: 'preferencias', title: 'Gerir preferências' },
    { id: 'alteracoes', title: 'Alterações a esta política' },
    { id: 'contacto', title: 'Contacto' },
];

export default function Cookies() {
    const handleChangePreferences = () => {
        localStorage.removeItem('spacehub_cookie_consent');
        router.visit(route('home'));
    };

    return (
        <>
            <Head title="Política de Cookies" />

            <LegalLayout
                icon={Cookie}
                title="Política de Cookies"
                subtitle="Explicamos aqui que cookies e tecnologias semelhantes utilizamos, para que servem, e como pode alterar a sua preferência a qualquer momento."
                updatedAt="23 de julho de 2026"
                sections={SECTIONS}
            >
                <LegalSection
                    id="introducao"
                    number={1}
                    title="O que são cookies"
                >
                    <p>
                        Cookies são pequenos ficheiros de texto guardados no
                        seu dispositivo quando visita a SpaceHub. Utilizamo-
                        los, juntamente com armazenamento local semelhante
                        (<em>localStorage</em>), para o funcionamento da
                        plataforma e, mediante o seu consentimento, para
                        compreender melhor como a plataforma é utilizada.
                    </p>
                </LegalSection>

                <LegalSection
                    id="essenciais"
                    number={2}
                    title="Cookies essenciais"
                >
                    <p>
                        Estes cookies estão sempre ativos, pois são
                        estritamente necessários para a plataforma funcionar
                        corretamente. Não pedimos consentimento para estes,
                        porque não recolhem dados para fins de análise,
                        publicidade ou marketing.
                    </p>

                    <ul>
                        <li>
                            <strong>Sessão e autenticação:</strong> mantêm a
                            sua sessão iniciada e protegem o acesso à sua
                            conta;
                        </li>
                        <li>
                            <strong>Preferências de interface:</strong>{' '}
                            guardam, por exemplo, a sua escolha de tema
                            (claro/escuro);
                        </li>
                        <li>
                            <strong>Segurança:</strong> ajudam a prevenir a
                            utilização abusiva da plataforma.
                        </li>
                    </ul>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Nome
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Finalidade
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Duração
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub-session
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Mantém a sua sessão de autenticação
                                        iniciada.
                                    </td>
                                    <td className="px-4 py-2.5">
                                        2 horas de inatividade
                                    </td>
                                </tr>

                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        XSRF-TOKEN
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Protege os formulários da
                                        plataforma contra ataques CSRF.
                                    </td>
                                    <td className="px-4 py-2.5">
                                        2 horas de inatividade
                                    </td>
                                </tr>

                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub-theme
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Guarda a sua preferência de tema
                                        (claro/escuro).
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Até ser apagado
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub_cookie_consent
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Guarda a sua escolha no banner de
                                        cookies.
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Até ser apagado
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </LegalSection>

                <LegalSection
                    id="opcionais"
                    number={3}
                    title="Cookies opcionais"
                >
                    <p>
                        Só são ativados se aceitar cookies opcionais no
                        banner apresentado na sua primeira visita.
                        Utilizamos o Google Analytics para perceber, de
                        forma agregada, como a plataforma é utilizada (por
                        exemplo, quais as páginas mais visitadas), o que nos
                        ajuda a melhorar a experiência de utilização. Se
                        rejeitar ou não responder ao banner, este script
                        nunca chega a ser carregado.
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Nome
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Finalidade
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        Duração
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        _ga
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Google Analytics — distingue
                                        utilizadores de forma anónima.
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Até 2 anos
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        _ga_&lt;container-id&gt;
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Google Analytics — mantém o estado
                                        da sessão de navegação.
                                    </td>
                                    <td className="px-4 py-2.5">
                                        Até 2 anos
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Estes cookies só existem se aceitar cookies
                        opcionais e se o Google Analytics estiver
                        configurado na plataforma.
                    </p>
                </LegalSection>

                <LegalSection
                    id="preferencias"
                    number={4}
                    title="Gerir as suas preferências"
                >
                    <p>
                        Pode alterar a sua escolha a qualquer momento. Ao
                        clicar no botão abaixo, a sua preferência atual é
                        apagada e o banner de cookies volta a ser
                        apresentado na página inicial.
                    </p>

                    <button
                        type="button"
                        onClick={handleChangePreferences}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-[#03172B] shadow-lg shadow-[#14B8A6]/20 transition hover:bg-[#0F9F91]"
                    >
                        Alterar preferências de cookies
                    </button>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={5}
                    title="Alterações a esta política"
                >
                    <p>
                        Esta Política de Cookies pode ser atualizada
                        periodicamente, nomeadamente se adicionarmos novos
                        cookies opcionais. Recomendamos a consulta ocasional
                        desta página.
                    </p>
                </LegalSection>

                <LegalSection id="contacto" number={6} title="Contacto">
                    <p>
                        Para esclarecer qualquer dúvida sobre esta Política
                        de Cookies, entre em contacto com a equipa do
                        SpaceHub através do Centro de Ajuda da plataforma.
                    </p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
