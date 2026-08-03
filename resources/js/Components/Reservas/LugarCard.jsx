import { ImageOff } from 'lucide-react';
import { formatarDataPortugues } from './reservaHelpers';

/**
 * Cartão de um lugar (secretária) na página "Nova Reserva", com os
 * botões de período (Manhã/Tarde/Dia inteiro) e o botão de reservar.
 */
export default function LugarCard({
    secretaria,
    periodosReserva,
    reservaLonga,
    periodoEscolhido,
    onEscolherPeriodo,
    ehAlvo,
    imagemPorTipo,
    aReservar,
    onReservar,
    dataInicio,
    dataFimCalculada,
}) {
    const semDisponibilidade = periodosReserva.every(
        (periodo) => !secretaria.periodos_disponiveis[periodo.id],
    );

    const diaInteiroDisponivel =
        periodosReserva.length > 1 &&
        periodosReserva.every(
            (periodo) => secretaria.periodos_disponiveis[periodo.id],
        );

    const podeReservar = reservaLonga
        ? diaInteiroDisponivel
        : Boolean(periodoEscolhido);

    const emReserva = aReservar === secretaria.id;

    return (
        <div
            id={`lugar-${secretaria.id}`}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${ehAlvo
                ? 'border-teal-500 ring-4 ring-teal-500/20'
                : 'border-slate-200 dark:border-slate-800'
                }`}
        >
            {secretaria.imagem_url || imagemPorTipo ? (
                <img
                    src={secretaria.imagem_url || imagemPorTipo}
                    alt={secretaria.codigo}
                    className="h-40 w-full object-cover"
                />
            ) : (
                <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <ImageOff size={28} strokeWidth={1.6} />
                </div>
            )}

            <div className="p-4">
                <p className="font-bold text-slate-900 dark:text-white">
                    {secretaria.codigo}
                </p>

                {secretaria.descricao && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {secretaria.descricao}
                    </p>
                )}

                <div className="mt-4 flex gap-2">
                    {!reservaLonga &&
                        periodosReserva.map((periodo) => {
                            const disponivel =
                                secretaria.periodos_disponiveis[periodo.id];

                            const selecionado =
                                periodoEscolhido === periodo.id;

                            return (
                                <button
                                    key={periodo.id}
                                    type="button"
                                    disabled={!disponivel}
                                    onClick={() =>
                                        onEscolherPeriodo(
                                            secretaria.id,
                                            periodo.id,
                                        )
                                    }
                                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${selecionado
                                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                        : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {periodo.nome}
                                </button>
                            );
                        })}

                    <button
                        type="button"
                        disabled={!diaInteiroDisponivel}
                        onClick={() =>
                            onEscolherPeriodo(secretaria.id, 'dia_inteiro')
                        }
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${periodoEscolhido === 'dia_inteiro'
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                            }`}
                    >
                        Dia inteiro
                    </button>
                </div>

                {!reservaLonga && semDisponibilidade ? (
                    <p className="mt-3 text-center text-xs text-slate-400">
                        Sem disponibilidade nesta data.
                    </p>
                ) : reservaLonga && !diaInteiroDisponivel ? (
                    <p className="mt-3 text-center text-xs text-slate-400">
                        Dia inteiro indisponível na data inicial.
                    </p>
                ) : (
                    <button
                        type="button"
                        disabled={!podeReservar || emReserva}
                        onClick={() => onReservar(secretaria)}
                        className="mt-3 w-full rounded-xl bg-teal-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    >
                        {emReserva
                            ? 'A reservar...'
                            : reservaLonga
                                ? `Reservar de ${formatarDataPortugues(
                                    dataInicio,
                                )} a ${formatarDataPortugues(
                                    dataFimCalculada,
                                )}`
                                : 'Reservar'}
                    </button>
                )}
            </div>
        </div>
    );
}
