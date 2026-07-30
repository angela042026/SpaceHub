const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

/**
 * Painel de características filtráveis (Monitor, Janela, etc.). A lista
 * é fixa (igual para qualquer piso/setor) e aparece sempre.
 */
export default function PreferenciasPanel({
    preferenciasDisponiveis,
    preferencias,
    onAlternarPreferencia,
}) {
    return (
        <div className="mt-5">
            <p className={labelClass}>Preferências</p>

            <div className="mt-3 flex flex-wrap gap-3">
                {preferenciasDisponiveis.map((preferencia) => (
                    <label
                        key={preferencia.key}
                        className="cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={preferencias[preferencia.key]}
                            onChange={() =>
                                onAlternarPreferencia(preferencia.key)
                            }
                            className="peer sr-only"
                        />

                        <span
                            className="
                                inline-flex
                                items-center
                                rounded-full
                                border
                                border-slate-300
                                bg-white
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-slate-700
                                transition-all
                                duration-200
                                hover:border-teal-500
                                hover:bg-teal-50
                                hover:text-teal-600
                                peer-checked:border-teal-500
                                peer-checked:bg-teal-500
                                peer-checked:text-white
                                peer-checked:shadow-md
                                dark:border-slate-700
                                dark:bg-slate-900
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                            "
                        >
                            {preferencia.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
