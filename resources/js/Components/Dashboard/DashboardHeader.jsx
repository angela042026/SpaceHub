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

function construirNotificacoesUtilizador(reservaHojeUtilizador, proximasReservas, agora) {
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
        } else {
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
    const { auth, reservaHojeUtilizador, proximasReservas, stats, notificacoesReais } = usePage().props;
    const { theme, toggleTheme } = useTheme();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [agora, setAgora] = useState(() => new Date());
    const [idsVistos, setIdsVistos] = useState(() => carregarIdsVistos());
    const [notificacoesReaisEstado, setNotificacoesReaisEstado] = useState(notificacoesReais ?? []);

    useEffect(() => {
        setNotificacoesReaisEstado(notificacoesReais ?? []);
    }, [notificacoesReais]);

    useEffect(() => {
        const intervalo = setInterval(() => setAgora(new Date()), 30000);

        return () => clearInterval(intervalo);
    }, []);

    const user = auth?.user;
    const displayName = getFirstAndLastName(user?.name);
    const saudacao = saudacaoPorHora(agora);
    const papel = user?.role?.nome;

    let notificacoesSinteticas = [];

    if (papel === 'Utilizador') {
        notificacoesSinteticas = construirNotificacoesUtilizador(reservaHojeUtilizador, proximasReservas, agora);
    } else if (papel === 'Administrador' || papel === 'Gestor') {
        notificacoesSinteticas = construirNotificacoesAdmin(stats);
    } else if (papel === 'Colaborador') {
        notificacoesSinteticas = construirNotificacoesColaborador(stats);
    }

    // Notificações reais (guardadas na base de dados, ex: resposta de suporte)
    // vêm primeiro — persistem entre sessões e não dependem do localStorage.
    const notificacoesReaisMapeadas = notificacoesReaisEstado.map((notificacao) => ({
        id: `real-${notificacao.id}`,
        realId: notificacao.id,
        icon: ICONE_POR_TIPO[notificacao.tipo] ?? Bell,
        titulo: notificacao.titulo,
        mensagem: notificacao.mensagem,
        lida: notificacao.lida,
    }));

    const notificacoes = [...notificacoesReaisMapeadas, ...notificacoesSinteticas];

    const naoVistas = notificacoes.filter((notificacao) =>
        'lida' in notificacao ? !notificacao.lida : !idsVistos.includes(notificacao.id),
    );

    const themeButtonClass =
        theme === 'dark'
            ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20'
            : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-white';

    const notificationButtonClass = notificationsOpen
        ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20'
        : 'border-slate-200 bg-card text-navy-900 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-white';

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
                setNotificacoesReaisEstado((atual) =>
                    atual.map((notificacao) => ({ ...notificacao, lida: true })),
                );

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
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-card text-navy-900 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500 hover:text-teal-500 hover:shadow-card-hover dark:border-slate-700 dark:text-white lg:hidden"
                >
                    <Menu size={22} strokeWidth={1.8} />
                </button>

                <div>
                    <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 dark:text-white">
                        {saudacao}, {displayName}
                    </h1>

                    <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                        Bem-vindo ao seu Dashboard.
                    </p>
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3">
                <div className="hidden h-12 items-center gap-3 rounded-xl border border-slate-200 bg-card px-4 shadow-card dark:border-slate-700 sm:flex">
                    <Clock size={18} strokeWidth={1.9} className="text-teal-500" />

                    <div className="leading-tight">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {agora.toLocaleTimeString('pt-PT', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>

                        <p className="text-[11px] capitalize text-slate-400">
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
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                </button>

                {notificationsOpen && (
                    <div className="absolute right-0 top-16 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white">
                                Notificações
                            </h2>

                            {notificacoes.length > 0 && (
                                <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600">
                                    {notificacoes.length} nova{notificacoes.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {notificacoes.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {notificacoes.map((notificacao) => (
                                    <div
                                        key={notificacao.id}
                                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                                    >
                                        <notificacao.icon
                                            size={18}
                                            strokeWidth={1.9}
                                            className="mt-0.5 shrink-0 text-teal-500"
                                        />

                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {notificacao.titulo}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {notificacao.mensagem}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                Sem notificações no momento.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
