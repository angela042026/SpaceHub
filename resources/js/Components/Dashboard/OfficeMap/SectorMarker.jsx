import { getEstado } from './mapUtils';

export default function SectorMarker({
    setor,
    onClick,
}) {
    const estado = getEstado(setor.status);

    const hasPosition =
        setor.planta_x !== null &&
        setor.planta_x !== undefined &&
        setor.planta_y !== null &&
        setor.planta_y !== undefined;

    if (!hasPosition) {
        return null;
    }

    return (
        <button
            type="button"
            onPointerDown={(event) =>
                event.stopPropagation()
            }
            onClick={(event) => {
                event.stopPropagation();
                onClick?.(setor);
            }}
            aria-label={`Ver detalhes do setor ${setor.nome}`}
            title={setor.nome}
            className={`absolute z-20 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-lg ring-2 ring-white/90 transition duration-200 hover:z-30 hover:scale-125 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:ring-slate-950/80 ${estado.marker}`}
            style={{
                left: `${setor.planta_x}%`,
                top: `${setor.planta_y}%`,
            }}
        >
            {setor.numero}
        </button>
    );
}
