import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock3,
    Sparkles,
} from 'lucide-react';

const periods = [
    {
        id: 'daily',
        label: 'Diário',
    },
    {
        id: 'weekly',
        label: 'Semanal',
    },
    {
        id: 'monthly',
        label: 'Mensal',
    },
    {
        id: 'annual',
        label: 'Anual',
    },
];

const dailyPeriods = [
    {
        id: 'morning',
        label: 'Manhã',
        schedule: '08:00 – 13:00',
    },
    {
        id: 'afternoon',
        label: 'Tarde',
        schedule: '13:00 – 18:00',
    },
    {
        id: 'fullDay',
        label: 'Dia inteiro',
        schedule: '08:00 – 18:00',
    },
];

const pricing = {
    daily: {
        morning: {
            price: '8',
            suffix: '/ manhã',
            title: 'Passe diário — Manhã',
            description:
                'Ideal para quem precisa de um espaço durante o período da manhã.',
        },

        afternoon: {
            price: '8',
            suffix: '/ tarde',
            title: 'Passe diário — Tarde',
            description:
                'Uma opção flexível para trabalhar durante o período da tarde.',
        },

        fullDay: {
            price: '14',
            suffix: '/ dia',
            title: 'Passe diário — Dia inteiro',
            description:
                'Acesso ao espaço durante todo o horário de funcionamento.',
        },
    },

    weekly: {
        price: '55',
        suffix: '/ semana',
        title: 'Plano semanal',
        description:
            'Flexibilidade para utilizar os espaços durante toda a semana.',
    },

    monthly: {
        price: '149',
        suffix: '/ mês',
        title: 'Plano mensal',
        description:
            'A melhor escolha para quem utiliza o SpaceHub com frequência.',
    },

    annual: {
        price: '1.490',
        suffix: '/ ano',
        title: 'Plano anual',
        description:
            'Poupe com um plano completo para utilização durante todo o ano.',
    },
};

const benefits = [
    'Reserva de secretárias e espaços de trabalho',
    'Check-in rápido através de QR Code',
    'Acesso ao mapa de disponibilidade',
    'Gestão das reservas numa única plataforma',
    'Cancelamento e consulta do histórico',
    'Suporte SpaceHub',
];

export default function PricingSection() {
    const { auth } = usePage().props;

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
            className="relative scroll-mt-[74px] overflow-hidden bg-[#F8FAFC] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
        >
            <div className="mx-auto max-w-[1250px]">
                {/* Cabeçalho */}
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#14B8A6]">
                        Preços
                    </span>

                    <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.04em] text-[#071A33] sm:text-4xl lg:text-[46px]">
                        Escolha a opção ideal para{' '}
                        <span className="text-[#14B8A6]">a sua rotina</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                        Utilize o SpaceHub por um período, durante alguns dias
                        ou através de um plano de utilização regular.
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
                                className={`min-w-[105px] flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${isActive
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
                        <div className="relative flex flex-col justify-center bg-[#071A33] px-8 py-10 text-white sm:px-10 lg:px-11 lg:py-12">
                            <div className="absolute left-0 top-10 h-16 w-1 rounded-r-full bg-[#14B8A6]" />

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5EEAD4]">
                                <Sparkles size={14} />
                                Plano selecionado
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

                            <div className="mt-7 flex items-end gap-2">
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
                                <p className="mt-3 text-sm font-semibold text-[#5EEAD4]">
                                    Equivale a aproximadamente €124 por mês
                                </p>
                            )}
                        </div>

                        {/* Benefícios incluídos */}
                        <div className="px-8 py-10 sm:px-10 lg:px-11 lg:py-12">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#14B8A6]/10">
                                    <CalendarDays
                                        size={21}
                                        className="text-[#14B8A6]"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-[#071A33]">
                                        Incluído nesta opção
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Tudo o que precisa para trabalhar com
                                        conforto.
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

                            <Link
                                href={
                                    auth?.user
                                        ? route('reservas.create')
                                        : route('register')
                                }
                                className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#14B8A6] px-9 py-3.5 text-base font-black text-[#03172B] shadow-lg shadow-[#14B8A6]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0F9F91] hover:shadow-[#14B8A6]/35 sm:w-auto sm:min-w-[260px]"
                            >
                                {auth?.user
                                    ? 'Reservar agora'
                                    : 'Criar conta e reservar'}

                                <ArrowRight
                                    size={19}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>

                            <p className="mt-3 text-xs leading-5 text-slate-400">
                                Pode consultar a disponibilidade antes de
                                confirmar a reserva.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
