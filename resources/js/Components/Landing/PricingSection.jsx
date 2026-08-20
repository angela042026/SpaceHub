import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    CalendarCheck,
    CalendarDays,
    Check,
    Clock3,
    Search,
    Sparkles,
    UserPlus,
} from 'lucide-react';

export default function PricingSection() {
    const { t } = useTranslation('landing');
    const { auth } = usePage().props;

    const periods = [
        { id: 'daily', label: t('pricing.periodos.daily') },
        { id: 'weekly', label: t('pricing.periodos.weekly') },
        { id: 'monthly', label: t('pricing.periodos.monthly') },
        { id: 'annual', label: t('pricing.periodos.annual') },
    ];

    const dailyPeriods = [
        {
            id: 'morning',
            label: t('pricing.periodosDiarios.morning.label'),
            schedule: t('pricing.periodosDiarios.morning.horario'),
        },
        {
            id: 'afternoon',
            label: t('pricing.periodosDiarios.afternoon.label'),
            schedule: t('pricing.periodosDiarios.afternoon.horario'),
        },
        {
            id: 'fullDay',
            label: t('pricing.periodosDiarios.fullDay.label'),
            schedule: t('pricing.periodosDiarios.fullDay.horario'),
        },
    ];

    const pricing = {
        daily: {
            morning: {
                price: '5',
                suffix: t('pricing.planos.dailyMorning.sufixo'),
                title: t('pricing.planos.dailyMorning.titulo'),
                description: t('pricing.planos.dailyMorning.descricao'),
            },
            afternoon: {
                price: '5',
                suffix: t('pricing.planos.dailyAfternoon.sufixo'),
                title: t('pricing.planos.dailyAfternoon.titulo'),
                description: t('pricing.planos.dailyAfternoon.descricao'),
            },
            fullDay: {
                price: '9',
                suffix: t('pricing.planos.dailyFullDay.sufixo'),
                title: t('pricing.planos.dailyFullDay.titulo'),
                description: t('pricing.planos.dailyFullDay.descricao'),
            },
        },
        weekly: {
            price: '45',
            suffix: t('pricing.planos.weekly.sufixo'),
            title: t('pricing.planos.weekly.titulo'),
            description: t('pricing.planos.weekly.descricao'),
        },
        monthly: {
            price: '179',
            suffix: t('pricing.planos.monthly.sufixo'),
            title: t('pricing.planos.monthly.titulo'),
            description: t('pricing.planos.monthly.descricao'),
        },
        annual: {
            price: '1 899',
            suffix: t('pricing.planos.annual.sufixo'),
            title: t('pricing.planos.annual.titulo'),
            description: t('pricing.planos.annual.descricao'),
        },
    };

    const benefits = t('pricing.beneficios', { returnObjects: true });

    const [selectedPeriod, setSelectedPeriod] = useState('daily');

    const [selectedDailyPeriod, setSelectedDailyPeriod] =
        useState('fullDay');

    const selectedPlan =
        selectedPeriod === 'daily'
            ? pricing.daily[selectedDailyPeriod]
            : pricing[selectedPeriod];

    const selectedDailySchedule = dailyPeriods.find(
        (period) => period.id === selectedDailyPeriod,
    );

    return (
        <section
            id="precos"
            className="relative scroll-mt-[74px] overflow-hidden bg-[#F8FAFC] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
            <div className="mx-auto max-w-[1250px]">
                {/* Cabeçalho */}
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                        {t('pricing.eyebrow')}
                    </span>

                    <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.04em] text-[#071A33] sm:text-4xl lg:text-[46px]">
                        {t('pricing.tituloPrefixo')}{' '}
                        <span className="text-[#14B8A6]">{t('pricing.tituloDestaque')}</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                        {t('pricing.descricao')}
                    </p>
                </div>

                {/* Seletor principal */}
                <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    {periods.map((period) => {
                        const isActive = selectedPeriod === period.id;

                        return (
                            <button
                                key={period.id}
                                type="button"
                                onClick={() =>
                                    setSelectedPeriod(period.id)
                                }
                                className={`min-w-[80px] flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 sm:min-w-[105px] ${isActive
                                    ? 'bg-[#071A33] text-white shadow-md'
                                    : 'text-slate-500 hover:bg-[#F1F5F9] hover:text-[#071A33]'
                                    }`}
                            >
                                {period.label}
                            </button>
                        );
                    })}
                </div>

                {/* Opções do passe diário */}
                {selectedPeriod === 'daily' && (
                    <div className="mx-auto mt-5 grid max-w-md gap-2 sm:grid-cols-3">
                        {dailyPeriods.map((period) => {
                            const isActive = selectedDailyPeriod === period.id;

                            return (
                                <button
                                    key={period.id}
                                    type="button"
                                    onClick={() => setSelectedDailyPeriod(period.id)}
                                    className={`rounded-xl border px-4 py-2.5 text-left transition-all duration-300 ${isActive
                                        ? 'border-[#14B8A6] bg-[#EAFBF8] text-[#071A33] shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-[#14B8A6]/50'
                                        }`}
                                >
                                    <span className="block text-sm font-bold">
                                        {period.label}
                                    </span>

                                    <span className="mt-0.5 block text-[11px] font-medium">
                                        {period.schedule}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Card do plano */}
                <div className="mx-auto mt-7 max-w-[1000px] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                        {/* Preço */}
                        <div className="relative flex flex-col justify-center bg-[#071A33] px-5 py-10 text-white sm:px-10 lg:px-11 lg:py-12">
                            <div className="absolute left-0 top-10 h-16 w-1 rounded-r-full bg-[#14B8A6]" />

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5EEAD4]">
                                <Sparkles size={14} />
                                {t('pricing.planoSelecionado')}
                            </div>

                            <h3 className="mt-6 text-2xl font-black leading-tight tracking-tight sm:text-[28px]">
                                {selectedPlan.title}
                            </h3>

                            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                                {selectedPlan.description}
                            </p>

                            {selectedPeriod === 'daily' && (
                                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                                    <Clock3
                                        size={17}
                                        className="text-[#5EEAD4]"
                                    />

                                    {selectedDailySchedule?.schedule}
                                </div>
                            )}

                            <p className="mt-7 text-sm font-semibold uppercase tracking-wider text-[#5EEAD4]">
                                {t('pricing.aPartirDe')}
                            </p>

                            <div className="mt-2 flex items-end gap-2">
                                <span className="mb-1.5 text-lg font-bold text-[#5EEAD4]">
                                    €
                                </span>

                                <span className="text-5xl font-black tracking-[-0.06em]">
                                    {selectedPlan.price}
                                </span>

                                <span className="mb-1.5 text-sm font-semibold text-slate-300">
                                    {selectedPlan.suffix}
                                </span>
                            </div>

                            {selectedPeriod === 'annual' && (
                                <p className="mt-3 text-sm text-slate-300">
                                    {t('pricing.equivaleAnual')}
                                </p>

                            )}
                        </div>

                        {/* Benefícios incluídos */}
                        <div className="px-5 py-10 sm:px-10 lg:px-11 lg:py-12">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#14B8A6]/10">
                                    <CalendarDays
                                        size={21}
                                        className="text-[#14B8A6]"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-[#071A33]">
                                        {t('pricing.incluidoTitulo')}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {t('pricing.incluidoDescricao')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                {benefits.map((benefit) => (
                                    <div
                                        key={benefit}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#14B8A6]/10 text-[#14B8A6]">
                                            <Check
                                                size={15}
                                                strokeWidth={2.5}
                                            />
                                        </div>

                                        <span className="text-sm leading-6 text-slate-600">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                {auth?.user ? (
                                    <Link
                                        href={route(
                                            'reservas.availability',
                                        )}
                                        className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-black text-[#071A33] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/50 hover:bg-[#EAFBF8] sm:whitespace-nowrap"
                                    >
                                        <Search size={19} />
                                        {t('pricing.ctaConsultarDisponibilidade')}
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-black text-[#071A33] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/50 hover:bg-[#EAFBF8] sm:whitespace-nowrap"
                                    >
                                        <UserPlus size={19} />
                                        {t('pricing.ctaCriarConta')}
                                    </Link>
                                )}

                                <Link
                                    href={route('login')}
                                    className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#14B8A6]/80 px-6 py-3.5 text-base font-black text-[#03172B] shadow-lg shadow-[#14B8A6]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#14B8A6] hover:shadow-[#14B8A6]/35 sm:whitespace-nowrap"
                                >
                                    <CalendarCheck size={19} />
                                    {t('pricing.ctaReservarAgora')}
                                </Link>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-slate-400">
                                {t('pricing.avisoDisponibilidade')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
