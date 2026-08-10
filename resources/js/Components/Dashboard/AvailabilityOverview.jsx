// Mesmos tons subtis por piso já usados no chip de sugestão / mapa —
// não introduz nenhuma cor nova na paleta.
const TONS_PISO = ['bg-teal-500', 'bg-[#22c7be]', 'bg-[#4f8fea]'];

function AnelDisponibilidade({ percentual }) {
    const raio = 34;
    const circunferencia = 2 * Math.PI * raio;
    const preenchido = Math.max(0, Math.min(100, percentual));
    const offset = circunferencia * (1 - preenchido / 100);

    return (
        <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            className="-rotate-90 shrink-0"
        >
            <circle
                cx="44"
                cy="44"
                r={raio}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100 dark:text-[#183f5d]"
            />

            {preenchido > 0 && (
                <circle
                    cx="44"
                    cy="44"
                    r={raio}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={offset}
                    className="text-teal-500 transition-all duration-500 dark:text-[#18c3b3]"
                />
            )}
        </svg>
    );
}

export default function AvailabilityOverview({
    overviewPorPiso = [],
    totalLivres = 0,
}) {
    const totalSecretarias = overviewPorPiso.reduce(
        (soma, piso) => soma + piso.total,
        0,
    );

    const percentualLivre =
        totalSecretarias > 0
            ? (totalLivres / totalSecretarias) * 100
            : 0;

    return (
        <section className="dashboard-card flex h-full flex-col p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                Disponibilidade agora
            </h2>

            <div className="mt-4 flex flex-1 items-center gap-5">
                <div className="relative flex shrink-0 items-center justify-center">
                    <AnelDisponibilidade percentual={percentualLivre} />

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <strong className="text-2xl font-extrabold leading-none text-slate-900 dark:text-[#f8fafc]">
                            {totalLivres}
                        </strong>
                        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#8fa7bd]">
                            livres
                        </span>
                    </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2.5">
                    {overviewPorPiso.map((piso, indice) => {
                        const percentual =
                            piso.total > 0
                                ? (piso.livres / piso.total) * 100
                                : 0;

                        return (
                            <div key={piso.codigo}>
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="truncate font-semibold text-slate-600 dark:text-[#d7e3ed]">
                                        {piso.nome}
                                    </span>
                                    <span className="shrink-0 font-bold text-slate-900 dark:text-[#f8fafc]">
                                        {piso.livres}
                                    </span>
                                </div>

                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#183f5d]">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${TONS_PISO[indice % TONS_PISO.length]}`}
                                        style={{ width: `${percentual}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
