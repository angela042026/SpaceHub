import { ESTADO_VISUAL } from './mapUtils';

const ORDEM = ['livre', 'ocupada', 'reservada', 'indisponivel'];

export default function MapLegend({ compacto = false }) {
    return (
        <div
            data-map-control="true"
            className={`absolute z-30 flex items-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#b5c5d5] ${
                compacto
                    ? 'bottom-2 left-2 gap-2 px-2 py-1.5 text-[10px]'
                    : 'bottom-3 left-3 gap-3 px-3 py-2 text-[11px]'
            }`}
        >
            {ORDEM.map((chave) => {
                const estado = ESTADO_VISUAL[chave];

                return (
                    <span key={chave} className="flex items-center gap-1.5">
                        <span
                            className={`rounded-full ${estado.bar} ${compacto ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}
                        />
                        {estado.label}
                    </span>
                );
            })}
        </div>
    );
}
