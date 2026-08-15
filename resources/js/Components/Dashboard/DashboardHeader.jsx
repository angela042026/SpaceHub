import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    Bell,
    CalendarCheck2,
    CheckCircle2,
    Clock,
    Clock3,
    LifeBuoy,
    Menu,
    Moon,
    Star,
    Sun,
    TimerOff,
    Users,
    XCircle,
} from 'lucide-react';

import useTheme from '@/Hooks/useTheme';

// Ícone por tipo de notificação real (guardada na base de dados).
const ICONE_POR_TIPO = {
    suporte_respondido: LifeBuoy,
    reserva_criada: CalendarCheck2,
    reserva_cancelada: XCircle,
    reserva_expirada: TimerOff,
    avaliacao_aprovada: Star,
    avaliacao_rejeitada: XCircle,
};

function getFirstAndLastName(name) {
    if (!name) {
        return 'Utilizador';
    }

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
        return parts[0];
    }

    return `${parts[0]} ${parts[parts.length - 1]}`;
}

function saudacaoPorHora(agora) {
    const hora = agora.getHours();

    if (hora >= 5 && hora < 12) {
        return 'Bom dia';
    }

    if (hora >= 12 && hora < 18) {
        return 'Boa tarde';
    }

    return 'Boa noite';
}

const NOTIFICACOES_VISTAS_KEY = 'spacehub-notificacoes-vistas';
const MAX_IDS_GUARDADOS = 100;

function hojeString() {
    return new Date().toISOString().slice(0, 10);
}

function carregarIdsVistos() {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const guardados = window.localStorage.getItem(NOTIFICACOES_VISTAS_KEY);

        return guardados ? JSON.parse(guardados) : [];
    } catch {
        return [];
    }
}

function guardarIdsVistos(ids) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(
        NOTIFICACOES_VISTAS_KEY,
        JSON.stringify(ids.slice(-MAX_IDS_GUARDADOS)),
    );
}

function minutosAte(data, hora, agora) {
    if (!data || !hora) {
        return null;
    }

    const dataSomente = data.slice(0, 10);
    const alvo = new Date(`${dataSomente}T${hora}:00`);

    return (alvo.getTime() - agora.getTime()) / 60000;
}

function construirNotificacoesAdmin(stats) {
    if (!stats) {
        return [];
    }

    const notificacoes = [];
    const hoje = hojeString();

    if (stats.cancelamentosHoje?.value > 0) {
        notificacoes.push({
            id: `cancelamentos-hoje-${hoje}-${stats.cancelamentosHoje.value}`,
            icon: XCircle,
            titulo: 'Cancelamentos hoje',
            mensagem: `${stats.cancelamentosHoje.value} reserva(s) foram canceladas hoje.`,
        });
    }

    if (stats.reservasExpiradasHoje?.value > 0) {
        notificacoes.push({
            id: `reservas-expiradas-hoje-${hoje}-${stats.reservasExpiradasHoje.value}`,
            icon: TimerOff,
            titulo: 'Reservas expiradas',
            mensagem: `${stats.reservasExpiradasHoje.value} reserva(s) expiraram hoje sem check-in.`,
        });
    }

    if (stats.taxaOcupacao?.value >= 90) {
        notificacoes.push({
            id: `ocupacao-alta-${hoje}-${stats.taxaOcupacao.value}`,
            icon: AlertTriangle,
            titulo: 'Ocupação quase no limite',
            mensagem: `A taxa de ocupação está em ${stats.taxaOcupacao.value}%.`,
        });
    }

    return notificacoes;
}

function construirNotificacoesColaborador(stats) {
    if (!stats) {
        return [];
    }

    const secretariasOcupadas = stats.totalSecretarias - (stats.mesasLivres?.value ?? 0);

    if (secretariasOcupadas > 0) {
        return [{
            id: `secretarias-ocupadas-${hojeString()}-${secretariasOcupadas}`,
            icon: Users,
            titulo: 'Secretárias em uso',
            mensagem: `${secretariasOcupadas} secretária(s) ocupada(s) agora — vale a pena verificar a limpeza depois do uso.`,
        }];
    }

    return [];
}

// Mesma janela [início, início + tolerância] usada pelo ReservationCard
// para decidir se o botão de check-in está ativo — sem isto, a
// notificação podia dizer "check-in disponível" numa reserva ainda
// pendente de pagamento ou já fora do prazo.
function dentroDaJanelaCheckin(reserva, toleranciaMinutos, agora) {
    const horaInicio = reserva?.periodo?.hora_inicio;

    if (!reserva?.data || !horaInicio || !toleranciaMinutos) {
        return false;
    }

    const inicio = new Date(
        `${reserva.data}T${horaInicio.slice(0, 5)}:00`,
    );

    if (Number.isNaN(inicio.getTime())) {
        return false;
    }

    const limite = new Date(
        inicio.getTime() + toleranciaMinutos * 60000,
    );

    return agora >= inicio && agora < limite;
}

function construirNotificacoesUtilizador(
    reservaHojeUtilizador,
    proximasReservas,
    agora,
    toleranciaCheckinMinutos,
) {
    if (reservaHojeUtilizador) {
        const codigo = reservaHojeUtilizador.secretaria?.codigo ?? 'a tua secretária';
        const notificacoes = [];

        const minutosParaFim = minutosAte(
            reservaHojeUtilizador.data,
            reservaHojeUtilizador.periodo?.hora_fim,
            agora,
        );

        const minutosParaInicio = minutosAte(
            reservaHojeUtilizador.data,
            reservaHojeUtilizador.periodo?.hora_inicio,
            agora,
        );

        if (minutosParaFim !== null && minutosParaFim > 0 && minutosParaFim <= 5) {
            notificacoes.push({
                id: `reserva-termina-${reservaHojeUtilizador.id}`,
                icon: Clock3,
                titulo: 'A tua reserva está a terminar',
                mensagem: `A reserva na secretária ${codigo} termina às ${reservaHojeUtilizador.periodo.hora_fim}.`,
            });
        } else if (minutosParaInicio !== null && minutosParaInicio > 0 && minutosParaInicio <= 5) {
            notificacoes.push({
                id: `reserva-comeca-${reservaHojeUtilizador.id}`,
                icon: Clock3,
                titulo: 'A tua reserva começa em breve',
                mensagem: `A reserva na secretária ${codigo} começa às ${reservaHojeUtilizador.periodo.hora_inicio}.`,
            });
        }

        if (reservaHojeUtilizador.check_in_at) {
            notificacoes.push({
                id: `checkin-confirmado-${reservaHojeUtilizador.id}`,
                icon: CheckCircle2,
                titulo: 'Check-in confirmado',
                mensagem: `Já fizeste check-in na secretária ${codigo} para hoje.`,
            });
        } else if (
            reservaHojeUtilizador.estado_reserva?.codigo ===
                'confirmada' &&
            dentroDaJanelaCheckin(
                reservaHojeUtilizador,
                toleranciaCheckinMinutos,
                agora,
            )
        ) {
            notificacoes.push({
                id: `checkin-disponivel-${reservaHojeUtilizador.id}`,
                icon: CalendarCheck2,
                titulo: 'Check-in disponível',
                mensagem: `Tens uma reserva hoje na secretária ${codigo}. Não te esqueças do check-in!`,
            });
        }

        return notificacoes;
    }

    if (proximasReservas?.length > 0) {
        const proxima = proximasReservas[0];
        const codigo = proxima.secretaria?.codigo ?? 'uma secretária';

        return [{
            id: `proxima-reserva-${proxima.id}`,
            icon: CalendarCheck2,
            titulo: 'Próxima reserva',
            mensagem: `Tens uma reserva agendada na secretária ${codigo}.`,
        }];
    }

    return [];
}

export default function DashboardHeader({ onOpenNav = () => {} }) {
    const {
        auth,
        reservaHojeUtilizador,
        proximasReservas,
        stats,
        notificacoesReais,
        toleranciaCheckinMinutos,
    } = usePage().props;
    const { theme, toggleTheme } = useTheme();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [agora, setAgora] = useState(() => new Date());
    const [idsVistos, setIdsVistos] = useState(() => carregarIdsVistos());

    // Ids de notificações reais marcadas como lidas otimisticamente no
    // clique, antes da resposta do servidor. Ao contrário de duplicar a
    // lista inteira em state (versão anterior), só guarda os ids — o
    // conteúdo (título/mensagem) vem sempre diretamente da prop
    // `notificacoesReais`, sem precisar de um useEffect para ressincronizar.
    const [idsLidosOtimista, setIdsLidosOtimista] = useState(() => new Set());

    useEffect(() => {
        const intervalo = setInterval(() => setAgora(new Date()), 30000);

        return () => clearInterval(intervalo);
    }, []);

    const user = auth?.user;
    const displayName = getFirstAndLastName(user?.name);
    const saudacao = saudacaoPorHora(agora);
    const papel = user?.role?.nome;

    // Mesma lógica de "resto" que o DashboardController usa para
    // decidir qual página renderizar (Admin/Funcionario vs
    // Utilizador) — comparar só com "papel === 'Utilizador'" falhava
    // sempre que o nome da role não batesse certo character a
    // character, mesmo sendo a mesma pessoa a ver o dashboard do
    // Utilizador.jsx.
    const ehDashboardUtilizador = ![
        'Administrador',
        'Gestor',
        'Colaborador',
    ].includes(papel);

    // Só o dashboard do "Utilizador" tem cartão de reserva de hoje —
    // nas outras roles mantém-se a frase genérica de sempre, exceto em
    // páginas administrativas específicas que já têm um subtítulo mais
    // adequado ao que se está a fazer ali.
    let subtituloHeader = 'Bem-vindo ao seu Dashboard.';

    if (route().current('admin.reservas.index')) {
        subtituloHeader = 'Consulte e faça a gestão de todas as reservas do SpaceHub.';
    } else if (route().current('secretarias.qrcodes')) {
        // Mensagem genérica de propósito — a descrição específica sobre
        // imprimir/transferir QR Codes já está no cabeçalho interno do
        // card desta página, e repeti-la aqui era redundante.
        subtituloHeader = 'Faça a gestão dos espaços e recursos do SpaceHub.';
    } else if (route().current('setores.mapa.edit')) {
        subtituloHeader = 'Organize a localização dos espaços no mapa.';
    } else if (route().current('admin.atividade.index')) {
        subtituloHeader = 'Acompanhe as ações realizadas no SpaceHub.';
    } else if (ehDashboardUtilizador) {
        if (!reservaHojeUtilizador) {
            subtituloHeader =
                'Encontre o espaço certo para cada momento.';
        } else if (reservaHojeUtilizador.check_in_at) {
            subtituloHeader =
                'A sua secretária está pronta. Bom trabalho!';
        } else {
            subtituloHeader =
                'A sua secretária está pronta. Faça o check-in quando chegar.';
        }
    }

    let notificacoesSinteticas = [];

    if (papel === 'Administrador' || papel === 'Gestor') {
        notificacoesSinteticas = construirNotificacoesAdmin(stats);
    } else if (papel === 'Colaborador') {
        notificacoesSinteticas = construirNotificacoesColaborador(stats);
    } else if (ehDashboardUtilizador) {
        notificacoesSinteticas = construirNotificacoesUtilizador(
            reservaHojeUtilizador,
            proximasReservas,
            agora,
            toleranciaCheckinMinutos,
        );
    }

    // Notificações reais (guardadas na base de dados, ex: resposta de suporte)
    // vêm primeiro — persistem entre sessões e não dependem do localStorage.
    const notificacoesReaisMapeadas = (notificacoesReais ?? []).map((notificacao) => ({
        id: `real-${notificacao.id}`,
        realId: notificacao.id,
        icon: ICONE_POR_TIPO[notificacao.tipo] ?? Bell,
        titulo: notificacao.titulo,
        mensagem: notificacao.mensagem,
        lida: notificacao.lida || idsLidosOtimista.has(notificacao.id),
    }));

    const notificacoes = [...notificacoesReaisMapeadas, ...notificacoesSinteticas];

    const naoVistas = notificacoes.filter((notificacao) =>
        'lida' in notificacao ? !notificacao.lida : !idsVistos.includes(notificacao.id),
    );

    const themeButtonClass =
        theme === 'dark'
            ? 'border-[#18c3b3] bg-[#18c3b3] text-white shadow-lg shadow-[#18c3b3]/20'
            : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-[#2a5069] dark:text-[#f8fafc]';

    const notificationButtonClass = notificationsOpen
        ? 'border-[#18c3b3] bg-[#18c3b3] text-white shadow-lg shadow-[#18c3b3]/20'
        : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-[#2a5069] dark:text-[#f8fafc]';

    function handleNotifications() {
        setNotificationsOpen((currentValue) => {
            const abrindo = !currentValue;

            if (abrindo && notificacoesSinteticas.length > 0) {
                const novosIdsVistos = Array.from(
                    new Set([...idsVistos, ...notificacoesSinteticas.map((notificacao) => notificacao.id)]),
                );

                setIdsVistos(novosIdsVistos);
                guardarIdsVistos(novosIdsVistos);
            }

            if (abrindo && notificacoesReaisMapeadas.some((notificacao) => !notificacao.lida)) {
                setIdsLidosOtimista((atual) => {
                    const novo = new Set(atual);

                    (notificacoesReais ?? []).forEach((notificacao) =>
                        novo.add(notificacao.id),
                    );

                    return novo;
                });

                axios.post(route('notificacoes.marcarLidas'));
            }

            return abrindo;
        });
    }

    return (
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-5">
                <button
                    type="button"
                    onClick={onOpenNav}
                    aria-label="Abrir menu lateral"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-card text-navy-900 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-500 hover:shadow-card-hover dark:border-[#2a5069] dark:text-[#f8fafc] lg:hidden"
                >
                    <Menu size={22} strokeWidth={1.8} />
                </button>

                <div>
                    <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 dark:text-[#f8fafc]">
                        {saudacao}, {displayName}
                    </h1>

                    <p className="mt-2 text-base text-slate-500 dark:text-[#b5c5d5]">
                        {subtituloHeader}
                    </p>
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3">
                <div className="hidden h-12 items-center gap-3 rounded-xl border border-slate-200 bg-card px-4 shadow-card dark:border-[#2a5069] sm:flex">
                    <Clock size={18} strokeWidth={1.9} className="text-teal-500 dark:text-[#18c3b3]" />

                    <div className="leading-tight">
                        <p className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">
                            {agora.toLocaleTimeString('pt-PT', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>

                        <p className="text-[11px] capitalize text-slate-400 dark:text-[#8fa7bd]">
                            {agora.toLocaleDateString('pt-PT', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                            })}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={toggleTheme}
                    title={
                        theme === 'dark'
                            ? 'Ativar modo claro'
                            : 'Ativar modo escuro'
                    }
                    aria-label={
                        theme === 'dark'
                            ? 'Ativar modo claro'
                            : 'Ativar modo escuro'
                    }
                    aria-pressed={theme === 'dark'}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${themeButtonClass}`}
                >
                    {theme === 'dark' ? (
                        <Sun size={20} strokeWidth={2} />
                    ) : (
                        <Moon size={20} strokeWidth={2} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleNotifications}
                    aria-label="Ver notificações"
                    aria-expanded={notificationsOpen}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-xl border shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${notificationButtonClass}`}
                >
                    <Bell size={20} strokeWidth={2} />

                    {!notificationsOpen && naoVistas.length > 0 && (
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:bg-[#ff4d6d] dark:ring-[#163a56]" />
                    )}
                </button>

                {notificationsOpen && (
                    <div className="absolute right-0 top-16 z-50 w-[calc(100vw-2.5rem)] max-w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-[#2a5069] dark:bg-[#101f34]">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-[#f8fafc]">
                                Notificações
                            </h2>

                            {notificacoes.length > 0 && (
                                <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                                    {notificacoes.length} nova{notificacoes.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {notificacoes.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {notificacoes.map((notificacao) => (
                                    <div
                                        key={notificacao.id}
                                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-[#183f5d]"
                                    >
                                        <notificacao.icon
                                            size={18}
                                            strokeWidth={1.9}
                                            className="mt-0.5 shrink-0 text-teal-500 dark:text-[#18c3b3]"
                                        />

                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-[#f8fafc]">
                                                {notificacao.titulo}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-[#b5c5d5]">
                                                {notificacao.mensagem}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-500 dark:text-[#8fa7bd]">
                                Sem notificações no momento.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
