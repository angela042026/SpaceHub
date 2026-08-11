import { AlertCircle, ImageOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatarDataPortugues } from './reservaHelpers';
import { resolverImagemSecretaria } from '@/utils/imagemSetor';
import LocalizacaoEspaco from './LocalizacaoEspaco';

/**
 * Cartão de um lugar (secretária) na página "Nova Reserva", com o
 * código em badge discreto sobre a foto, o nome + piso por baixo, os
 * botões de período (Manhã/Tarde/Dia inteiro) e o botão de reservar.
 *
 * Só recebe cartões com pelo menos um período disponível — a filtragem
 * é feita em Create.jsx, por isso aqui não existe estado "sem
 * disponibilidade".
 */
export default function LugarCard({
    secretaria,
    periodosReserva,
    reservaLonga,
    periodoEscolhido,
    onEscolherPeriodo,
    ehAlvo,
    aReservar,
    onReservar,
    dataInicio,
    dataFimCalculada,
}) {
    const diaInteiroDisponivel =
        periodosReserva.length > 1 &&
        periodosReserva.every(
            (periodo) => secretaria.periodos_disponiveis[periodo.id],
        );

    const podeReservar = reservaLonga
        ? diaInteiroDisponivel
        : Boolean(periodoEscolhido);

    const emReserva = aReservar === secretaria.id;
    const imagem = resolverImagemSecretaria(secretaria);
    const categoriaNome = secretaria.setor?.nome;
    const numeroLugar = secretaria.codigo?.match(/\d+$/)?.[0];
    const titulo = categoriaNome
        ? `${categoriaNome} ${numeroLugar ?? ''}`.trim()
        : secretaria.codigo;

    const grupoPeriodosRef = useRef(null);
    const [mostrarErroPeriodo, setMostrarErroPeriodo] = useState(false);

    // A mensagem desaparece assim que passa a existir um período válido
    // escolhido — não é preciso o utilizador fechá-la manualmente.
    useEffect(() => {
        if (podeReservar) {
            setMostrarErroPeriodo(false);
        }
    }, [podeReservar]);

    const aoClicarReservar = () => {
        if (emReserva) {
            return;
        }

        if (!podeReservar) {
            setMostrarErroPeriodo(true);
            grupoPeriodosRef.current?.focus();
            return;
        }

        onReservar(secretaria);
    };

    return (
        <div
            id={`lugar-${secretaria.id}`}
            className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow dark:bg-slate-900 ${
                ehAlvo
                    ? 'border-teal-500 ring-4 ring-teal-500/20'
                    : 'border-slate-200 hover:shadow-md dark:border-slate-800'
            }`}
        >
            <div className="relative">
                {imagem ? (
                    <img
                        src={imagem}
                        alt={titulo}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <ImageOff size={28} strokeWidth={1.6} />
                    </div>
                )}

                <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                    {secretaria.codigo}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="truncate text-base font-bold leading-tight text-slate-900 dark:text-white">
                    {titulo}
                </p>

                <LocalizacaoEspaco secretaria={secretaria} className="mt-1" />

                <div
                    ref={grupoPeriodosRef}
                    role="group"
                    aria-label="Períodos disponíveis"
                    tabIndex={-1}
                    className="mt-4 flex gap-2 outline-none"
                >
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
                                    aria-pressed={selecionado}
                                    aria-label={
                                        disponivel
                                            ? periodo.nome
                                            : `${periodo.nome} — indisponível`
                                    }
                                    onClick={() =>
                                        onEscolherPeriodo(
                                            secretaria.id,
                                            periodo.id,
                                        )
                                    }
                                    className={`flex-1 rounded-xl border px-2 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:focus-visible:ring-offset-slate-900 ${
                                        selecionado
                                            ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                                            : disponivel
                                                ? 'border-slate-200 bg-white text-slate-900 hover:border-teal-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                                                : 'border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-600'
                                    }`}
                                >
                                    {periodo.nome}
                                </button>
                            );
                        })}

                    <button
                        type="button"
                        disabled={!diaInteiroDisponivel}
                        aria-pressed={periodoEscolhido === 'dia_inteiro'}
                        aria-label={
                            diaInteiroDisponivel
                                ? 'Dia inteiro'
                                : 'Dia inteiro — indisponível'
                        }
                        onClick={() =>
                            onEscolherPeriodo(secretaria.id, 'dia_inteiro')
                        }
                        className={`flex-1 rounded-xl border px-2 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed dark:focus-visible:ring-offset-slate-900 ${
                            periodoEscolhido === 'dia_inteiro'
                                ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                                : diaInteiroDisponivel
                                    ? 'border-slate-200 bg-white text-slate-900 hover:border-teal-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
                                    : 'border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-600'
                        }`}
                    >
                        Dia inteiro
                    </button>
                </div>

                {mostrarErroPeriodo ? (
                    <div
                        role="alert"
                        className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
                    >
                        <AlertCircle
                            size={14}
                            strokeWidth={2}
                            className="shrink-0"
                        />
                        Selecione um período antes de reservar.
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={emReserva}
                        onClick={aoClicarReservar}
                        className="mt-3 h-11 w-full rounded-xl bg-teal-500 px-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-sm dark:focus-visible:ring-offset-slate-900"
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
