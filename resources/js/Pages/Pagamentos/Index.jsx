import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Eye,
    Search,
    X,
} from 'lucide-react';
import { ESTADO_PAGAMENTO, METODO_PAGAMENTO, badge, etiqueta, etiquetaPeriodo } from '@/utils/estados';
import { encurtarReferencia, formatarDataCurta, formatarValorEuro } from '@/utils/formatacaoPagamento';

export default function Index({
    pagamentos,
    totalGeral,
    filters,
    isAdmin = false,
}) {
    const { t, i18n } = useTranslation('pagamentos');
    const { t: tc } = useTranslation('common');

    const [busca, setBusca] = useState(filters?.busca ?? '');

    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const aplicarFiltro = (campo, valor, filtrosBase = filters) => {
        router.get(
            route('pagamentos.index'),
            {
                ...filtrosBase,
                [campo]: valor || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    /*
     * A pesquisa é feita no servidor (referência, nº da reserva, nome/código
     * do espaço), tal como os filtros — por isso tem debounce, para não
     * disparar um pedido a cada tecla premida.
     */
    useEffect(() => {
        if (busca === (filters?.busca ?? '')) {
            return;
        }

        const temporizador = setTimeout(() => {
            aplicarFiltro('busca', busca);
        }, 350);

        return () => clearTimeout(temporizador);
    }, [busca]);

    const filtrosAtivos = Boolean(
        filters?.estado || filters?.metodo_pagamento || filters?.busca,
    );

    const limparFiltros = () => {
        setBusca('');

        router.get(
            route('pagamentos.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const columns = [
        {
            key: 'referencia',
            label: t('index.referencia'),
            render: (pagamento) => (
                <div>
                    <p
                        title={pagamento.referencia}
                        className="font-semibold text-slate-800 dark:text-slate-100"
                    >
                        <span aria-hidden="true">
                            {encurtarReferencia(pagamento.referencia)}
                        </span>
                        <span className="sr-only">
                            {pagamento.referencia}
                        </span>
                    </p>

                    <p className="text-xs text-slate-400">
                        {t('index.reservaNumero', { id: pagamento.reserva_id })}
                    </p>
                </div>
            ),
        },

        ...(isAdmin
            ? [
                  {
                      key: 'utilizador',
                      label: t('index.utilizador'),
                      render: (pagamento) => (
                          <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {pagamento.reserva?.user?.name ?? '-'}
                              </p>

                              <p className="text-xs text-slate-400">
                                  {pagamento.reserva?.user?.email ?? '-'}
                              </p>
                          </div>
                      ),
                  },
              ]
            : []),

        {
            key: 'data',
            label: t('index.data'),
            render: (pagamento) => {
                const temDataPagamento = Boolean(pagamento.data_pagamento);
                const cancelado = pagamento.estado === 'cancelado';

                return (
                    <div>
                        <p
                            className={
                                cancelado
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : 'text-slate-700 dark:text-slate-200'
                            }
                        >
                            {temDataPagamento
                                ? formatarDataCurta(pagamento.data_pagamento)
                                : formatarDataCurta(pagamento.reserva?.data)}
                        </p>

                        <p className="text-xs text-slate-400">
                            {temDataPagamento
                                ? t('index.dataDoPagamento')
                                : t('index.dataDaReserva')}
                        </p>
                    </div>
                );
            },
        },
        {
            key: 'espaco',
            label: t('index.espaco'),
            render: (pagamento) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {pagamento.reserva?.secretaria?.setor?.nome ?? '-'}
                    </p>

                    <p className="text-xs text-slate-400">
                        {pagamento.reserva?.secretaria?.codigo ?? '-'}
                        {' · '}
                        {etiquetaPeriodo(pagamento.reserva?.periodo?.nome, tc) || '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'valor',
            label: t('index.valor'),
            render: (pagamento) => (
                <span
                    className={`font-semibold ${
                        pagamento.estado === 'cancelado'
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                    }`}
                >
                    {formatarValorEuro(pagamento.valor, i18n.language)}
                </span>
            ),
        },
        {
            key: 'metodo_pagamento',
            label: t('index.metodo'),
            render: (pagamento) => (
                <span
                    className={`inline-flex items-center gap-2 ${
                        pagamento.estado === 'cancelado'
                            ? 'text-slate-400 dark:text-slate-500'
                            : ''
                    }`}
                >
                    {METODO_PAGAMENTO[pagamento.metodo_pagamento]?.imagem && (
                        <img
                            src={METODO_PAGAMENTO[pagamento.metodo_pagamento].imagem}
                            alt=""
                            className={`h-6 w-6 shrink-0 rounded-md object-cover ${
                                pagamento.estado === 'cancelado' ? 'opacity-50 grayscale' : ''
                            }`}
                        />
                    )}

                    {etiqueta(
                        METODO_PAGAMENTO,
                        pagamento.metodo_pagamento,
                        t('index.porDefinir'),
                        tc,
                    )}
                </span>
            ),
        },
        {
            key: 'estado',
            label: t('index.estado'),
            render: (pagamento) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        badge(ESTADO_PAGAMENTO, pagamento.estado)
                    }`}
                >
                    {etiqueta(ESTADO_PAGAMENTO, pagamento.estado, pagamento.estado, tc)}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: '',
            render: (pagamento) => (
                <Link
                    href={route('pagamentos.show', pagamento.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 outline-none transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:border-slate-700 dark:hover:bg-teal-400/10 dark:hover:text-teal-400"
                    title={t('index.verDetalhes')}
                    aria-label={t('index.verDetalhes')}
                >
                    <Eye size={16} strokeWidth={1.9} />
                </Link>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title={isAdmin ? t('index.tituloAdmin') : t('index.tituloUtilizador')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CreditCard size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {isAdmin
                                    ? t('index.tituloAdmin')
                                    : t('index.tituloUtilizador')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {filtrosAtivos
                                    ? t('index.contagem', { atual: pagamentos.total, total: totalGeral })
                                    : t('index.contagemTotal', { count: pagamentos.total })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search
                                size={15}
                                strokeWidth={2}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                placeholder={t('index.pesquisarPlaceholder')}
                                className="w-56 rounded-xl border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />

                            {busca && (
                                <button
                                    type="button"
                                    onClick={() => setBusca('')}
                                    aria-label={t('index.limparPesquisa')}
                                    title={t('index.limparPesquisa')}
                                    className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                >
                                    <X size={13} strokeWidth={2.2} />
                                </button>
                            )}
                        </div>

                        <select
                            value={filters?.estado ?? ''}
                            onChange={(event) =>
                                aplicarFiltro(
                                    'estado',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="">{t('index.todosOsEstados')}</option>
                            <option value="pendente">{tc('estados.pagamento.pendente')}</option>
                            <option value="pago">{tc('estados.pagamento.pago')}</option>
                            <option value="recusado">{tc('estados.pagamento.recusado')}</option>
                            <option value="reembolsado">
                                {tc('estados.pagamento.reembolsado')}
                            </option>
                            <option value="cancelado">{tc('estados.pagamento.cancelado')}</option>
                        </select>

                        <select
                            value={filters?.metodo_pagamento ?? ''}
                            onChange={(event) =>
                                aplicarFiltro(
                                    'metodo_pagamento',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="">{t('index.todosOsMetodos')}</option>
                            <option value="cartao">{tc('estados.metodoPagamento.cartao')}</option>
                            <option value="mbway">{tc('estados.metodoPagamento.mbway')}</option>
                            <option value="transferencia">
                                {tc('estados.metodoPagamento.transferencia')}
                            </option>
                            <option value="paypal">{tc('estados.metodoPagamento.paypal')}</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={pagamentos.data}
                        emptyMessage={
                            filtrosAtivos ? (
                                <>
                                    {t('index.nenhumPagamentoEncontrado')}
                                    <br />
                                    <button
                                        type="button"
                                        onClick={limparFiltros}
                                        className="mt-2 font-semibold text-teal-600 underline-offset-2 hover:underline dark:text-teal-400"
                                    >
                                        {t('index.limparFiltros')}
                                    </button>
                                </>
                            ) : isAdmin ? (
                                t('index.semPagamentosAdmin')
                            ) : (
                                t('index.semPagamentosUtilizador')
                            )
                        }
                    />

                    {pagamentos.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                {t('index.paginaXDeY', { atual: pagamentos.current_page, total: pagamentos.last_page })}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!pagamentos.prev_page_url}
                                    onClick={() =>
                                        irParaPagina(
                                            pagamentos.prev_page_url,
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                    aria-label={t('index.paginaAnterior')}
                                >
                                    <ChevronLeft
                                        size={16}
                                        strokeWidth={1.9}
                                    />
                                </button>

                                <button
                                    type="button"
                                    disabled={!pagamentos.next_page_url}
                                    onClick={() =>
                                        irParaPagina(
                                            pagamentos.next_page_url,
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                    aria-label={t('index.paginaSeguinte')}
                                >
                                    <ChevronRight
                                        size={16}
                                        strokeWidth={1.9}
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}