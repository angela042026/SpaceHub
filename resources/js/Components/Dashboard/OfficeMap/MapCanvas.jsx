import DeskMarker from './DeskMarker';
import SectorMarker from './SectorMarker';

export default function MapCanvas({
    pisoAtual,
    setoresInterativos,
    secretariasVisiveis,
    selectedSetorId,
    selectedSecretaria,
    setorSelecionado,
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
}) {
    return (
        <div className="min-w-0">
            <div
                onWheel={onWheel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                className={`relative h-[430px] overflow-hidden rounded-2xl bg-white shadow-[0_14px_35px_rgba(15,23,42,0.10)] select-none touch-none sm:h-[520px] xl:h-[555px] ${
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

                    {setoresInterativos.map((setor) => (
                        <SectorMarker
                            key={setor.id}
                            setor={setor}
                            selected={
                                String(selectedSetorId) ===
                                String(setor.id)
                            }
                            onSelect={onSelecionarSetor}
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
                            />
                        ),
                    )}
                </div>

                <div
                    data-map-control="true"
                    className="absolute bottom-3 left-3 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur xl:hidden"
                >
                    {setorSelecionado
                        ? `${setorSelecionado.nome}: escolha uma secretária`
                        : 'Clique num setor para ver as secretárias'}
                </div>
            </div>
        </div>
    );
}
