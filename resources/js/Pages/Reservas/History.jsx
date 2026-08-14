import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Modal from '@/Components/Modal';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    History as HistoryIcon,
    X,
} from 'lucide-react';
import { ESTADO_RESERVA, badge } from '@/utils/estados';

export default function History({ reservas }) {
    const [reservaSelecionada, setReservaSelecionada] = useState(null);

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

                    <LocalizacaoEspaco secretaria={reserva.secretaria} className="mt-1" />
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (reserva) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge(
                        ESTADO_RESERVA,
                        reserva.estado_reserva?.codigo,
                    )}`}
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
                                Consulte as suas {reservas.total} reserva{reservas.total === 1 ? '' : 's'} anterior{reservas.total === 1 ? '' : 'es'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('reservas.index')}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-teal-200 bg-teal-50/60 px-3 py-2 text-xs font-bold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-teal-400/20 dark:bg-teal-400/5 dark:text-teal-400 dark:hover:bg-teal-400/10 sm:self-auto"
                    >
                        Ver reservas atuais
                        <ArrowRight size={14} strokeWidth={2.2} />
                    </Link>
                </div>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={reservas.data}
                        emptyMessage="Ainda não existem reservas no histórico."
                        onRowClick={(reserva) => setReservaSelecionada(reserva)}
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

            <Modal show={reservaSelecionada !== null} onClose={() => setReservaSelecionada(null)} maxWidth="sm">
                {reservaSelecionada && (
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    {reservaSelecionada.secretaria?.codigo ?? '-'}
                                </p>

                                <h2 className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-white">
                                    {reservaSelecionada.secretaria?.setor?.nome ?? '-'}
                                </h2>

                                <LocalizacaoEspaco secretaria={reservaSelecionada.secretaria} className="mt-1" />
                            </div>

                            <button
                                type="button"
                                onClick={() => setReservaSelecionada(null)}
                                aria-label="Fechar"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800"
                            >
                                <X size={16} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                <CalendarDays size={16} strokeWidth={1.9} className="shrink-0 text-slate-400" />
                                {new Date(reservaSelecionada.data).toLocaleDateString('pt-PT', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>

                            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                <Clock size={16} strokeWidth={1.9} className="shrink-0 text-slate-400" />
                                {reservaSelecionada.periodo?.nome ?? '-'}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Estado</span>

                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge(
                                        ESTADO_RESERVA,
                                        reservaSelecionada.estado_reserva?.codigo,
                                    )}`}
                                >
                                    {reservaSelecionada.estado_reserva?.nome ?? '-'}
                                </span>
                            </div>

                            {reservaSelecionada.check_in_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Check-in</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {new Date(reservaSelecionada.check_in_at).toLocaleString('pt-PT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
