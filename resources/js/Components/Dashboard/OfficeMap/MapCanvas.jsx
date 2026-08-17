import { useTranslation } from 'react-i18next';

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
    ajustarProporcao = false,
    // Só a linha final das Estatísticas: em vez de uma altura fixa em
    // pixels, o canvas passa a ocupar 100% do espaço que o grid
    // (items-stretch) já reservou para esta coluna — é assim que o
    // mapa acompanha exatamente a altura dos donuts vizinhos, em vez
    // de forçar a linha inteira a ficar mais alta que eles.
    preencherAltura = false,
    onVerSecretariasDoSetor,
    onFecharSetorSelecionado,
}) {
    const { t } = useTranslation('dashboard');

    const alturas = {
        padrao: 'h-[460px] sm:h-[550px] xl:h-[585px]',
        grande: 'h-[500px] sm:h-[610px] xl:h-[690px]',
        compacto: 'h-[420px] sm:h-[470px] xl:h-[520px]',
        // Não usado diretamente quando preencherAltura está ativo (ver
        // abaixo) — mantido só para o resto da app, onde este tier
        // ainda serve de altura fixa normal.
        miniatura: 'h-[210px] sm:h-[240px] xl:h-[260px]',
    };

    // Só na miniatura "de lista" (não usada atualmente nas
    // Estatísticas, que já passou a ocupar uma linha própria e
    // proeminente) — rótulos de setor e legenda mais discretos.
    const compacto = tamanho === 'miniatura';

    // "Mapa de Ocupação" nas Estatísticas: o mapa deve ser um elemento
    // de destaque, não uma miniatura — h-full acompanha a altura que o
    // grid (items-stretch) já decidiu para a linha, e este min-height
    // generoso garante que é o PRÓPRIO mapa a estabelecer essa altura
    // (o card vizinho, mais simples, é que se estica para o acompanhar
    // — ver content-center no DonutCard), em vez do inverso.
    const alturaClasse = preencherAltura
        ? 'h-full min-h-[420px] sm:min-h-[480px] xl:min-h-[560px]'
        : (alturas[tamanho] ?? alturas.padrao);

    return (
        <div
            className={`min-w-0 rounded-[20px] bg-[#edf3f8] p-2.5 shadow-[inset_0_1px_3px_rgba(15,42,67,0.06)] dark:bg-[#0c1f33] dark:p-0 ${alturaClasse}`}
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
                        alt={t('officeMap.plantaAlt', { piso: pisoAtual.nome })}
                        draggable={false}
                        className={`pointer-events-none absolute inset-0 h-full w-full saturate-[1.04] contrast-[1.02] ${
                            ajustarProporcao ? 'object-contain' : 'object-fill'
                        }`}
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
                            compacto={compacto}
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
                            ? t('officeMap.escolhaSecretaria', { setor: setorSelecionado.nome })
                            : t('officeMap.cliqueSetor')}
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
                        <MapLegend compacto={compacto} />
                    </div>
                )}
            </div>
        </div>
    );
}
