import { useTranslation } from 'react-i18next';

export default function SectorMarker({
    setor,
    selected,
    onSelect,
    destaqueDiscreto = false,
    compacto = false,
}) {
    const { t } = useTranslation('dashboard');
    const temSecretarias = setor.secretarias?.length > 0;

    const conteudo = (
        <strong
            className={`block max-w-28 truncate font-bold leading-tight ${
                compacto ? 'text-[7px]' : 'text-[9px]'
            }`}
        >
            {setor.nome}
        </strong>
    );

    const padding = compacto ? 'px-1.5 py-1' : 'px-2.5 py-1.5';

    if (!temSecretarias) {
        return (
            <div
                title={setor.nome}
                className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/80 bg-white/90 text-left text-slate-800 shadow-lg backdrop-blur-sm ${padding}`}
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
            title={setor.nome}
            onPointerDown={(event) =>
                event.stopPropagation()
            }
            onClick={(event) => {
                event.stopPropagation();
                onSelect(setor);
            }}
            className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border text-left shadow-lg backdrop-blur-sm transition hover:z-30 hover:-translate-y-[55%] ${padding} ${
                selected
                    ? destaqueDiscreto
                        ? 'border-2 border-teal-500 bg-white text-teal-700 shadow-teal-500/20'
                        : 'border-teal-500 bg-teal-600 text-white shadow-teal-950/20'
                    : 'border-white/80 bg-white/90 text-slate-800 hover:border-teal-300 hover:text-teal-700'
            }`}
            style={{
                left: `${setor.centroX}%`,
                top: `${setor.centroY}%`,
            }}
            aria-pressed={selected}
            aria-label={t('officeMap.verSecretariasDoSetor', { setor: setor.nome })}
        >
            {conteudo}
            <span
                className={`mt-0.5 block font-semibold ${compacto ? 'text-[6px]' : 'text-[8px]'} ${
                    selected
                        ? 'text-white/75'
                        : 'text-slate-400'
                }`}
            >
                {t('officeMap.secretariaCount', { count: setor.secretarias.length })}
            </span>
        </button>
    );
}
