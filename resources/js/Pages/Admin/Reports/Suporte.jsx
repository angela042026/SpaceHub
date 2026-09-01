import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ESTADO_SUPORTE, etiqueta } from '@/utils/estados';

const ESTADOS = Object.keys(ESTADO_SUPORTE);

export default function Suporte({ pedidos, filters, geradoEm }) {
    const { t, i18n } = useTranslation('relatorios');
    const { t: tc } = useTranslation('common');
    const { data, setData, get } = useForm({
        estado: filters.estado ?? '',
    });

    const traduzirEstado = (estado) =>
        etiqueta(ESTADO_SUPORTE, estado, estado, tc);

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.suporte'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'user',
            label: t('suporte.colunas.utilizador'),
            render: (pedido) => pedido.user?.name ?? '-',
        },
        {
            key: 'assunto',
            label: t('suporte.colunas.assunto'),
        },
        {
            key: 'estado',
            label: t('suporte.colunas.estado'),
            render: (pedido) => traduzirEstado(pedido.estado),
        },
        {
            key: 'created_at',
            label: t('suporte.colunas.criadoEm'),
            render: (pedido) =>
                new Date(pedido.created_at).toLocaleDateString(
                    i18n.language === 'en' ? 'en-GB' : 'pt-PT',
                ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('suporte.titulo')} />

            <PrintHeader
                title={t('suporte.titulo')}
                subtitle={t('suporte.subtituloImpressao', {
                    count: pedidos.total,
                })}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card print-report-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 print:hidden dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <LifeBuoy size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('suporte.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('suporte.encontrados', {
                                    count: pedidos.total,
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="-mb-5">
                        <PrintButton />
                    </div>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-[200px_auto]"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('suporte.colunas.estado')}</label>
                        <select
                            value={data.estado}
                            onChange={(event) => setData('estado', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">{t('suporte.todosEstados')}</option>
                            {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>{traduzirEstado(estado)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950 sm:w-auto"
                        >
                            {t('filtros.filtrar')}
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={pedidos.data}
                        emptyMessage={t('suporte.semResultados')}
                    />

                    <Pagination pagination={pedidos} itemLabel={t('suporte.itemLabel')} />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
