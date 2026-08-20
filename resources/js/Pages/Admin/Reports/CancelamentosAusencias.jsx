import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { CircleX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ESTADO_RESERVA, etiqueta } from '@/utils/estados';

export default function CancelamentosAusencias({ reservas, estados, setores, filters, geradoEm }) {
    const { t, i18n } = useTranslation('relatorios');
    const { t: tc } = useTranslation('common');
    const { data, setData, get } = useForm({
        data_inicio: filters.data_inicio ?? '',
        data_fim: filters.data_fim ?? '',
        estado_reserva_id: filters.estado_reserva_id ?? '',
        utilizador: filters.utilizador ?? '',
        setor_id: filters.setor_id ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.cancelamentos'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'data',
            label: t('filtros.data'),
            render: (reserva) =>
                new Date(reserva.data).toLocaleDateString(
                    i18n.language === 'en' ? 'en-GB' : 'pt-PT',
                ),
        },
        {
            key: 'user',
            label: t('cancelamentos.colunas.utilizador'),
            render: (reserva) => reserva.user?.name ?? '-',
        },
        {
            key: 'secretaria',
            label: t('cancelamentos.colunas.secretaria'),
            render: (reserva) => reserva.secretaria?.codigo ?? '-',
        },
        {
            key: 'localizacao',
            label: t('cancelamentos.colunas.localizacao'),
            render: (reserva) => {
                const setor = reserva.secretaria?.setor;
                return [setor?.piso?.edificio?.nome, setor?.piso?.nome, setor?.nome]
                    .filter(Boolean)
                    .join(' / ') || '-';
            },
        },
        {
            key: 'estado',
            label: t('cancelamentos.colunas.estado'),
            render: (reserva) =>
                reserva.estado_reserva?.codigo
                    ? etiqueta(
                          ESTADO_RESERVA,
                          reserva.estado_reserva.codigo,
                          reserva.estado_reserva.nome,
                          tc,
                      )
                    : '-',
        },
        {
            key: 'observacoes',
            label: t('cancelamentos.colunas.observacoes'),
            render: (reserva) => reserva.observacoes || '-',
        },
    ];

    return (
        <DashboardLayout>
            <Head title={t('cancelamentos.titulo')} />

            <PrintHeader
                title={t('cancelamentos.titulo')}
                subtitle={t('cancelamentos.subtituloImpressao', {
                    count: reservas.total,
                })}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CircleX size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('cancelamentos.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('cancelamentos.encontrados', {
                                    count: reservas.total,
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
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_1fr_160px_auto]"
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
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('cancelamentos.colunas.estado')}</label>
                        <select
                            value={data.estado_reserva_id}
                            onChange={(event) => setData('estado_reserva_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">{t('filtros.todos')}</option>
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {etiqueta(ESTADO_RESERVA, estado.codigo, estado.nome, tc)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">{t('cancelamentos.colunas.utilizador')}</label>
                        <input
                            type="text"
                            placeholder={t('cancelamentos.nomeUtilizadorPlaceholder')}
                            value={data.utilizador}
                            onChange={(event) => setData('utilizador', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
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
                        data={reservas.data}
                        emptyMessage={t('cancelamentos.semResultados')}
                    />

                    <Pagination pagination={reservas} itemLabel={t('cancelamentos.itemLabel')} />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
