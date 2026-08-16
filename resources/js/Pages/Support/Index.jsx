import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    Inbox,
    LifeBuoy,
    Search,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ESTADO_SUPORTE, badge, etiqueta } from '@/utils/estados';

function formatarIdentificador(id) {
    return `#SUP-${String(id).padStart(3, '0')}`;
}

export default function Index({ pedidos, filters, stats }) {
    const { t, i18n } = useTranslation('suporte');
    const { t: tc } = useTranslation('common');

    // Rótulos de filtro mapeados para os valores reais guardados na
    // coluna estado ('Pendente', 'Em análise', 'Resolvido' — ver
    // PedidoSuporte/migração).
    const FILTROS_ESTADO = [
        { valor: 'todos', label: t('index.filtros.todos') },
        { valor: 'Pendente', label: t('index.filtros.abertos') },
        { valor: 'Em análise', label: t('index.filtros.emTratamento') },
        { valor: 'Resolvido', label: t('index.filtros.resolvidos') },
    ];

    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [carregando, setCarregando] = useState(false);

    const estadoAtivo = filters.estado ?? 'todos';
    const filtrosAtivos = estadoAtivo !== 'todos' || searchValue !== '';

    // Ponto único de navegação — filtrar, pesquisar, mudar de página e
    // limpar filtros passam todos por aqui, partindo sempre do
    // estado/pesquisa atuais, para nenhuma combinação se perder.
    const visitar = (alteracoes) => {
        router.get(
            route('support.index'),
            { estado: estadoAtivo, search: searchValue, ...alteracoes },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setCarregando(true),
                onFinish: () => setCarregando(false),
            },
        );
    };

    // Trocar de filtro ou pesquisar volta sempre à página 1.
    const filtrar = (estado) => visitar({ estado, page: 1 });

    const pesquisar = (event) => {
        event.preventDefault();
        visitar({ search: searchValue, page: 1 });
    };

    const irParaPagina = (pagina) => visitar({ page: pagina });

    const limparFiltros = () => {
        setSearchValue('');
        visitar({ estado: 'todos', search: '', page: 1 });
    };

    const columns = [
        {
            key: 'id',
            label: t('index.colunaPedido'),
            render: (pedido) => (
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatarIdentificador(pedido.id)}
                </span>
            ),
        },
        {
            key: 'utilizador',
            label: t('index.colunaUtilizador'),
            render: (pedido) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {pedido.user.name}
                    </p>

                    <p className="text-xs text-slate-400">
                        {pedido.user.email}
                    </p>
                </div>
            ),
        },
        {
            key: 'assunto',
            label: t('index.colunaAssunto'),
            render: (pedido) => (
                <p className="max-w-[220px] truncate" title={pedido.assunto}>
                    {pedido.assunto}
                </p>
            ),
        },
        {
            key: 'data',
            label: t('index.colunaData'),
            render: (pedido) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(pedido.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'pt-PT')}
                </span>
            ),
        },
        {
            key: 'estado',
            label: t('index.colunaEstado'),
            render: (pedido) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        badge(ESTADO_SUPORTE, pedido.estado)
                    }`}
                >
                    {etiqueta(ESTADO_SUPORTE, pedido.estado, pedido.estado, tc)}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: t('index.colunaAcoes'),
            align: 'right',
            render: (pedido) => (
                <div className="flex justify-end">
                    <Link
                        href={route('support.show', pedido.id)}
                        title={t('index.verPedido')}
                        aria-label={t('index.verPedido')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 dark:border-slate-700 dark:hover:bg-teal-500/10"
                    >
                        <Eye size={16} strokeWidth={1.9} />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('index.tituloPagina')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <LifeBuoy size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('index.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('index.subtitulo')}
                        </p>
                    </div>
                </div>

                {/*
                    4 indicadores compactos, mesmo padrão da página
                    Avaliações — valores vêm de PedidoSuporteController::
                    index() (contagens por estado), nunca hardcoded.
                */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                <Inbox size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {t('index.totalDePedidos')}
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.total}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                <AlertCircle size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {t('index.abertos')}
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.abertos}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                <Wrench size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {t('index.emTratamento')}
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.emTratamento}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                <CheckCircle2 size={14} strokeWidth={1.9} />
                            </div>

                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {t('index.resolvidos')}
                            </span>
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                            {stats.resolvidos}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {FILTROS_ESTADO.map(({ valor, label }) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => filtrar(valor)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                    estadoAtivo === valor
                                        ? 'bg-navy-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
                                }`}
                            >
                                {label}

                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                        estadoAtivo === valor
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    {stats.porEstado[valor] ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={pesquisar} className="relative w-full sm:max-w-[360px]">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder={t('index.pesquisarPlaceholder')}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </form>
                </div>

                <div className="relative p-6">
                    <LoadingOverlay show={carregando} />

                    <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {t('index.pedidoEncontrado', { count: pedidos.total })}
                    </p>

                    <Table
                        columns={columns}
                        data={pedidos.data}
                        emptyMessage={
                            stats.total === 0 ? (
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                                        {t('index.nenhumPedidoSuporte')}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {t('index.pedidosApareceraoAqui')}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                                        {t('index.nenhumPedidoEncontrado')}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        {t('index.experimenteAlterarFiltros')}
                                    </p>

                                    {filtrosAtivos && (
                                        <button
                                            type="button"
                                            onClick={limparFiltros}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                                        >
                                            {t('index.limparFiltros')}
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    />

                    <Pagination
                        pagination={pedidos}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                        numbered
                        onNavigate={irParaPagina}
                        itemLabel={t('index.itemLabelPedidos')}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
