import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Armchair, Check, Copy, MapPin, MoreVertical, MousePointerClick, Sparkles } from 'lucide-react';

import { AvailabilityTimeline } from '@/Components/Dashboard/OfficeMap/DeskDetailPanel';
import { COMODIDADES } from '@/Components/Dashboard/OfficeMap/mapUtils';
import { resolverImagemSecretaria } from '@/utils/imagemSetor';

/**
 * Card lateral com foto, comodidades e disponibilidade de uma
 * secretária — reaproveitado tanto para "sugestão para si" (sem
 * reserva hoje) como para "a sua reserva" (com reserva hoje), cada
 * chamada é que decide o título, badge, texto complementar e botões.
 * Sem secretária selecionada, mostra um estado neutro compacto em vez
 * de um placeholder gigante.
 */
export default function DeskSidebarCard({
    titulo,
    secretaria,
    pisoNome,
    badge,
    recomendada = false,
    infoComplementar,
    checkin,
    children,
}) {
    const [menuAberto, setMenuAberto] = useState(false);
    const [codigoCopiado, setCodigoCopiado] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function fecharAoClicarFora(event) {
            if (!menuRef.current?.contains(event.target)) {
                setMenuAberto(false);
            }
        }

        document.addEventListener('mousedown', fecharAoClicarFora);
        return () => document.removeEventListener('mousedown', fecharAoClicarFora);
    }, []);

    if (!secretaria) {
        return (
            <section className="dashboard-card flex flex-col items-center justify-center gap-2 overflow-hidden p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-[#183f5d] dark:text-[#8fa7bd]">
                    <MousePointerClick
                        size={18}
                        strokeWidth={1.8}
                    />
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                    Selecione uma secretária
                </h3>

                <p className="max-w-[220px] text-xs leading-relaxed text-slate-500 dark:text-[#8fa7bd]">
                    Clique num número do mapa para
                    consultar disponibilidade e
                    comodidades.
                </p>
            </section>
        );
    }

    const imagem = resolverImagemSecretaria(secretaria);
    const comodidades = COMODIDADES.filter(
        ([chave]) => secretaria[chave],
    ).slice(0, 5);

    function copiarCodigo() {
        navigator.clipboard?.writeText(secretaria.codigo).then(() => {
            setCodigoCopiado(true);
            setTimeout(() => setCodigoCopiado(false), 1500);
        });
        setMenuAberto(false);
    }

    return (
        <section className="dashboard-card flex flex-col overflow-hidden p-5">
            <div className="relative rounded-[15px] bg-teal-500/[0.06] p-3.5 dark:bg-[#18c3b3]/[0.07]">
                <div className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white bg-slate-50 shadow-sm dark:border-[#2a5069] dark:bg-[#101f34]">
                        {imagem ? (
                            <img
                                src={imagem}
                                alt={secretaria.codigo}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-teal-600 dark:text-[#18c3b3]">
                                <Armchair
                                    size={30}
                                    strokeWidth={1.5}
                                />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        {recomendada && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-teal-700 shadow-sm dark:bg-[#101f34] dark:text-[#18c3b3]">
                                <Sparkles size={10} strokeWidth={2.4} />
                                Recomendada para si
                            </span>
                        )}

                        <h2 className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-[#f8fafc]">
                            {titulo}
                        </h2>

                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                            {secretaria.codigo} · {pisoNome}
                        </p>

                        {badge && (
                            <span
                                className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.className}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {badge.label}
                            </span>
                        )}
                    </div>

                    <div ref={menuRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setMenuAberto((aberto) => !aberto)}
                            aria-label="Mais ações"
                            aria-haspopup="menu"
                            aria-expanded={menuAberto}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-600 dark:text-[#8fa7bd] dark:hover:bg-[#101f34]"
                        >
                            <MoreVertical size={15} />
                        </button>

                        {menuAberto && (
                            <div
                                role="menu"
                                className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-[#2a5069] dark:bg-[#101f34]"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={copiarCodigo}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-[#d7e3ed] dark:hover:bg-[#183f5d]"
                                >
                                    {codigoCopiado ? (
                                        <Check size={13} className="text-teal-600 dark:text-[#18c3b3]" />
                                    ) : (
                                        <Copy size={13} />
                                    )}
                                    {codigoCopiado ? 'Código copiado' : 'Copiar código'}
                                </button>

                                <Link
                                    href={route('mapa.index')}
                                    role="menuitem"
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-[#d7e3ed] dark:hover:bg-[#183f5d]"
                                >
                                    <MapPin size={13} />
                                    Ver no mapa completo
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {infoComplementar && (
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                    {infoComplementar}
                </p>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-[#2a5069]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8fa7bd]">
                    Comodidades
                </p>

                <div className="mt-3 grid grid-cols-5 gap-2">
                    {comodidades.length > 0 ? (
                        comodidades.map(
                            ([chave, label, Icon]) => (
                                <div
                                    key={chave}
                                    className="group text-center"
                                    title={label}
                                >
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-700 transition-colors duration-200 group-hover:bg-teal-500/15 group-hover:text-teal-700 dark:bg-[#183f5d] dark:text-[#d7e3ed] dark:group-hover:bg-[#18c3b3]/20 dark:group-hover:text-[#18c3b3]">
                                        <Icon size={15} strokeWidth={1.8} />
                                    </div>
                                    <p className="mt-1 truncate text-[8px] font-medium text-slate-500 dark:text-[#8fa7bd]">
                                        {label}
                                    </p>
                                </div>
                            ),
                        )
                    ) : (
                        <p className="col-span-5 text-xs text-slate-400 dark:text-[#8fa7bd]">
                            Sem comodidades registadas.
                        </p>
                    )}
                </div>
            </div>

            <AvailabilityTimeline
                periodos={secretaria.disponibilidade ?? []}
            />

            {checkin && (
                <div className="border-b border-slate-200 pb-4 dark:border-[#2a5069]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-[#8fa7bd]">
                        <span>
                            Check-in até às{' '}
                            {checkin.limiteLabel}
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-bold text-amber-600 dark:bg-[#f5a524]/10 dark:text-[#f5a524]">
                            {checkin.restanteLabel}
                        </span>
                    </div>

                    <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#101f34]">
                        <div
                            className="h-full rounded-full bg-teal-500 transition-all duration-500 dark:bg-[#18c3b3]"
                            style={{
                                width: `${checkin.percentual}%`,
                            }}
                        />
                    </div>

                    <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-slate-400 dark:text-[#8fa7bd]">
                        <span>{checkin.inicioLabel}</span>
                        <span>{checkin.fimLabel}</span>
                    </div>
                </div>
            )}

            <div className="mt-5 space-y-2">
                {children}
            </div>
        </section>
    );
}
