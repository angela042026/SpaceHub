import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Armchair,
    CalendarDays,
    ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { resolverImagemSecretaria } from '@/utils/imagemSetor';
import { etiqueta as traduzirEstadoReserva, ESTADO_RESERVA } from '@/utils/estados';

function formatarData(data, locale = 'pt') {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString(locale === 'en' ? 'en-GB' : 'pt-PT', {
        day: '2-digit',
        month: 'short',
    });
}

function getEstadoReserva(reserva, t, tSemEstado) {
    const codigo = reserva.estado_reserva?.codigo;

    const CORES = {
        pendente: 'bg-amber-500/10 text-amber-600 dark:bg-[#f5a524]/10 dark:text-[#f5a524]',
        confirmada: 'bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/10 dark:text-[#18c3b3]',
        cancelada: 'bg-red-500/10 text-red-600 dark:bg-[#ff4d6d]/10 dark:text-[#ff4d6d]',
        expirada: 'bg-slate-500/10 text-slate-600 dark:bg-[#8fa7bd]/10 dark:text-[#8fa7bd]',
        concluida: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    };

    return {
        label: ESTADO_RESERVA[codigo]
            ? traduzirEstadoReserva(ESTADO_RESERVA, codigo, codigo, t)
            : (reserva.estado_reserva?.nome ?? tSemEstado),
        badge: CORES[codigo] ?? 'bg-slate-500/10 text-slate-600 dark:bg-[#8fa7bd]/10 dark:text-[#8fa7bd]',
    };
}

export default function UpcomingReservations({ reservas = [], compact = false, className = '' }) {
    const { t, i18n } = useTranslation('dashboard');
    const { t: tc } = useTranslation('common');
    const limite = compact ? 2 : 4;
    const reservasVisiveis = reservas.slice(0, limite);

    if (compact) {
        return (
            <section className={`dashboard-card flex flex-col overflow-hidden p-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                        {t('proximasReservas.titulo')}
                    </h2>

                    {reservas.length > 0 && (
                        <Link
                            href={route('reservas.index')}
                            className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-[#18c3b3] dark:hover:text-[#15a999]"
                        >
                            {t('proximasReservas.verTodas')}
                        </Link>
                    )}
                </div>

                {reservas.length > 0 ? (
                    <ul className="mt-2 divide-y divide-slate-100 dark:divide-[#2a5069]/60">
                        {reservasVisiveis.map((reserva) => {
                            const estado = getEstadoReserva(reserva, tc, t('proximasReservas.semEstado'));

                            return (
                                <li key={reserva.id}>
                                    <Link
                                        href={route('reservas.index')}
                                        className="flex items-center gap-2.5 py-2.5"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-900 text-white">
                                            <Armchair size={15} strokeWidth={1.9} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="truncate text-xs font-bold text-slate-900 dark:text-[#f8fafc]">
                                                    {reserva.secretaria?.codigo ?? t('proximasReservas.secretariaRemovida')}
                                                </h3>
                                                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${estado.badge}`}>
                                                    {estado.label}
                                                </span>
                                            </div>
                                            <p className="truncate text-[11px] text-slate-500 dark:text-[#8fa7bd]">
                                                {formatarData(reserva.data, i18n.language)} · {reserva.periodo?.nome ?? '-'}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="mt-2 flex min-h-[150px] flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-slate-50/60 px-4 py-4 text-center dark:bg-[#101f34]/40">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                            <CalendarDays size={17} strokeWidth={1.9} />
                        </span>

                        <div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-[#f8fafc]">
                                {t('proximasReservas.semReservasAgendadas')}
                            </h3>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-[#8fa7bd]">
                                {t('proximasReservas.planearSemanaTexto')}
                            </p>
                        </div>

                        <Link
                            href={route('reservas.availability')}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-teal-500/30 bg-white px-3.5 text-[11px] font-bold text-teal-700 transition hover:bg-teal-500/10 dark:border-[#18c3b3]/30 dark:bg-transparent dark:text-[#18c3b3]"
                        >
                            {t('proximasReservas.planearSemana')}
                        </Link>
                    </div>
                )}
            </section>
        );
    }

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-[#2a5069]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                        <CalendarDays size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-[#f8fafc]">
                            {t('proximasReservas.titulo')}
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-[#8fa7bd]">
                            {t('proximasReservas.subtitulo')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 pb-6">
                {reservas.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-[#2a5069]/60">
                        {reservasVisiveis.map((reserva) => {
                            const estado = getEstadoReserva(reserva, tc, t('proximasReservas.semEstado'));
                            const imagem =
                                resolverImagemSecretaria(
                                    reserva.secretaria,
                                );

                            return (
                                <li key={reserva.id}>
                                    <Link
                                        href={route(
                                            'reservas.index',
                                        )}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy-900 text-white">
                                            {imagem ? (
                                                <img
                                                    src={imagem}
                                                    alt={
                                                        reserva
                                                            .secretaria
                                                            ?.codigo ??
                                                        t('proximasReservas.espacoReservado')
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Armchair
                                                    size={19}
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                                                    {reserva.secretaria?.codigo ??
                                                        t('proximasReservas.secretariaRemovida')}
                                                </h3>

                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${estado.badge}`}
                                                >
                                                    {estado.label}
                                                </span>
                                            </div>

                                            <p className="truncate text-xs text-slate-500 dark:text-[#8fa7bd]">
                                                {reserva.secretaria?.setor?.piso?.nome ??
                                                    '-'}{' '}
                                                ·{' '}
                                                {reserva.secretaria?.setor?.nome ??
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                                                {formatarData(
                                                    reserva.data,
                                                    i18n.language,
                                                )}
                                            </p>

                                            <p className="text-xs text-slate-400 dark:text-[#8fa7bd]">
                                                {reserva.periodo?.nome ??
                                                    '-'}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={18}
                                            strokeWidth={1.9}
                                            className="shrink-0 text-slate-300 dark:text-[#8fa7bd]"
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-[#2a5069] dark:bg-[#101f34]/40">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                            <CalendarDays size={30} strokeWidth={1.8} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-[#f8fafc]">
                            {t('proximasReservas.semReservasFuturas')}
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-[#8fa7bd]">
                            {t('proximasReservas.semReservasFuturasTexto')}
                        </p>
                    </div>
                )}

                {reservas.length > 0 && (
                    <Link
                        href={route('reservas.index')}
                        className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-600 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 hover:text-teal-700 dark:border-[#36566f] dark:bg-transparent dark:text-[#d7e3ed] dark:hover:border-[#18c3b3] dark:hover:bg-none dark:hover:bg-[#18c3b3]/[0.06] dark:hover:text-[#18c3b3]"
                    >
                        {t('proximasReservas.verTodasAsReservas')}
                        <ArrowRight size={15} strokeWidth={1.9} />
                    </Link>
                )}
            </div>
        </section>
    );
}
