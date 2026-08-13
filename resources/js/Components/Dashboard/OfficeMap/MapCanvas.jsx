import DeskMarker from './DeskMarker';
import MapLegend from './MapLegend';
import SectorMarker from './SectorMarker';
import SelectedSectorFloatingCard from './SelectedSectorFloatingCard';

export default function MapCanvas({
    pisoAtual,
    setoresInterativos,
    secretariasVisiveis,
    selectedSetorId,
    selectedSecretaria,
    setorSelecionado,
    areaSetorSelecionado,
    zoom,
    rotacao,
    position,
    isDragging,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onSelecionarSetor,
    onSelecionarSecretaria,
    tamanho = 'padrao',
    mostrarLegenda = false,
    somenteMapa = false,
    onVerSecretariasDoSetor,
    onFecharSetorSelecionado,
}) {
    const alturas = {
        padrao: 'h-[460px] sm:h-[550px] xl:h-[585px]',
        grande: 'h-[500px] sm:h-[610px] xl:h-[690px]',
        compacto: 'h-[420px] sm:h-[470px] xl:h-[520px]',
    };

    return (
        <div
            className={`min-w-0 rounded-[20px] bg-[#edf3f8] p-2.5 shadow-[inset_0_1px_3px_rgba(15,42,67,0.06)] dark:bg-[#0c1f33] dark:p-0 ${
                alturas[tamanho] ?? alturas.padrao
            }`}
        >
            <div
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                className={`relative h-full overflow-hidden rounded-2xl border border-white bg-white shadow-[0_14px_35px_rgba(15,23,42,0.10)] select-none touch-none dark:border-[#2a5069] dark:bg-[#101f34] ${
                    isDragging
                        ? 'cursor-grabbing'
                        : 'cursor-grab'
                }`}
            >
                <div
                    className="absolute inset-0 origin-center transition-transform duration-150"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotacao}deg)`,
                    }}
                >
                    <img
                        src={pisoAtual.planta}
                        alt={`Planta do ${pisoAtual.nome}`}
                        draggable={false}
                        className="pointer-events-none absolute inset-0 h-full w-full object-fill saturate-[1.04] contrast-[1.02]"
                    />

                    {somenteMapa && areaSetorSelecionado && (
                        <div
                            className="pointer-events-none absolute z-[5] rounded-xl border-2 border-teal-400/70 bg-teal-400/[0.06]"
                            style={{
                                left: `${areaSetorSelecionado.left}%`,
                                top: `${areaSetorSelecionado.top}%`,
                                width: `${areaSetorSelecionado.right - areaSetorSelecionado.left}%`,
                                height: `${areaSetorSelecionado.bottom - areaSetorSelecionado.top}%`,
                            }}
                        />
                    )}

                    {setoresInterativos.map((setor) => (
                        <SectorMarker
                            key={setor.id}
                            setor={setor}
                            selected={
                                String(selectedSetorId) ===
                                String(setor.id)
                            }
                            onSelect={onSelecionarSetor}
                            destaqueDiscreto={somenteMapa}
                        />
                    ))}

                    {secretariasVisiveis.map(
                        (secretaria) => (
                            <DeskMarker
                                key={secretaria.id}
                                secretaria={secretaria}
                                selected={
                                    selectedSecretaria?.id ===
                                    secretaria.id
                                }
                                hoverEnabled={
                                    !selectedSecretaria
                                }
                                onSelect={
                                    onSelecionarSecretaria
                                }
                                pisoNome={pisoAtual?.nome}
                            />
                        ),
                    )}
                </div>

                {!(somenteMapa && setorSelecionado) && (
                    <div
                        data-map-control="true"
                        className="absolute bottom-3 left-3 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur dark:border-[#2a5069]/60 dark:bg-[#101f34]/90 dark:text-[#b5c5d5] xl:hidden"
                    >
                        {setorSelecionado
                            ? `${setorSelecionado.nome}: escolha uma secretária`
                            : 'Clique num setor para ver as secretárias'}
                    </div>
                )}

                {somenteMapa && setorSelecionado && (
                    <SelectedSectorFloatingCard
                        setor={setorSelecionado}
                        piso={pisoAtual}
                        onVerSecretarias={onVerSecretariasDoSetor}
                        onClose={onFecharSetorSelecionado}
                    />
                )}

                {mostrarLegenda && (
                    <div className="pointer-events-none absolute inset-0 hidden xl:block">
                        <MapLegend />
                    </div>
                )}
            </div>
        </div>
    );
}
