export default function SectorMarker({
    setor,
    selected,
    onSelect,
}) {
    const temSecretarias = setor.secretarias?.length > 0;

    const conteudo = (
        <strong className="block max-w-28 truncate text-[9px] font-bold leading-tight">
            {setor.nome}
        </strong>
    );

    if (!temSecretarias) {
        return (
            <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/80 bg-white/90 px-2.5 py-1.5 text-left text-slate-800 shadow-lg backdrop-blur-sm"
                style={{
                    left: `${setor.centroX}%`,
                    top: `${setor.centroY}%`,
                }}
            >
                {conteudo}
            </div>
        );
    }

    return (
        <button
            type="button"
            onPointerDown={(event) =>
                event.stopPropagation()
            }
            onClick={(event) => {
                event.stopPropagation();
                onSelect(setor);
            }}
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-left shadow-lg backdrop-blur-sm transition hover:z-30 hover:-translate-y-[55%] ${
                selected
                    ? 'border-teal-500 bg-teal-600 text-white shadow-teal-950/20'
                    : 'border-white/80 bg-white/90 text-slate-800 hover:border-teal-300 hover:text-teal-700'
            }`}
            style={{
                left: `${setor.centroX}%`,
                top: `${setor.centroY}%`,
            }}
            aria-pressed={selected}
            aria-label={`Ver secretárias do setor ${setor.nome}`}
        >
            {conteudo}
            <span
                className={`mt-0.5 block text-[8px] font-semibold ${
                    selected
                        ? 'text-white/75'
                        : 'text-slate-400'
                }`}
            >
                {setor.secretarias.length} secretárias
            </span>
        </button>
    );
}
