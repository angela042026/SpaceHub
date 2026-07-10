import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';

const STATUS_INFO = {
    pronta: {
        label: 'Pronto para check-in',
        badgeClass: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
        message: 'Confirma a tua presença nesta secretária.',
    },
    ja_check_in: {
        label: 'Check-in já efetuado',
        badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
        message: 'Já confirmaste esta reserva hoje.',
    },
    fora_da_janela: {
        label: 'Fora da janela horária',
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        message: 'O check-in só está disponível perto do início do período reservado.',
    },
    sem_reserva: {
        label: 'Sem reserva',
        badgeClass: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        message: 'Não tens nenhuma reserva ativa para esta secretária hoje.',
    },
    ocupada_por_outro: {
        label: 'Ocupada por outro utilizador',
        badgeClass: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        message: 'Esta secretária já está reservada por outra pessoa hoje.',
    },
    indisponivel: {
        label: 'Secretária indisponível',
        badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
        message: 'Esta secretária não está disponível para reserva.',
    },
};

export default function Scan({ secretaria, reserva, status }) {
    const [processing, setProcessing] = useState(false);
    const { errors, flash } = usePage().props;
    const info = STATUS_INFO[status] ?? STATUS_INFO.sem_reserva;

    function confirmar() {
        setProcessing(true);
        router.post(
            route('checkin.confirm', reserva.id),
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    }

    return (
        <>
            <Head title={`Check-in · ${secretaria.codigo}`} />

            <DashboardLayout>
                <div className="mx-auto max-w-lg py-6">
                    <div className="dashboard-card p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl dark:bg-teal-500/10">
                            🪑
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                            {secretaria.codigo}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {[
                                secretaria.setor?.piso?.edificio?.nome,
                                secretaria.setor?.piso?.nome,
                                secretaria.setor?.nome,
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>

                        <span className={`badge-status mt-4 inline-flex ${info.badgeClass}`}>
                            {info.label}
                        </span>

                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                            {info.message}
                        </p>

                        {errors?.reserva && (
                            <p className="mt-3 text-sm font-medium text-red-600">
                                {errors.reserva}
                            </p>
                        )}

                        {flash?.success && (
                            <p className="mt-3 text-sm font-medium text-emerald-600">
                                {flash.success}
                            </p>
                        )}

                        {status === 'pronta' && (
                            <button
                                type="button"
                                onClick={confirmar}
                                disabled={processing}
                                className="btn-accent mt-6 w-full"
                            >
                                Confirmar Check-in
                            </button>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
