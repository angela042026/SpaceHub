    import DashboardLayout from '@/Layouts/DashboardLayout';
    import AuthHeader from '@/Components/Auth/AuthHeader';
    import AuthFooter from '@/Components/Auth/AuthFooter';
    import useTheme from '@/Hooks/useTheme';
    import { Head, Link, usePage } from '@inertiajs/react';
    import { useTranslation } from 'react-i18next';
    import {
        HelpCircle,
        Search,
        Mail,
        ShieldCheck,
        MessageCircleMore,
        ArrowRight,
        Headphones,
        LogIn,
        Info,
        Building2,
        CalendarDays,
        CreditCard,
        QrCode,
        UserRound,
        X,
    } from 'lucide-react';
    import { Fragment, useState } from 'react';

    const CATEGORIAS_BASE = [
        { chave: 'Sobre o SpaceHub', labelChave: 'sobre', slug: 'sobre', Icone: Info },
        { chave: 'Espaços e disponibilidade', labelChave: 'espacos', slug: 'espacos', Icone: Building2 },
        { chave: 'Reservas', labelChave: 'reservas', slug: 'reservas', Icone: CalendarDays },
        { chave: 'Pagamentos', labelChave: 'pagamentos', slug: 'pagamentos', Icone: CreditCard },
        { chave: 'Check-in', labelChave: 'checkin', slug: 'checkin', Icone: QrCode },
        { chave: 'Conta', labelChave: 'conta', slug: 'conta', Icone: UserRound },
    ];

    function escaparRegex(texto) {
        return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function destacarTermo(texto, termo) {
        if (!termo || !texto) {
            return texto;
        }

        const partes = texto.split(new RegExp(`(${escaparRegex(termo)})`, 'gi'));

        return partes.map((parte, indice) =>
            parte.toLowerCase() === termo.toLowerCase() ? (
                <mark
                    key={indice}
                    className="rounded bg-teal-100 px-0.5 text-teal-900 dark:bg-teal-500/30 dark:text-teal-100"
                >
                    {parte}
                </mark>
            ) : (
                <Fragment key={indice}>{parte}</Fragment>
            ),
        );
    }
    export default function Index({ faqs = {} }) {
        const { t } = useTranslation('suporte');
        const { auth } = usePage().props;
        const estaAutenticado = Boolean(auth?.user);
        const { theme, toggleTheme } = useTheme();

        const [pesquisa, setPesquisa] = useState('');
        const [abertas, setAbertas] = useState(() => new Set());

        const alternarFaq = (id) => {
            setAbertas((atual) => {
                const nova = new Set(atual);
                if (nova.has(id)) {
                    nova.delete(id);
                } else {
                    nova.add(id);
                }
                return nova;
            });
        };

        const termoPesquisa = pesquisa.trim().toLowerCase();

        // Mapeia as categorias base + eventuais categorias personalizadas que existam na BD
        const todasCategoriasChaves = Array.from(
            new Set([...CATEGORIAS_BASE.map((c) => c.chave), ...Object.keys(faqs)]),
        );

        const listaCategorias = todasCategoriasChaves.map((chave) => {
            const base = CATEGORIAS_BASE.find((c) => c.chave === chave);
            if (base) return base;

            // Categoria personalizada criada dinamicamente
            const slug = chave.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return {
                chave,
                labelChave: null,
                nomeCustom: chave,
                slug,
                Icone: HelpCircle,
            };
        });

        // Filtra as FAQs por Pergunta, Resposta ou Keywords (PT/EN)
        const categoriasFiltradas = listaCategorias.map((categoria) => {
            const itensCategoria = faqs[categoria.chave] ?? [];

            const itens = termoPesquisa
                ? itensCategoria.filter(
                    (faq) =>
                        faq.pergunta?.toLowerCase().includes(termoPesquisa) ||
                        faq.resposta?.toLowerCase().includes(termoPesquisa) ||
                        faq.keywords_pt?.toLowerCase().includes(termoPesquisa) ||
                        faq.keywords_en?.toLowerCase().includes(termoPesquisa),
                )
                : itensCategoria;

            return { ...categoria, itens };
        }).filter((categoria) => categoria.itens.length > 0);

        const totalResultados = categoriasFiltradas.reduce(
            (total, categoria) => total + categoria.itens.length,
            0,
        );

        const semResultados = termoPesquisa !== '' && totalResultados === 0;

        const irParaCategoria = (slug) => {
            document.getElementById(`faq-cat-${slug}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        };

        const obtermNomeCategoria = (cat) => {
            if (cat.labelChave) {
                return t(`faqs.categorias.${cat.labelChave}`);
            }
            return cat.nomeCustom || cat.chave;
        };

        const conteudo = (
            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <HelpCircle size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('faqs.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('faqs.subtitulo')}
                        </p>
                    </div>
                </div>

                <div className="p-6 pb-28 sm:pb-24">
                    {/* Barra de pesquisa */}
                    <div className="relative mb-4">
                        <Search
                            size={18}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder={t('faqs.pesquisarPlaceholder')}
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        {pesquisa && (
                            <button
                                type="button"
                                onClick={() => setPesquisa('')}
                                aria-label={t('faqs.limparPesquisa')}
                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            >
                                <X size={16} strokeWidth={1.9} />
                            </button>
                        )}
                    </div>

                    {/* Navegação rápida por categoria */}
                    <div className="-mx-1 mb-8 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1">
                        {listaCategorias.map((categoria) => {
                            const disponivel = categoriasFiltradas.some(
                                (c) => c.chave === categoria.chave,
                            );

                            return (
                                <button
                                    key={categoria.chave}
                                    type="button"
                                    onClick={() => irParaCategoria(categoria.slug)}
                                    disabled={!disponivel}
                                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                                        disponivel
                                            ? 'border-slate-200 text-slate-600 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-teal-500/10 dark:hover:text-teal-400'
                                            : 'cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600'
                                    }`}
                                >
                                    <categoria.Icone size={14} strokeWidth={1.9} />
                                    {obtermNomeCategoria(categoria)}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQs */}
                    {semResultados ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <Search size={28} strokeWidth={1.6} className="text-slate-300 dark:text-slate-600" />

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('faqs.semResultados')}
                            </p>

                            <button
                                type="button"
                                onClick={() => setPesquisa('')}
                                className="text-sm font-semibold text-teal-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 dark:text-teal-400"
                            >
                                {t('faqs.limparPesquisa')}
                            </button>
                        </div>
                    ) : (
                        categoriasFiltradas.map((categoria) => (
                            <div
                                key={categoria.chave}
                                id={`faq-cat-${categoria.slug}`}
                                className="mb-9 scroll-mt-24 last:mb-0"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <categoria.Icone size={18} strokeWidth={1.9} className="text-teal-500" />

                                    <h4 className="text-lg font-bold text-teal-600 dark:text-teal-400">
                                        {obtermNomeCategoria(categoria)}
                                    </h4>
                                </div>

                                {categoria.itens.map((faq) => {
                                    const aberto = abertas.has(faq.id);
                                    const perguntaId = `faq-pergunta-${faq.id}`;
                                    const respostaId = `faq-resposta-${faq.id}`;

                                    return (
                                        <div
                                            key={faq.id}
                                            className="mb-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white last:mb-0 dark:border-slate-800 dark:bg-slate-800/60"
                                        >
                                            {/* Pergunta */}
                                            <button
                                                id={perguntaId}
                                                type="button"
                                                onClick={() => alternarFaq(faq.id)}
                                                aria-expanded={aberto}
                                                aria-controls={respostaId}
                                                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
                                            >
                                                <span>{destacarTermo(faq.pergunta, pesquisa.trim())}</span>

                                                <span className="shrink-0 text-xl font-light leading-none text-teal-500 transition-colors duration-200">
                                                    {aberto ? '−' : '+'}
                                                </span>
                                            </button>

                                            {/* Resposta */}
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                                    aberto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div
                                                        id={respostaId}
                                                        role="region"
                                                        aria-labelledby={perguntaId}
                                                        className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                                                    >
                                                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                            {destacarTermo(faq.resposta, pesquisa.trim())}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}

                    {/* Painel de Suporte */}
                    <div className="relative mt-12 overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-50/50 p-6 dark:bg-slate-800/20 md:p-8">
                        <div className="pointer-events-none absolute right-4 top-4 hidden grid-cols-5 gap-1.5 opacity-25 md:grid">
                            {[...Array(15)].map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left lg:col-span-5 lg:border-r lg:border-slate-200/80 lg:pr-8 dark:lg:border-slate-700/60">
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                                    <Headphones size={42} strokeWidth={1.8} />
                                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white shadow">
                                        <MessageCircleMore size={18} />
                                    </div>
                                </div>

                                {estaAutenticado ? (
                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                                            {t('faqs.aindaPrecisaDeAjuda')}
                                        </h3>
                                        <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            {t('faqs.equipaDisponivel')}
                                        </p>
                                        <Link
                                            href={route('support.create')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-900"
                                        >
                                            {t('faqs.contactarSuporte')}
                                            <ArrowRight size={14} strokeWidth={2} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                                            {t('faqs.entrarNaContaTitulo')}
                                        </h3>
                                        <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            {t('faqs.entrarNaContaTexto')}
                                        </p>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-900"
                                        >
                                            <LogIn size={14} strokeWidth={2} />
                                            {t('faqs.entrar')}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-7">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <Mail size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        {t('faqs.respostaRapida')}
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        {t('faqs.respostaRapidaTexto')}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <MessageCircleMore size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        {t('faqs.apoioPersonalizado')}
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        {t('faqs.apoioPersonalizadoTexto')}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        {t('faqs.seguroConfiavel')}
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        {t('faqs.seguroConfiavelTexto')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        );

        return (
            <>
                <Head title={t('faqs.tituloPagina')} />

                {estaAutenticado ? (
                    <DashboardLayout>{conteudo}</DashboardLayout>
                ) : (
                    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#06172A] dark:text-white">
                        <AuthHeader theme={theme} toggleTheme={toggleTheme} />

                        <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
                            {conteudo}
                        </main>

                        <AuthFooter />
                    </div>
                )}
            </>
        );
    }
