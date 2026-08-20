import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CreditCard,
    History,
    QrCode,
    CalendarDays,
    Map,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Tons muito suaves da mesma paleta (turquesa / azul suave / turquesa
// azulado / azul-marinho claro) — nunca cores novas, só variação de
// intensidade para dar identidade a cada quadrado de ícone.
const TONS_ICONE = [
    'bg-teal-500/10 text-teal-700 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]',
    'bg-[#4f8fea]/10 text-[#3568b8] dark:bg-[#4f8fea]/15 dark:text-[#8fb4f2]',
    'bg-[#22c7be]/10 text-[#0f8f88] dark:bg-[#22c7be]/15 dark:text-[#22c7be]',
    'bg-[#1e3a5f]/[0.06] text-navy-900 dark:bg-white/10 dark:text-[#d7e3ed]',
];

export default function AcoesRapidas({
    temReservaHojeConfirmada = false,
}) {
    const { t } = useTranslation('dashboard');

    const ACOES_SEM_RESERVA = [
        { icon: CalendarDays, label: t('acoesRapidas.reservas.label'), labelCompleto: t('acoesRapidas.reservas.completo'), route: 'reservas.index' },
        {
            icon: QrCode,
            label: t('acoesRapidas.checkin.label'),
            labelCompleto: t('acoesRapidas.checkin.completo'),
            route: 'checkin.camera',
            disabled: true,
            motivoDesativado: t('acoesRapidas.motivoDesativadoCheckin'),
        },
        { icon: CreditCard, label: t('acoesRapidas.pagamentos.label'), labelCompleto: t('acoesRapidas.pagamentos.completo'), route: 'pagamentos.index' },
        { icon: History, label: t('acoesRapidas.historico.label'), labelCompleto: t('acoesRapidas.historico.completo'), route: 'reservas.history' },
    ];

    const ACOES_COM_RESERVA = [
        { icon: QrCode, label: t('acoesRapidas.mostrarQr.label'), labelCompleto: t('acoesRapidas.mostrarQr.completo'), route: 'checkin.camera' },
        { icon: Map, label: t('acoesRapidas.trajeto.label'), labelCompleto: t('acoesRapidas.trajeto.completo'), route: 'mapa.index' },
        { icon: CalendarDays, label: t('acoesRapidas.reservas.label'), labelCompleto: t('acoesRapidas.reservas.completo'), route: 'reservas.index' },
        { icon: History, label: t('acoesRapidas.historico.label'), labelCompleto: t('acoesRapidas.historico.completo'), route: 'reservas.history' },
    ];

    const acoes = temReservaHojeConfirmada
        ? ACOES_COM_RESERVA
        : ACOES_SEM_RESERVA;

    return (
        <section className="dashboard-card flex h-full flex-col justify-center p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                {t('acoesRapidas.titulo')}
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
                {acoes.map((acao, indice) =>
                    acao.disabled ? (
                        <div
                            key={acao.label}
                            title={acao.motivoDesativado}
                            aria-disabled="true"
                            className="flex cursor-not-allowed flex-col items-center justify-center gap-2 rounded-[14px] border border-[#e7eef5] bg-[#fbfdfe] px-3 py-3.5 text-center opacity-45 dark:border-[#2a5069]/60 dark:bg-[#101f34]"
                        >
                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${TONS_ICONE[indice % TONS_ICONE.length]}`}
                            >
                                <acao.icon size={17} strokeWidth={1.9} />
                            </span>

                            <span className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-[#d7e3ed]">
                                {acao.label}
                            </span>
                        </div>
                    ) : (
                        <Link
                            key={acao.label}
                            href={route(acao.route)}
                            title={acao.labelCompleto}
                            aria-label={acao.labelCompleto}
                            className="group relative flex flex-col items-center justify-center gap-2 rounded-[14px] border border-[#e7eef5] bg-[#fbfdfe] px-3 py-3.5 text-center outline-none transition duration-200 hover:-translate-y-0.5 hover:border-teal-400/60 hover:shadow-[0_8px_18px_rgba(15,42,67,0.08)] focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:border-[#2a5069]/60 dark:bg-[#101f34] dark:focus-visible:ring-[#18c3b3]/40"
                        >
                            <ArrowUpRight
                                size={13}
                                strokeWidth={2.4}
                                className="absolute right-2 top-2 text-slate-300 opacity-0 transition-opacity duration-200 group-hover:opacity-70 dark:text-[#8fa7bd]"
                            />

                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors duration-200 group-hover:bg-teal-500/20 group-hover:text-teal-700 dark:group-hover:bg-[#18c3b3]/25 dark:group-hover:text-[#18c3b3] ${TONS_ICONE[indice % TONS_ICONE.length]}`}
                            >
                                <acao.icon size={17} strokeWidth={1.9} />
                            </span>

                            <span className="text-[13px] font-semibold leading-tight text-slate-700 dark:text-[#d7e3ed]">
                                {acao.label}
                            </span>
                        </Link>
                    ),
                )}
            </div>
        </section>
    );
}
