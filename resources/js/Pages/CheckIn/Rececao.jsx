import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, Search, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';

const CORES_STATUS = {
    pronta: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    pendente_pagamento: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    fora_da_janela: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    ja_check_in: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
};

export default function Rececao({ reservas, filters }) {
    const { t } = useTranslation('common');
    const [pesquisa, setPesquisa] = useState(filters?.pesquisa ?? '');
    const [processingId, setProcessingId] = useState(null);
    const [reservaAConfirmar, setReservaAConfirmar] = useState(null);

    function pesquisar(event) {
        event.preventDefault();
        router.get(
            route('checkin.recepcao.index'),
            { pesquisa },
            { preserveState: true, replace: true },
        );
    }

    function confirmar() {
        const reserva = reservaAConfirmar;
        if (!reserva) return;

        setProcessingId(reserva.id);
        router.post(
            route('checkin.recepcao.confirmar', reserva.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessingId(null);
                    setReservaAConfirmar(null);
                },
            },
        );
    }

    const badge = (status) => (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${CORES_STATUS[status] ?? CORES_STATUS.fora_da_janela}`}
        >
            {t(`checkinRececao.${status}`)}
        </span>
    );

    const botao = (reserva) => (
        <button
            type="button"
            onClick={() => setReservaAConfirmar(reserva)}
            disabled={
                reserva.status !== 'pronta' || processingId === reserva.id
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800"
        >
            <CheckCircle2 size={15} />
            {t('checkinRececao.confirmar')}
        </button>
    );

    return (
        <>
            <Head title={t('checkinRececao.titulo')} />

            <DashboardLayout>
                <main className="mx-auto max-w-7xl pb-20">
                    <section className="dashboard-card overflow-hidden">
                        <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
                                <UserCheck size={22} />
                            </span>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('checkinRececao.titulo')}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {t('checkinRececao.subtitulo')}
                                </p>
                            </div>
                        </header>

                        <form
                            onSubmit={pesquisar}
                            className="border-b border-slate-100 p-4 dark:border-slate-800 sm:p-6"
                        >
                            <div className="relative max-w-xl">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />
                                <input
                                    value={pesquisa}
                                    onChange={(event) =>
                                        setPesquisa(event.target.value)
                                    }
                                    placeholder={t('checkinRececao.pesquisar')}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                        </form>

                        <div className="p-4 sm:p-6">
                            {reservas.data.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
                                    {t('checkinRececao.semReservas')}
                                </div>
                            ) : (
                                <>
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                                                <tr>
                                                    <th className="px-3 py-3">
                                                        {t(
                                                            'checkinRececao.utilizador',
                                                        )}
                                                    </th>
                                                    <th className="px-3 py-3">
                                                        {t(
                                                            'checkinRececao.espaco',
                                                        )}
                                                    </th>
                                                    <th className="px-3 py-3">
                                                        {t(
                                                            'checkinRececao.horario',
                                                        )}
                                                    </th>
                                                    <th className="px-3 py-3">
                                                        {t(
                                                            'checkinRececao.estado',
                                                        )}
                                                    </th>
                                                    <th className="px-3 py-3 text-right">
                                                        {t(
                                                            'checkinRececao.acao',
                                                        )}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {reservas.data.map(
                                                    (reserva) => (
                                                        <tr key={reserva.id}>
                                                            <td className="px-3 py-4">
                                                                <p className="font-bold text-slate-900 dark:text-white">
                                                                    {
                                                                        reserva.utilizador
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        reserva.email
                                                                    }
                                                                </p>
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                <p className="font-semibold">
                                                                    {
                                                                        reserva.secretaria
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {
                                                                        reserva.setor
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        reserva.piso
                                                                    }
                                                                </p>
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                {
                                                                    reserva.hora_inicio
                                                                }
                                                                –
                                                                {
                                                                    reserva.hora_fim
                                                                }
                                                            </td>
                                                            <td className="px-3 py-4">
                                                                {badge(
                                                                    reserva.status,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-4 text-right">
                                                                {botao(reserva)}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="space-y-3 md:hidden">
                                        {reservas.data.map((reserva) => (
                                            <article
                                                key={reserva.id}
                                                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate font-bold text-slate-900 dark:text-white">
                                                            {reserva.utilizador}
                                                        </h2>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {reserva.email}
                                                        </p>
                                                    </div>
                                                    {badge(reserva.status)}
                                                </div>
                                                <p className="mt-3 text-sm font-semibold">
                                                    {reserva.secretaria} ·{' '}
                                                    {reserva.setor}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Clock3 size={14} />{' '}
                                                    {reserva.hora_inicio}–
                                                    {reserva.hora_fim} ·{' '}
                                                    {reserva.piso}
                                                </p>
                                                <div className="mt-4">
                                                    {botao(reserva)}
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    {reservas.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                                            <button
                                                type="button"
                                                disabled={
                                                    !reservas.prev_page_url
                                                }
                                                onClick={() =>
                                                    router.get(
                                                        reservas.prev_page_url,
                                                        {},
                                                        { preserveState: true },
                                                    )
                                                }
                                                className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40"
                                            >
                                                {t('checkinRececao.anterior')}
                                            </button>
                                            <span className="text-xs text-slate-500">
                                                {t('checkinRececao.pagina', {
                                                    atual: reservas.current_page,
                                                    total: reservas.last_page,
                                                })}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={
                                                    !reservas.next_page_url
                                                }
                                                onClick={() =>
                                                    router.get(
                                                        reservas.next_page_url,
                                                        {},
                                                        { preserveState: true },
                                                    )
                                                }
                                                className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40"
                                            >
                                                {t('checkinRececao.seguinte')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </main>
            </DashboardLayout>

            <Modal
                show={reservaAConfirmar !== null}
                maxWidth="md"
                closeable={processingId === null}
                onClose={() => setReservaAConfirmar(null)}
            >
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <UserCheck size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('checkinRececao.confirmarTitulo')}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t('checkinRececao.confirmacao', {
                                    nome: reservaAConfirmar?.utilizador,
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setReservaAConfirmar(null)}
                            disabled={processingId !== null}
                            className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('checkinRececao.cancelar')}
                        </button>
                        <button
                            type="button"
                            onClick={confirmar}
                            disabled={processingId !== null}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle2 size={16} />
                            {processingId !== null
                                ? t('checkinRececao.aConfirmar')
                                : t('checkinRececao.confirmar')}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
