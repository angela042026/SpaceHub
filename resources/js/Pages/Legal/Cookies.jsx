import LegalLayout from '@/Components/Legal/LegalLayout';
import LegalSection from '@/Components/Legal/LegalSection';
import { Head, router } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Cookies() {
    const { t } = useTranslation('legal');

    const SECTIONS = [
        { id: 'introducao', title: t('cookies.sections.introducao') },
        { id: 'essenciais', title: t('cookies.sections.essenciais') },
        { id: 'opcionais', title: t('cookies.sections.opcionais') },
        { id: 'preferencias', title: t('cookies.sections.preferencias') },
        { id: 'alteracoes', title: t('cookies.sections.alteracoes') },
        { id: 'contacto', title: t('cookies.sections.contacto') },
    ];

    const handleChangePreferences = () => {
        localStorage.removeItem('spacehub_cookie_consent');
        router.visit(route('home'));
    };

    return (
        <>
            <Head title={t('cookies.titulo')} />

            <LegalLayout
                icon={Cookie}
                title={t('cookies.titulo')}
                subtitle={t('cookies.subtitulo')}
                updatedAt={t('cookies.atualizadoEm')}
                sections={SECTIONS}
            >
                <LegalSection
                    id="introducao"
                    number={1}
                    title={t('cookies.sections.introducao')}
                >
                    <p>
                        {t('cookies.introducao.parte1')}
                        <em>localStorage</em>
                        {t('cookies.introducao.parte2')}
                    </p>
                </LegalSection>

                <LegalSection
                    id="essenciais"
                    number={2}
                    title={t('cookies.sections.essenciais')}
                >
                    <p>{t('cookies.essenciais.intro')}</p>

                    <ul>
                        <li>
                            <strong>{t('cookies.essenciais.li1Strong')}</strong>{' '}
                            {t('cookies.essenciais.li1')}
                        </li>
                        <li>
                            <strong>{t('cookies.essenciais.li2Strong')}</strong>{' '}
                            {t('cookies.essenciais.li2')}
                        </li>
                        <li>
                            <strong>{t('cookies.essenciais.li3Strong')}</strong>{' '}
                            {t('cookies.essenciais.li3')}
                        </li>
                    </ul>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.nome')}
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.finalidade')}
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.duracao')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub-session
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.cookieSessao')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.duracaoInatividade')}
                                    </td>
                                </tr>

                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        XSRF-TOKEN
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.cookieXsrf')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.duracaoInatividade')}
                                    </td>
                                </tr>

                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub-theme
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.cookieTema')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.duracaoAteApagado')}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        spacehub_cookie_consent
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.cookieConsent')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.essenciais.duracaoAteApagado')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </LegalSection>

                <LegalSection
                    id="opcionais"
                    number={3}
                    title={t('cookies.sections.opcionais')}
                >
                    <p>{t('cookies.opcionais.intro')}</p>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.nome')}
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.finalidade')}
                                    </th>
                                    <th className="px-4 py-2.5 font-semibold text-[#102E55] dark:text-white">
                                        {t('cookies.tabela.duracao')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        _ga
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.opcionais.cookieGa')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.opcionais.duracao')}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-4 py-2.5 font-mono text-xs">
                                        _ga_&lt;container-id&gt;
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.opcionais.cookieGaSession')}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {t('cookies.opcionais.duracao')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('cookies.opcionais.nota')}
                    </p>
                </LegalSection>

                <LegalSection
                    id="preferencias"
                    number={4}
                    title={t('cookies.sections.preferencias')}
                >
                    <p>{t('cookies.preferencias.texto')}</p>

                    <button
                        type="button"
                        onClick={handleChangePreferences}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-[#03172B] shadow-lg shadow-[#14B8A6]/20 transition hover:bg-[#0F9F91]"
                    >
                        {t('cookies.preferencias.botao')}
                    </button>
                </LegalSection>

                <LegalSection
                    id="alteracoes"
                    number={5}
                    title={t('cookies.sections.alteracoes')}
                >
                    <p>{t('cookies.alteracoes.texto')}</p>
                </LegalSection>

                <LegalSection id="contacto" number={6} title={t('cookies.sections.contacto')}>
                    <p>{t('cookies.contacto.texto')}</p>
                </LegalSection>
            </LegalLayout>
        </>
    );
}
