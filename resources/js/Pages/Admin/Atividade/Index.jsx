import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Eye,
    History,
    RotateCcw,
    Search,
    SearchX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import {
    ACAO_ATIVIDADE,
    acaoLabel,
    entidadeLabel,
    resultadoLabel,
    RESULTADO_ATIVIDADE,
} from '@/utils/atividade';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

function formatarDataHora(iso, locale = 'pt') {
    const data = new Date(iso);
    const localeIntl = locale === 'en' ? 'en-GB' : 'pt-PT';

    return `${data.toLocaleDateString(localeIntl)} · ${data.toLocaleTimeString(localeIntl, {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}

function BadgeAcao({ acao, t }) {
    const info = ACAO_ATIVIDADE[acao] ?? null;
    const Icon = info?.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                info?.badge ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
        >
            {Icon ? <Icon size={13} strokeWidth={2} /> : null}
            {acaoLabel(acao, t)}
        </span>
    );
}

function BadgeResultado({ resultado, t }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                RESULTADO_ATIVIDADE[resultado]?.badge ?? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
        >
            {resultadoLabel(resultado, t)}
        </span>
    );
}

function DetalheModal({ registo, onClose, t, locale }) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const metadados = registo.metadata && Object.keys(registo.metadata).length > 0
        ? Object.entries(registo.metadata)
        : null;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#03172B]/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="detalhe-atividade-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg animate-modal-in rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(3,23,43,0.25)] motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2
                        id="detalhe-atividade-title"
                        className="text-lg font-bold text-slate-900 dark:text-white"
                    >
                        {t('atividade.detalhesDaAtividade')}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('atividade.fechar')}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                        <X size={16} strokeWidth={1.9} />
                    </button>
                </div>

                <dl className="mt-5 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.dataEHora')}</dt>
                            <dd className="mt-1 font-medium text-slate-700 dark:text-slate-200">{formatarDataHora(registo.created_at, locale)}</dd>
                        </div>

                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.resultado')}</dt>
                            <dd className="mt-1"><BadgeResultado resultado={registo.result} t={t} /></dd>
                        </div>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.utilizadorResponsavel')}</dt>
                        <dd className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                            {registo.actor_name ?? t('atividade.sistema')}
                            {registo.actor_email ? (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">{registo.actor_email}</span>
                            ) : null}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.acao')}</dt>
                        <dd className="mt-1"><BadgeAcao acao={registo.action} t={t} /></dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.entidadeAfetada')}</dt>
                        <dd className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                            {registo.subject_type
                                ? `${entidadeLabel(registo.subject_type, t)} #${registo.subject_id}`
                                : '—'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.descricao')}</dt>
                        <dd className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">{registo.description}</dd>
                    </div>

                    <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('atividade.metadados')}</dt>
                        <dd className="mt-1">
                            {metadados ? (
                                <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                                    {metadados.map(([chave, valor]) => (
                                        <li key={chave} className="flex justify-between gap-3">
                                            <span className="font-semibold capitalize">{chave.replace(/_/g, ' ')}</span>
                                            <span className="text-right">{String(valor)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400">{t('atividade.semMetadados')}</p>
                            )}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export default function Index({ registos, acoes, utilizadores, periodos, filters, existemRegistos }) {
    const { t, i18n } = useTranslation('admin');
    const { t: tc } = useTranslation('common');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(false);
    const [registoSelecionado, setRegistoSelecionado] = useState(null);

    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        acao: filters.acao ?? '',
        utilizador: filters.utilizador ?? '',
        periodo: filters.periodo ?? '7dias',
    });

    const opcoesDeVisita = {
        preserveState: true,
        preserveScroll: true,
        onStart: () => {
            setErro(false);
            setCarregando(true);
        },
        onFinish: () => setCarregando(false),
        onError: () => setErro(true),
    };

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.atividade.index'), opcoesDeVisita);
    };

    const limpar = () => {
        router.get(route('admin.atividade.index'), {}, opcoesDeVisita);
    };

    const tentarNovamente = () => {
        router.reload(opcoesDeVisita);
    };

    const total = registos.total ?? 0;

    const columns = [
        {
            key: 'data',
            label: t('atividade.dataEHora'),
            render: (registo) => (
                <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {formatarDataHora(registo.created_at, i18n.language)}
                </span>
            ),
        },
        {
            key: 'utilizador',
            label: t('reservas.index.utilizador'),
            render: (registo) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {registo.actor_name ?? t('atividade.sistema')}
                    </p>
                    {registo.actor_email ? (
                        <p className="text-xs text-slate-400">{registo.actor_email}</p>
                    ) : null}
                </div>
            ),
        },
        {
            key: 'acao',
            label: t('atividade.acao'),
            render: (registo) => <BadgeAcao acao={registo.action} t={t} />,
        },
        {
            key: 'detalhes',
            label: t('atividade.detalhes'),
            render: (registo) => (
                <span className="line-clamp-1 text-slate-600 dark:text-slate-300" title={registo.description}>
                    {registo.description}
                </span>
            ),
        },
        {
            key: 'resultado',
            label: t('atividade.resultado'),
            render: (registo) => <BadgeResultado resultado={registo.result} t={t} />,
        },
        {
            key: 'ver',
            label: '',
            align: 'right',
            render: (registo) => (
                <button
                    type="button"
                    onClick={() => setRegistoSelecionado(registo)}
                    title={t('atividade.verDetalhes')}
                    aria-label={t('atividade.verDetalhes')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-1 dark:border-slate-700 dark:hover:bg-teal-500/10"
                >
                    <Eye size={16} strokeWidth={1.9} />
                </button>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('atividade.titulo')} />

            <section className="dashboard-card overflow-hidden pb-10 sm:pr-2 lg:pr-6">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <History size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('atividade.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('atividade.subtitulo')}
                        </p>

                        <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {t('atividade.registosEncontrados', { count: total })}
                        </span>
                    </div>
                </div>

                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <form onSubmit={pesquisar} className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:min-w-[320px] sm:flex-1 lg:max-w-lg">
                            <Search
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={data.search}
                                onChange={(event) => setData('search', event.target.value)}
                                placeholder={t('atividade.pesquisarPlaceholder')}
                                aria-label={t('atividade.pesquisarPlaceholder')}
                                className={`${fieldClass} pl-9`}
                            />
                        </div>

                        <select
                            value={data.acao}
                            onChange={(event) => setData('acao', event.target.value)}
                            aria-label={t('atividade.filtrarPorAcao')}
                            className={`w-full sm:w-48 ${fieldClass}`}
                        >
                            <option value="">{t('atividade.todasAsAcoes')}</option>

                            {acoes.map((acao) => (
                                <option key={acao.codigo} value={acao.codigo}>
                                    {acao.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={data.utilizador}
                            onChange={(event) => setData('utilizador', event.target.value)}
                            aria-label={t('atividade.filtrarPorUtilizador')}
                            className={`w-full sm:w-48 ${fieldClass}`}
                        >
                            <option value="">{t('atividade.todosOsUtilizadores')}</option>

                            {utilizadores.map((utilizador) => (
                                <option key={utilizador.id} value={utilizador.id}>
                                    {utilizador.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={data.periodo}
                            onChange={(event) => setData('periodo', event.target.value)}
                            aria-label={t('atividade.filtrarPorPeriodo')}
                            className={`w-full sm:w-48 ${fieldClass}`}
                        >
                            {periodos.map((periodo) => (
                                <option key={periodo.codigo} value={periodo.codigo}>
                                    {periodo.label}
                                </option>
                            ))}
                        </select>

                        <div className="flex w-full gap-2 sm:w-auto sm:ml-auto">
                            <button
                                type="submit"
                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-bold text-white transition hover:bg-navy-950 sm:flex-none"
                            >
                                {tc('acoes.pesquisar')}
                            </button>

                            <button
                                type="button"
                                onClick={limpar}
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:bg-transparent sm:flex-none"
                            >
                                {t('listagem.limpar')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="relative p-6 pb-10">
                    <LoadingOverlay show={carregando} label={t('atividade.aCarregar')} />

                    {erro ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
                            <AlertTriangle size={22} strokeWidth={1.9} className="text-red-500" />

                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                {t('atividade.erroCarregar')}
                            </p>

                            <button
                                type="button"
                                onClick={tentarNovamente}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-transparent"
                            >
                                <RotateCcw size={14} strokeWidth={2} />
                                {t('atividade.tentarNovamente')}
                            </button>
                        </div>
                    ) : registos.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                {existemRegistos ? (
                                    <SearchX size={22} strokeWidth={1.8} />
                                ) : (
                                    <History size={22} strokeWidth={1.8} />
                                )}
                            </div>

                            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                {existemRegistos
                                    ? t('atividade.nenhumaCorrespondeFiltros')
                                    : t('atividade.aindaNaoExistem')}
                            </p>

                            {existemRegistos && (
                                <>
                                    <p className="text-xs text-slate-400">
                                        {t('atividade.tentaAlterarFiltros')}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={limpar}
                                        className="mt-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                                    >
                                        {tc('acoes.limparFiltros')}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <Table
                                    columns={columns}
                                    data={registos.data}
                                    loading={carregando}
                                />
                            </div>

                            <div className="space-y-3 md:hidden">
                                {registos.data.map((registo) => (
                                    <div
                                        key={registo.id}
                                        className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <BadgeAcao acao={registo.action} t={t} />
                                            <BadgeResultado resultado={registo.result} t={t} />
                                        </div>

                                        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {registo.actor_name ?? t('atividade.sistema')}
                                        </p>

                                        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                            {registo.description}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                {formatarDataHora(registo.created_at, i18n.language)}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => setRegistoSelecionado(registo)}
                                                title={t('atividade.verDetalhes')}
                                                aria-label={t('atividade.verDetalhes')}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700"
                                            >
                                                <Eye size={14} strokeWidth={1.9} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!erro && registos.data.length > 0 && (
                        <Pagination
                            pagination={registos}
                            disabled={carregando}
                            onStart={() => setCarregando(true)}
                            onFinish={() => setCarregando(false)}
                            itemLabel={t('atividade.itemLabel')}
                        />
                    )}
                </div>
            </section>

            {registoSelecionado && (
                <DetalheModal
                    registo={registoSelecionado}
                    onClose={() => setRegistoSelecionado(null)}
                    t={t}
                    locale={i18n.language}
                />
            )}
        </DashboardLayout>
    );
}
