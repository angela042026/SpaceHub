import { ESTADO_VISUAL } from './mapUtils';

const ORDEM = ['livre', 'ocupada', 'reservada', 'indisponivel'];

export default function MapLegend() {
    return (
        <div
            data-map-control="true"
            className="absolute bottom-3 left-3 z-30 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:border-[#2a5069] dark:bg-[#101f34] dark:text-[#b5c5d5]"
        >
            {ORDEM.map((chave) => {
                const estado = ESTADO_VISUAL[chave];

                return (
                    <span key={chave} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${estado.bar}`} />
                        {estado.label}
                    </span>
                );
            })}
        </div>
    );
}
