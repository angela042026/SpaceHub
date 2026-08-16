import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';

const BADGE_CLASS = {
    pronta: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    ja_check_in: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
    pendente_pagamento: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    fora_da_janela: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    sem_reserva: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    ocupada_por_outro: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    indisponivel: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
};

export default function Scan({ secretaria, reserva, status }) {
    const { t } = useTranslation('qrcode');
    const [processing, setProcessing] = useState(false);
    const { errors } = usePage().props;
    const estadoChave = BADGE_CLASS[status] ? status : 'sem_reserva';
    const info = {
        badgeClass: BADGE_CLASS[estadoChave],
        label: t(`scan.estados.${estadoChave}.label`),
        message: t(`scan.estados.${estadoChave}.mensagem`),
    };

    function confirmar() {
        setProcessing(true);
        router.post(
            route('checkin.confirm', reserva.id),
            { qr_token: secretaria.qr_token },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    }

    return (
        <>
            <Head title={t('scan.tituloPagina', { codigo: secretaria.codigo })} />

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

                        {status === 'pronta' && (
                            <button
                                type="button"
                                onClick={confirmar}
                                disabled={processing}
                                className="btn-accent mt-6 w-full"
                            >
                                {processing ? t('scan.aConfirmar') : t('scan.confirmarCheckin')}
                            </button>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
