import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmada: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    cancelada: 'bg-red-500/10 text-red-600 dark:text-red-400',
    expirada: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    concluida: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

export default function History({ reservas }) {

    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const columns = [
        {
            key: 'data',
            label: 'Data',
            render: (reserva) => new Date(reserva.data).toLocaleDateString('pt-PT'),
        },
        {
            key: 'periodo',
            label: 'Período',
            render: (reserva) => reserva.periodo?.nome ?? '-',
        },
        {
            key: 'espaco',
            label: 'Espaço',
            render: (reserva) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {reserva.secretaria?.setor?.nome ?? '-'}
                    </p>

                    <p className="text-xs text-slate-400">
                        {reserva.secretaria?.codigo ?? '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (reserva) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        ESTADO_CLASSES[reserva.estado_reserva?.codigo] ??
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {reserva.estado_reserva?.nome ?? '-'}
                </span>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Histórico de Reservas" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <HistoryIcon size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Histórico de Reservas
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Reservas passadas, {reservas.total} no total.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('reservas.index')}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                    >
                        Ver reservas atuais
                    </Link>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={reservas.data}
                        emptyMessage="Ainda não existem reservas no histórico."
                    />

                    {reservas.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {reservas.current_page} de {reservas.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!reservas.prev_page_url}
                                    onClick={() => irParaPagina(reservas.prev_page_url)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!reservas.next_page_url}
                                    onClick={() => irParaPagina(reservas.next_page_url)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronRight size={16} strokeWidth={1.9} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
