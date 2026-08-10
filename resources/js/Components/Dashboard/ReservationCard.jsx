import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Modal from '@/Components/Modal';
import {
    AlertTriangle,
    CalendarCheck2,
    CheckCircle2,
    QrCode,
    RotateCcw,
    Star,
    XCircle,
} from 'lucide-react';

// Cores dos badges de estado pensadas para o fundo azul-marinho fixo
// deste card (independente do tema claro/escuro do resto do site) —
// os mesmos tons usados nas variantes dark: espalhadas pelo dashboard,
// só que aqui aplicadas sempre, porque o cartão nunca é branco.
const ESTADO_RESERVA_NAVY = {
    pendente: { badge: 'bg-amber-400/15 text-amber-300', dot: 'bg-amber-400' },
    confirmada: { badge: 'bg-teal-400/15 text-teal-300', dot: 'bg-teal-400' },
    cancelada: { badge: 'bg-red-400/15 text-red-300', dot: 'bg-red-400' },
    expirada: { badge: 'bg-slate-400/15 text-slate-300', dot: 'bg-slate-400' },
    concluida: { badge: 'bg-blue-400/15 text-blue-300', dot: 'bg-blue-400' },
};

function getEstadoClasses(codigo) {
    return (
        ESTADO_RESERVA_NAVY[codigo] ?? {
            badge: 'bg-slate-400/15 text-slate-300',
            dot: 'bg-slate-400',
            label: 'Sem estado',
        }
    );
}

import { podeCancelarReserva } from '@/Components/Reservas/reservaHelpers';

/**
 * Janela de check-in [início do período, início + tolerância], com a
 * mesma lógica de tolerância que o backend usa para decidir quando uma
 * reserva pendente passa a "expirada" — ver
 * DemoOcupacaoSeeder::escolherDesfecho() / config('reservas.tolerancia_checkin_minutos').
 */
function calcularJanelaCheckin(reserva, toleranciaMinutos) {
    const horaInicio = reserva?.periodo?.hora_inicio;

    if (!reserva?.data || !horaInicio || !toleranciaMinutos) {
        return null;
    }

    const inicio = new Date(
        `${reserva.data}T${horaInicio.slice(0, 5)}:00`,
    );

    if (Number.isNaN(inicio.getTime())) {
        return null;
    }

    const limite = new Date(
        inicio.getTime() + toleranciaMinutos * 60000,
    );

    return { inicio, limite };
}

function formatarHora(data) {
    return data.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function useCheckinCountdown(reserva, toleranciaMinutos) {
    const [agora, setAgora] = useState(() => new Date());

    useEffect(() => {
        const intervalo = setInterval(
            () => setAgora(new Date()),
            30000,
        );

        return () => clearInterval(intervalo);
    }, []);

    const janela = calcularJanelaCheckin(
        reserva,
        toleranciaMinutos,
    );

    if (!janela) {
        return null;
    }

    const { inicio, limite } = janela;

    if (agora >= limite || agora < inicio) {
        return null;
    }

    const duracaoTotal = limite.getTime() - inicio.getTime();
    const decorrido = agora.getTime() - inicio.getTime();
    const percentual = Math.min(
        100,
        Math.max(0, (decorrido / duracaoTotal) * 100),
    );
    const minutosRestantes = Math.max(
        0,
        Math.round((limite.getTime() - agora.getTime()) / 60000),
    );

    return {
        limiteLabel: formatarHora(limite),
        inicioLabel: formatarHora(inicio),
        fimLabel: formatarHora(limite),
        restanteLabel: `${minutosRestantes} min restantes`,
        percentual,
    };
}

// Onda decorativa quase transparente, usada nos dois estados do card —
// mesma forma, cor clara porque o fundo é sempre azul-marinho.
function OndasDecorativas() {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 top-0 hidden h-full w-56 text-white opacity-[0.05] sm:block"
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid slice"
        >
            <path
                d="M-10,40 C40,10 60,90 110,60 C150,38 170,70 210,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <path
                d="M-10,90 C40,60 60,140 110,110 C150,88 170,120 210,100"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <path
                d="M-10,140 C40,110 60,190 110,160 C150,138 170,170 210,150"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            />
        </svg>
    );
}

export default function ReservationCard({
    reserva,
    totalLivres = 0,
    sugestao = null,
    toleranciaCheckinMinutos = 30,
    onSelecionarSugestao,
}) {
    const [processing, setProcessing] = useState(false);
    const [aConfirmarCancelamento, setAConfirmarCancelamento] =
        useState(false);

    const { errors } = usePage().props;

    const checkin = useCheckinCountdown(
        reserva,
        toleranciaCheckinMinutos,
    );

    if (!reserva) {
        return (
            <section className="relative flex flex-col justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-navy-900 to-navy-950 p-5 shadow-[0_8px_24px_rgba(15,42,67,0.18)] sm:min-h-[200px]">
                <OndasDecorativas />

                <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-300">
                        Hoje
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-white">
                        Ainda não tem reserva
                    </h2>

                    <p className="mt-1 text-sm text-slate-300">
                        {totalLivres} secretárias disponíveis agora
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <Link
                            href={route('reservas.create')}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-400 active:scale-[0.98] dark:bg-[#18c3b3] dark:hover:bg-[#15a999]"
                        >
                            <CalendarCheck2
                                size={17}
                                strokeWidth={2}
                            />
                            Reservar espaço
                        </Link>
                    </div>

                    {sugestao && (
                        <button
                            type="button"
                            onClick={() =>
                                onSelecionarSugestao?.(sugestao)
                            }
                            className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left transition hover:bg-white/10"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Star
                                    size={14}
                                    strokeWidth={2.2}
                                    className="shrink-0 text-teal-300"
                                />

                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-300">
                                        Recomendação para si
                                    </p>
                                    <p className="truncate text-sm font-bold text-white">
                                        {sugestao.codigo}
                                        {sugestao.setor?.nome
                                            ? ` · ${sugestao.setor.nome}`
                                            : ''}
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-300">
                                Livre
                            </span>
                        </button>
                    )}
                </div>
            </section>
        );
    }

    const jaFezCheckIn = reserva.check_in_at !== null;
    const estadoCodigo = reserva.estado_reserva?.codigo;
    const estado = getEstadoClasses(estadoCodigo);
    const podeCancelar = podeCancelarReserva(reserva);

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
        router.patch(
            route('reservas.cancelar', reserva.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setAConfirmarCancelamento(false);
                },
            },
        );
    }

    return (
        <section className="relative flex h-full flex-col overflow-hidden rounded-[20px] bg-gradient-to-br from-navy-900 to-navy-950 p-6 shadow-[0_8px_24px_rgba(15,42,67,0.18)]">
            <OndasDecorativas />

            <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300">
                            <CalendarCheck2
                                size={22}
                                strokeWidth={1.9}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Reserva de hoje
                            </p>
                            <h2 className="text-2xl font-extrabold leading-tight text-white">
                                {reserva.secretaria?.codigo}
                            </h2>
                        </div>
                    </div>

                    <span
                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estado.badge}`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${estado.dot}`}
                        />
                        {reserva.estado_reserva?.nome ??
                            estado.label}
                    </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-300">
                    {reserva.secretaria?.setor?.piso?.nome} ·{' '}
                    {reserva.secretaria?.setor?.nome}
                </p>

                <p className="mt-0.5 text-sm text-slate-400">
                    Hoje · {reserva.periodo?.nome}
                </p>

                {errors?.reserva && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
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

                {!jaFezCheckIn && checkin && (
                    <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                            <span>
                                Check-in disponível até às{' '}
                                {checkin.limiteLabel}
                            </span>
                            <span>{checkin.restanteLabel}</span>
                        </div>

                        <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-400/15">
                            <div
                                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                style={{
                                    width: `${checkin.percentual}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={fazerCheckIn}
                        disabled={processing || jaFezCheckIn}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#18c3b3] dark:hover:bg-[#15a999]"
                    >
                        {jaFezCheckIn ? (
                            <>
                                <CheckCircle2
                                    size={18}
                                    strokeWidth={2}
                                />
                                Check-in efetuado
                            </>
                        ) : (
                            <>
                                <QrCode
                                    size={18}
                                    strokeWidth={2}
                                />
                                Fazer Check-in
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setAConfirmarCancelamento(true)
                        }
                        disabled={processing || !podeCancelar}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-red-400/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <XCircle size={18} strokeWidth={2} />
                        Cancelar Reserva
                    </button>
                </div>
            </div>

            <Modal
                show={aConfirmarCancelamento}
                onClose={() =>
                    setAConfirmarCancelamento(false)
                }
            >
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                            <AlertTriangle
                                size={22}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Cancelar esta reserva?
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                A secretária{' '}
                                {reserva.secretaria?.codigo}{' '}
                                no período{' '}
                                {reserva.periodo?.nome} fica
                                livre para outra pessoa
                                reservar. Esta ação não pode
                                ser desfeita.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setAConfirmarCancelamento(
                                    false,
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            Voltar
                        </button>

                        <button
                            type="button"
                            onClick={cancelarReserva}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <RotateCcw
                                        size={16}
                                        strokeWidth={2}
                                        className="animate-spin"
                                    />
                                    A cancelar...
                                </>
                            ) : (
                                'Cancelar Reserva'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
