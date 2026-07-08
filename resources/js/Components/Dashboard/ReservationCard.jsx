import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ReservationCard({ reserva }) {
    const [processing, setProcessing] = useState(false);
    const { errors } = usePage().props;

    if (!reserva) {
        return (
            <div className="dashboard-card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Reserva de Hoje
                </h2>

                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                    Não existe nenhuma reserva para hoje.
                </p>

                <button className="btn-primary mt-6 w-full" disabled>
                    Reservar Secretária
                </button>
            </div>
        );
    }

    const jaFezCheckIn = reserva.check_in_at !== null;
    const estadoCodigo = reserva.estado_reserva?.codigo;
    const podeCancelar = !jaFezCheckIn && !['cancelada', 'expirada'].includes(estadoCodigo);

    function fazerCheckIn() {
        setProcessing(true);
        router.post(
            route('checkin.confirm', reserva.id),
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    }

    function cancelarReserva() {
        setProcessing(true);
        router.post(
            route('reservas.cancelar', reserva.id),
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    }

    return (
        <div className="dashboard-card">
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Reserva de Hoje
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Informação da reserva atual.
                </p>
            </div>

            <div className="space-y-5 p-6">
                <Info
                    label="Edifício"
                    value={reserva.secretaria?.setor?.piso?.edificio?.nome}
                />

                <Info
                    label="Piso"
                    value={reserva.secretaria?.setor?.piso?.nome}
                />

                <Info label="Setor" value={reserva.secretaria?.setor?.nome} />

                <Info label="Secretária" value={reserva.secretaria?.codigo} />

                <Info label="Período" value={reserva.periodo?.nome} />

                <Info label="Estado" value={reserva.estado_reserva?.nome} />

                {errors?.reserva && (
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {errors.reserva}
                    </p>
                )}

                <button
                    type="button"
                    onClick={fazerCheckIn}
                    disabled={processing || jaFezCheckIn}
                    className="btn-accent w-full"
                >
                    {jaFezCheckIn ? 'Check-in efetuado ✓' : 'Fazer Check-in'}
                </button>

                <button
                    type="button"
                    onClick={cancelarReserva}
                    disabled={processing || !podeCancelar}
                    className="btn-danger w-full"
                >
                    Cancelar Reserva
                </button>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="info-row">
            <span className="text-sm text-slate-500 dark:text-slate-400">
                {label}
            </span>

            <span className="font-semibold text-slate-800 dark:text-slate-100">
                {value ?? '-'}
            </span>
        </div>
    );
}
