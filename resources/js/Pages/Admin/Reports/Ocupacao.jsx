import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Ocupacao({ linhas, pisos, filters, geradoEm }) {
    const { t, i18n } = useTranslation('relatorios');
    const { data, setData, get } = useForm({
        data_inicio: filters.data_inicio ?? '',
        data_fim: filters.data_fim ?? '',
        piso_id: filters.piso_id ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.ocupacao'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'data',
            label: t('filtros.data'),
            render: (linha) =>
                new Date(`${linha.data}T00:00:00`).toLocaleDateString(
                    i18n.language === 'en' ? 'en-GB' : 'pt-PT',
                ),
        },
        {
            key: 'secretariasOcupadas',
            label: t('ocupacao.colunas.secretariasOcupadas'),
            align: 'right',
        },
        {
            key: 'totalSecretarias',
            label: t('ocupacao.colunas.totalSecretarias'),
            align: 'right',
        },
        {
            key: 'taxaOcupacao',
            label: t('ocupacao.colunas.taxaOcupacao'),
            align: 'right',
            render: (linha) =>
                `${`${linha.taxaOcupacao}`.replace('.', i18n.language === 'en' ? '.' : ',')}%`,
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('ocupacao.titulo')} />

            <PrintHeader
                title={t('ocupacao.titulo')}
                subtitle={t('ocupacao.subtituloImpressao', {
                    count: linhas.total,
                })}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card print-report-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <TrendingUp size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('ocupacao.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('ocupacao.encontrados', {
                                    count: linhas.total,
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
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-[1fr_1fr_200px_auto]"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('filtros.de')}</label>
                        <input
                            type="date"
                            value={data.data_inicio}
                            onChange={(event) => setData('data_inicio', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('filtros.ate')}</label>
                        <input
                            type="date"
                            value={data.data_fim}
                            onChange={(event) => setData('data_fim', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('filtros.piso')}</label>
                        <select
                            value={data.piso_id}
                            onChange={(event) => setData('piso_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">{t('filtros.todos')}</option>
                            {pisos.map((piso) => (
                                <option key={piso.id} value={piso.id}>{piso.nome}</option>
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
                        data={linhas.data}
                        keyField="data"
                        emptyMessage={t('ocupacao.semResultados')}
                    />

                    <Pagination pagination={linhas} itemLabel={t('ocupacao.itemLabel')} />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
