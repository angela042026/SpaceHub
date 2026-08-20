import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ESTADO_VISUAL, estadoNormalizado, traduzirEstadoVisual } from './mapUtils';

export default function DeskMarker({
    secretaria,
    selected,
    hoverEnabled,
    onSelect,
    pisoNome,
}) {
    const { t } = useTranslation('dashboard');
    const chaveEstado = estadoNormalizado(secretaria.status);
    const estado = ESTADO_VISUAL[chaveEstado] ?? ESTADO_VISUAL.indisponivel;
    const estadoLabel = traduzirEstadoVisual(
        ESTADO_VISUAL[chaveEstado] ? chaveEstado : 'indisponivel',
        t,
    );

    return (
        <button
            type="button"
            onPointerDown={(event) =>
                event.stopPropagation()
            }
            onClick={(event) => {
                event.stopPropagation();
                onSelect(secretaria);
            }}
            className={`group absolute outline-none ${
                selected
                    ? 'z-40 animate-desk-pop'
                    : 'z-20 -translate-x-1/2 -translate-y-1/2 hover:z-40 focus-visible:z-40'
            }`}
            style={{
                left: `${secretaria.planta_x}%`,
                top: `${secretaria.planta_y}%`,
            }}
            aria-label={t('officeMap.selecionarSecretaria', { codigo: secretaria.codigo })}
        >
            {selected ? (
                <>
                    <span
                        className={`pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-30 ${estado.ring}`}
                    />

                    <span className="absolute bottom-1 left-1/2 z-40 h-8 w-8 -translate-x-1/2">
                        <MapPin
                            size={32}
                            strokeWidth={1.5}
                            fill="currentColor"
                            className="absolute inset-0 text-white drop-shadow-[0_8px_14px_rgba(15,23,42,0.45)]"
                        />
                        <MapPin
                            size={27}
                            strokeWidth={1.6}
                            fill="currentColor"
                            className={`absolute left-0.5 top-0.5 ${estado.text}`}
                        />
                        <span className="absolute left-1/2 top-[9px] z-10 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[6.5px] font-bold text-slate-700">
                            {secretaria.numero}
                        </span>
                    </span>

                    <span className="pointer-events-none absolute bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-slate-800 shadow-lg backdrop-blur">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${estado.bar}`}
                        />
                        <span className="text-[10px] font-semibold text-slate-600">
                            {estadoLabel}
                        </span>
                    </span>
                </>
            ) : (
                <>
                    <span
                        className={`flex h-[14.5px] w-[14.5px] items-center justify-center rounded-full border-[1.5px] border-white text-[7px] font-bold text-white shadow-[0_1px_4px_rgba(15,23,42,0.35)] transition-all duration-[180ms] ease-out group-hover:scale-110 group-hover:shadow-[0_4px_10px_rgba(15,23,42,0.4)] group-focus-visible:scale-110 group-focus-visible:shadow-[0_4px_10px_rgba(15,23,42,0.4)] ${estado.bar}`}
                    >
                        {secretaria.numero}
                    </span>

                    <span
                        className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 flex-col gap-0.5 whitespace-nowrap rounded-lg border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-slate-800 shadow-lg backdrop-blur transition-all duration-200 ${
                            hoverEnabled
                                ? 'invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
                                : 'invisible opacity-0'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${estado.bar}`}
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                                {secretaria.codigo}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                                · {estadoLabel}
                            </span>
                        </span>

                        {pisoNome && (
                            <span className="text-[9px] font-medium text-slate-400">
                                {pisoNome}
                            </span>
                        )}
                    </span>
                </>
            )}
        </button>
    );
}
