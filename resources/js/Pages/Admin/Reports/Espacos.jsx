import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { Armchair } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Espacos({ linhas, pisos, setores, filters, geradoEm }) {
    const { t, i18n } = useTranslation('relatorios');
    const { data, setData, get } = useForm({
        data_inicio: filters.data_inicio ?? '',
        data_fim: filters.data_fim ?? '',
        piso_id: filters.piso_id ?? '',
        setor_id: filters.setor_id ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.espacos'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'codigo',
            label: t('espacos.colunas.secretaria'),
        },
        {
            key: 'setor',
            label: t('filtros.setor'),
            render: (linha) => linha.setor ?? '-',
        },
        {
            key: 'piso',
            label: t('filtros.piso'),
            render: (linha) => linha.piso ?? '-',
        },
        {
            key: 'edificio',
            label: t('espacos.colunas.edificio'),
            render: (linha) => linha.edificio ?? '-',
        },
        {
            key: 'diasOcupados',
            label: t('espacos.colunas.diasOcupados'),
            align: 'right',
        },
        {
            key: 'percentual',
            label: t('espacos.colunas.percentualTotal'),
            align: 'right',
            render: (linha) =>
                `${`${linha.percentual}`.replace('.', i18n.language === 'en' ? '.' : ',')}%`,
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('espacos.titulo')} />

            <PrintHeader
                title={t('espacos.titulo')}
                subtitle={t('espacos.subtituloImpressao', {
                    count: linhas.total,
                })}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Armchair size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('espacos.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('espacos.encontrados', {
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
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_200px_auto]"
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

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('filtros.setor')}</label>
                        <select
                            value={data.setor_id}
                            onChange={(event) => setData('setor_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">{t('filtros.todos')}</option>
                            {setores.map((setor) => (
                                <option key={setor.id} value={setor.id}>{setor.nome}</option>
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
                        emptyMessage={t('espacos.semResultados')}
                    />

                    <Pagination pagination={linhas} itemLabel={t('espacos.itemLabel')} />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
