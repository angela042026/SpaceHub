import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';
import ReservationCard from '@/Components/Dashboard/ReservationCard';
import AvailabilityOverview from '@/Components/Dashboard/AvailabilityOverview';
import AcoesRapidas from '@/Components/Dashboard/AcoesRapidas';
import WeeklySchedule from '@/Components/Dashboard/WeeklySchedule';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';
import AtividadePessoal from '@/Components/Dashboard/AtividadePessoal';
import { estadoNormalizado } from '@/Components/Dashboard/OfficeMap/mapUtils';

export default function Utilizador({
    pisos,
    edificios,
    reservaHojeUtilizador,
    proximasReservas,
    toleranciaCheckinMinutos,
    atividadePessoal,
}) {
    const { t } = useTranslation('dashboard');

    // Todas as secretárias de todos os pisos, cada uma já com o seu
    // piso e setor "pendurados" — para calcular livres por piso e
    // encontrar a secretária completa por trás da reserva de hoje, sem
    // precisar de outro pedido ao servidor.
    const todasSecretarias = useMemo(
        () =>
            (pisos ?? []).flatMap((piso) =>
                (piso.setores ?? []).flatMap((setor) =>
                    (setor.secretarias ?? []).map(
                        (secretaria) => ({
                            ...secretaria,
                            setor,
                            piso,
                        }),
                    ),
                ),
            ),
        [pisos],
    );

    const secretariaReservaHoje = useMemo(() => {
        if (!reservaHojeUtilizador?.secretaria?.id) {
            return null;
        }

        return (
            todasSecretarias.find(
                (secretaria) =>
                    secretaria.id ===
                    reservaHojeUtilizador.secretaria.id,
            ) ?? null
        );
    }, [todasSecretarias, reservaHojeUtilizador]);

    const [selectedFloor, setSelectedFloor] = useState(
        secretariaReservaHoje?.piso?.codigo ??
            pisos?.[0]?.codigo ??
            '',
    );
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    // Secretária "em foco" pedida de fora do mapa (reserva de hoje ao
    // abrir a página, ou clique na sugestão) — o OfficeMap seleciona-a
    // sozinho assim que ela existir no piso atualmente selecionado, tal
    // como o painel do Administrador.
    const [secretariaFocoId, setSecretariaFocoId] = useState(
        secretariaReservaHoje?.id ?? null,
    );

    // Espelha a seleção real do mapa — só usado para decidir o
    // título/subtítulo do cabeçalho do mapa (o painel de detalhe já é o
    // mesmo DeskDetailPanel que o Administrador usa).
    const [secretariaSelecionada, setSecretariaSelecionada] = useState(null);

    const overviewPorPiso = useMemo(
        () =>
            (pisos ?? [])
                .map((piso) => {
                    const secretariasDoPiso = (
                        piso.setores ?? []
                    ).flatMap(
                        (setor) => setor.secretarias ?? [],
                    );

                    const livres = secretariasDoPiso.filter(
                        (secretaria) =>
                            estadoNormalizado(
                                secretaria.status,
                            ) === 'livre',
                    ).length;

                    return {
                        codigo: piso.codigo,
                        nome: piso.nome,
                        livres,
                        total: secretariasDoPiso.length,
                    };
                })
                .filter((piso) => piso.total > 0),
        [pisos],
    );

    const totalLivres = useMemo(
        () =>
            overviewPorPiso.reduce(
                (soma, piso) => soma + piso.livres,
                0,
            ),
        [overviewPorPiso],
    );

    // Sugestão simples e determinística: a primeira secretária livre
    // encontrada — não há (ainda) histórico de preferências do
    // utilizador para basear uma sugestão mais inteligente.
    const sugestao = useMemo(
        () =>
            todasSecretarias.find(
                (secretaria) =>
                    estadoNormalizado(secretaria.status) ===
                    'livre',
            ) ?? null,
        [todasSecretarias],
    );

    // Clicar na sugestão dentro do card "Ainda não tem reserva" não
    // navega logo para a reserva — foca a secretária no mapa (mudando
    // de piso se preciso) e deixa o painel do mapa mostrar os detalhes
    // reais, tal como um clique direto num pino.
    function focarSecretaria(secretaria) {
        if (!secretaria) {
            return;
        }

        if (
            secretaria.piso?.codigo &&
            secretaria.piso.codigo !== selectedFloor
        ) {
            setSelectedFloor(secretaria.piso.codigo);
        }
        setSecretariaFocoId(secretaria.id);
    }

    const deskEhReservaHoje =
        Boolean(secretariaSelecionada) &&
        Boolean(secretariaReservaHoje) &&
        secretariaSelecionada.id === secretariaReservaHoje.id;

    return (
        <>
            <Head title={t('titulo')} />

            <DashboardLayout>
                <div className="mx-auto w-full max-w-[1560px]">
                    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
                        <ReservationCard
                            reserva={reservaHojeUtilizador}
                            totalLivres={totalLivres}
                            sugestao={sugestao}
                            toleranciaCheckinMinutos={
                                toleranciaCheckinMinutos
                            }
                            onSelecionarSugestao={focarSecretaria}
                        />

                        <AvailabilityOverview
                            overviewPorPiso={overviewPorPiso}
                            totalLivres={totalLivres}
                        />

                        <AcoesRapidas
                            temReservaHojeConfirmada={
                                reservaHojeUtilizador
                                    ?.estado_reserva
                                    ?.codigo ===
                                'confirmada'
                            }
                        />
                    </section>

                    {/* Mapa interativo — mesmo layout e painel lateral do
                        Administrador (map + DeskDetailPanel), só com o
                        cabeçalho premium (título/subtítulo/"Abrir mapa
                        completo") que o Administrador não tem. */}
                    <section className="mt-6 min-w-0">
                        <OfficeMap
                            selectedFloor={selectedFloor}
                            setSelectedFloor={setSelectedFloor}
                            selectedEdificio={selectedEdificio}
                            setSelectedEdificio={setSelectedEdificio}
                            edificios={edificios}
                            pisos={pisos}
                            titulo={
                                deskEhReservaHoje
                                    ? t('utilizador.mapaTituloReservaHoje')
                                    : t('utilizador.mapaTituloEscolher')
                            }
                            subtitulo={
                                deskEhReservaHoje
                                    ? t('utilizador.mapaSubtituloReservaHoje', {
                                          codigo: secretariaSelecionada.codigo,
                                          piso: secretariaSelecionada.piso?.nome,
                                      })
                                    : t('utilizador.mapaSubtituloEscolher')
                            }
                            linkMapaCompleto
                            secretariaFocoId={secretariaFocoId}
                            onSecretariaSelecionada={
                                setSecretariaSelecionada
                            }
                        />
                    </section>

                    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <WeeklySchedule
                            reservaHojeUtilizador={reservaHojeUtilizador}
                            proximasReservas={proximasReservas}
                        />

                        <UpcomingReservations
                            reservas={proximasReservas}
                            compact
                        />

                        <AtividadePessoal atividade={atividadePessoal} />
                    </section>
                </div>
            </DashboardLayout>
        </>
    );
}
