import { router, usePage } from '@inertiajs/react';

import { useState } from 'react';

import {

    Building2,

    CalendarCheck2,

    CheckCircle2,

    Clock3,

    Layers3,

    MapPinned,

    QrCode,

    RotateCcw,

    XCircle,

} from 'lucide-react';

const ESTADO_CLASSES = {

    confirmada: {

        badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',

        dot: 'bg-teal-500',

        label: 'Confirmada',

    },

    pendente: {

        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',

        dot: 'bg-amber-500',

        label: 'Pendente',

    },

    cancelada: {

        badge: 'bg-red-500/10 text-red-600 dark:text-red-400',

        dot: 'bg-red-500',

        label: 'Cancelada',

    },

    expirada: {

        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',

        dot: 'bg-slate-400',

        label: 'Expirada',

    },

    concluida: {

        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',

        dot: 'bg-blue-500',

        label: 'Concluída',

    },

};

function getEstadoClasses(codigo) {

    return (

        ESTADO_CLASSES[codigo] ?? {

            badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',

            dot: 'bg-slate-400',

            label: 'Sem estado',

        }

    );

}

export default function ReservationCard({ reserva }) {

    const [processing, setProcessing] = useState(false);

    const { errors } = usePage().props;

    if (!reserva) {

        return (
            <section className="dashboard-card overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CalendarCheck2 size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                                Reserva de Hoje
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">

                                Consulte a sua reserva atual.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <CalendarCheck2 size={30} strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">

                        Sem reserva para hoje
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">

                        Ainda não existe nenhuma reserva registada para o dia de hoje.
                    </p>
                    <button

                        type="button"

                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-950 disabled:cursor-not-allowed disabled:opacity-50"

                        disabled
                    >
                        <CalendarCheck2 size={18} strokeWidth={1.9} />

                        Reservar Secretária
                    </button>
                </div>
            </section>

        );

    }

    const jaFezCheckIn = reserva.check_in_at !== null;

    const estadoCodigo = reserva.estado_reserva?.codigo;

    const estado = getEstadoClasses(estadoCodigo);

    const podeCancelar =

        !jaFezCheckIn &&

        !['cancelada', 'expirada', 'concluida'].includes(estadoCodigo);

    function fazerCheckIn() {

        setProcessing(true);

        router.post(

            route('checkin.confirm', reserva.id),

            {},

            {

                preserveScroll: true,

                onFinish: () => setProcessing(false),

            },

        );

    }

    function cancelarReserva() {

        setProcessing(true);

        router.post(

            route('reservas.cancelar', reserva.id),

            {},

            {

                preserveScroll: true,

                onFinish: () => setProcessing(false),

            },

        );

    }

    return (
        <section className="dashboard-card overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CalendarCheck2 size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">

                                Reserva de Hoje
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">

                                Informação da sua reserva atual.
                            </p>
                        </div>
                    </div>
                    <span

                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estado.badge}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${estado.dot}`} />

                        {reserva.estado_reserva?.nome ?? estado.label}
                    </span>
                </div>
            </div>
            <div className="p-6">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Info

                            icon={Building2}

                            label="Edifício"

                            value={reserva.secretaria?.setor?.piso?.edificio?.nome}

                        />
                        <Info

                            icon={Layers3}

                            label="Piso"

                            value={reserva.secretaria?.setor?.piso?.nome}

                        />
                        <Info

                            icon={MapPinned}

                            label="Setor"

                            value={reserva.secretaria?.setor?.nome}

                        />
                        <Info

                            icon={QrCode}

                            label="Secretária"

                            value={reserva.secretaria?.codigo}

                        />
                        <Info

                            icon={Clock3}

                            label="Período"

                            value={reserva.periodo?.nome}

                        />
                        <Info

                            icon={CheckCircle2}

                            label="Estado"

                            value={reserva.estado_reserva?.nome}

                        />
                    </div>
                </div>

                {errors?.reserva && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                        <XCircle

                            size={19}

                            strokeWidth={1.9}

                            className="mt-0.5 shrink-0"

                        />
                        <p className="text-sm font-medium">

                            {errors.reserva}
                        </p>
                    </div>

                )}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button

                        type="button"

                        onClick={fazerCheckIn}

                        disabled={processing || jaFezCheckIn}

                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {jaFezCheckIn ? (
                            <>
                                <CheckCircle2 size={18} strokeWidth={2} />

                                Check-in efetuado
                            </>

                        ) : (
                            <>
                                <QrCode size={18} strokeWidth={2} />

                                Fazer Check-in
                            </>

                        )}
                    </button>
                    <button

                        type="button"

                        onClick={cancelarReserva}

                        disabled={processing || !podeCancelar}

                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
                    >

                        {processing ? (
                            <>
                                <RotateCcw

                                    size={18}

                                    strokeWidth={2}

                                    className="animate-spin"

                                />

                                A processar...
                            </>

                        ) : (
                            <>
                                <XCircle size={18} strokeWidth={2} />

                                Cancelar Reserva
                            </>

                        )}
                    </button>
                </div>
            </div>
        </section>

    );

}

function Info({ icon: Icon, label, value }) {

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                <Icon size={19} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">

                    {label}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">

                    {value ?? '-'}
                </p>
            </div>
        </div>

    );

}

