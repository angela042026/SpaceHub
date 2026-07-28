import { getEstado } from './mapUtils';

export default function DeskMarker({
    secretaria,
    isSelected = false,
    isSearchResult = false,
    expandido = false,
    onClick,
}) {
    const estado = getEstado(secretaria.status);

    const hasPosition =
        secretaria.planta_x !== null &&
        secretaria.planta_x !== undefined &&
        secretaria.planta_y !== null &&
        secretaria.planta_y !== undefined;

    if (!hasPosition) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => onClick?.(secretaria)}
            aria-label={
                expandido
                    ? `Ver detalhes da secretária ${secretaria.codigo}`
                    : `Reservar a secretária ${secretaria.codigo}`
            }
            title={`${secretaria.codigo} — ${estado.label}`}
            className={`absolute z-20 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold text-white shadow ring-2 ring-white/90 transition duration-300 hover:z-30 hover:scale-125 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:ring-slate-950/80 ${
                estado.marker
            } ${
                isSelected
                    ? 'z-30 scale-150 ring-4 ring-teal-300 shadow-xl'
                    : ''
            } ${isSearchResult ? 'animate-pulse' : ''}`}
            style={{
                left: `${secretaria.planta_x}%`,
                top: `${secretaria.planta_y}%`,
            }}
        >
            {secretaria.numero}
        </button>
    );
}
