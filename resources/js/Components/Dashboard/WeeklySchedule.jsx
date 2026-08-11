import { Link } from '@inertiajs/react';
import { Armchair, Plus } from 'lucide-react';
import { useMemo } from 'react';

const ABREVIACOES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function dataLocalIso(data) {
    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, '0'),
        String(data.getDate()).padStart(2, '0'),
    ].join('-');
}

// Segunda a sexta da semana de trabalho atual — se hoje já é fim de
// semana, mostra a próxima (não faz sentido mostrar dias já passados
// desde a última segunda).
function diasUteisDaSemana(hoje) {
    const diaSemana = hoje.getDay();
    const deslocamentoParaSegunda =
        diaSemana === 0 ? 1 : diaSemana === 6 ? 2 : 1 - diaSemana;

    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + deslocamentoParaSegunda);

    return Array.from({ length: 5 }, (_, indice) => {
        const dia = new Date(segunda);
        dia.setDate(segunda.getDate() + indice);
        return dia;
    });
}

export default function WeeklySchedule({
    reservaHojeUtilizador,
    proximasReservas = [],
}) {
    const dias = useMemo(() => {
        const hoje = new Date();
        const isoHoje = dataLocalIso(hoje);

        const reservas = [
            reservaHojeUtilizador,
            ...proximasReservas,
        ].filter(Boolean);

        return diasUteisDaSemana(hoje).map((dia) => {
            const isoData = dataLocalIso(dia);
            const reserva = reservas.find(
                (item) => item.data?.slice(0, 10) === isoData,
            );

            return {
                iso: isoData,
                abreviacao: ABREVIACOES[dia.getDay()],
                numero: dia.getDate(),
                hoje: isoData === isoHoje,
                reserva,
            };
        });
    }, [reservaHojeUtilizador, proximasReservas]);

    return (
        <section className="dashboard-card flex h-full flex-col p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                A sua semana
            </h2>

            <div className="mt-4 grid flex-1 grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2.5">
                {dias.map((dia) => {
                    const conteudo = (
                        <>
                            <span
                                className={`whitespace-nowrap text-[11px] font-bold ${
                                    dia.hoje
                                        ? 'text-teal-700 dark:text-[#18c3b3]'
                                        : 'text-slate-600 dark:text-[#b5c5d5]'
                                }`}
                            >
                                {dia.abreviacao} {dia.numero}
                            </span>

                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
                                    dia.reserva
                                        ? 'border-transparent bg-teal-500 text-white'
                                        : 'border-slate-200 bg-white text-slate-500 group-hover/dia:border-teal-400/60 group-hover/dia:bg-teal-500/15 group-hover/dia:text-teal-600 dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#8fa7bd] dark:group-hover/dia:bg-[#18c3b3]/15 dark:group-hover/dia:text-[#18c3b3]'
                                }`}
                            >
                                {dia.reserva ? (
                                    <Armchair size={16} strokeWidth={2} />
                                ) : (
                                    <Plus size={16} strokeWidth={2.2} />
                                )}
                            </span>

                            {dia.reserva ? (
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-slate-900 dark:text-[#f8fafc]">
                                        {dia.reserva.secretaria?.codigo}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-[#8fa7bd]">
                                        {dia.reserva.periodo?.hora_inicio?.slice(0, 5)}
                                    </p>
                                </div>
                            ) : (
                                <p className="flex items-center gap-0.5 text-[10px] font-bold text-teal-700 transition-colors duration-200 group-hover/dia:text-teal-600 dark:text-[#18c3b3]">
                                    Reservar
                                </p>
                            )}
                        </>
                    );

                    const classeComum =
                        'group/dia flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center outline-none transition-all duration-200';

                    if (dia.reserva) {
                        return (
                            <div
                                key={dia.iso}
                                className={`${classeComum} border-teal-500/25 bg-teal-500/[0.06] dark:border-[#18c3b3]/25 dark:bg-[#18c3b3]/[0.08]`}
                            >
                                {conteudo}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={dia.iso}
                            href={route('reservas.create', { data: dia.iso })}
                            className={`${classeComum} ${
                                dia.hoje
                                    ? 'border-teal-500/30 bg-teal-500/[0.04]'
                                    : 'border-[#e7eef5] bg-[#fbfdfe]'
                            } hover:border-teal-400/60 hover:bg-teal-500/[0.06] focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:border-[#2a5069]/60 dark:bg-[#101f34] dark:hover:border-[#18c3b3]/50`}
                        >
                            {conteudo}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
