import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Eye,
} from 'lucide-react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    pago: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    recusado: 'bg-red-500/10 text-red-600 dark:text-red-400',
    reembolsado: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    cancelado: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

const ESTADO_LABELS = {
    pendente: 'Pendente',
    pago: 'Pago',
    recusado: 'Recusado',
    reembolsado: 'Reembolsado',
    cancelado: 'Cancelado',
};

const METODO_LABELS = {
    cartao: 'Cartão',
    mbway: 'MB Way',
    transferencia: 'Transferência',
};

export default function Index({
    pagamentos,
    filters,
    isAdmin = false,
}) {
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

    const aplicarFiltro = (campo, valor) => {
        router.get(
            route('pagamentos.index'),
            {
                ...filters,
                [campo]: valor || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const formatarValor = (valor) =>
        new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(valor ?? 0));

    const formatarData = (data) => {
        if (!data) {
            return '-';
        }

        const dataSemHora = String(data).substring(0, 10);
        const partes = dataSemHora.split('-');

        if (partes.length !== 3) {
            return '-';
        }

        const [ano, mes, dia] = partes;

        if (!ano || !mes || !dia) {
            return '-';
        }

        return `${dia}/${mes}/${ano}`;
    };

    const columns = [
        {
            key: 'referencia',
            label: 'Referência',
            render: (pagamento) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {pagamento.referencia}
                    </p>

                    <p className="text-xs text-slate-400">
                        Reserva #{pagamento.reserva_id}
                    </p>
                </div>
            ),
        },

        ...(isAdmin
            ? [
                  {
                      key: 'utilizador',
                      label: 'Utilizador',
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
            label: 'Data da reserva',
            render: (pagamento) =>
                formatarData(pagamento.reserva?.data),
        },
        {
            key: 'espaco',
            label: 'Espaço',
            render: (pagamento) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {pagamento.reserva?.secretaria?.setor?.nome ?? '-'}
                    </p>

                    <p className="text-xs text-slate-400">
                        {pagamento.reserva?.secretaria?.codigo ?? '-'}
                        {' · '}
                        {pagamento.reserva?.periodo?.nome ?? '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'valor',
            label: 'Valor',
            render: (pagamento) => (
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatarValor(pagamento.valor)}
                </span>
            ),
        },
        {
            key: 'metodo_pagamento',
            label: 'Método',
            render: (pagamento) =>
                METODO_LABELS[pagamento.metodo_pagamento] ?? 'Por definir',
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (pagamento) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        ESTADO_CLASSES[pagamento.estado] ??
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {ESTADO_LABELS[pagamento.estado] ?? pagamento.estado}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: '',
            render: (pagamento) => (
                <Link
                    href={route('pagamentos.show', pagamento.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    title="Ver detalhe"
                >
                    <Eye size={16} strokeWidth={1.9} />
                </Link>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title={isAdmin ? 'Pagamentos' : 'Os meus pagamentos'} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CreditCard size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {isAdmin ? 'Pagamentos' : 'Os meus pagamentos'}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {pagamentos.total} pagamento
                                {pagamentos.total === 1 ? '' : 's'} no total.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={filters?.estado ?? ''}
                            onChange={(event) =>
                                aplicarFiltro('estado', event.target.value)
                            }
                            className="rounded-xl border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <option value="">Todos os estados</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="recusado">Recusado</option>
                            <option value="reembolsado">Reembolsado</option>
                            <option value="cancelado">Cancelado</option>
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
                            <option value="">Todos os métodos</option>
                            <option value="cartao">Cartão</option>
                            <option value="mbway">MB Way</option>
                            <option value="transferencia">
                                Transferência
                            </option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={pagamentos.data}
                        emptyMessage={
                            isAdmin
                                ? 'Ainda não existem pagamentos registados.'
                                : 'Ainda não existem pagamentos associados às tuas reservas.'
                        }
                    />

                    {pagamentos.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {pagamentos.current_page} de{' '}
                                {pagamentos.last_page}
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
                                    aria-label="Página anterior"
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
                                    aria-label="Página seguinte"
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