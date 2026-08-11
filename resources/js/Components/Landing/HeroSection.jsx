import { Link, usePage } from '@inertiajs/react';
import {
    CalendarPlus,
    MapPin,
} from 'lucide-react';

export default function HeroSection() {
    const { auth } = usePage().props;

    const scrollToSpaces = () => {
        document.querySelector('#espacos')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <section className="relative overflow-hidden bg-[#03172B] pt-[82px] text-white">
            {/* Background */}
            <div className="absolute inset-0">
                <picture>
                    <source
                        srcSet="/images/landing/espaco-comum.webp"
                        type="image/webp"
                    />

                    <img
                        src="/images/landing/espaco-comum.png"
                        alt="Espaço de coworking moderno da SpaceHub"
                        fetchpriority="high"
                        className="h-full w-full object-cover object-center"
                    />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-r from-[#03172B]/95 via-[#03172B]/70 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#03172B]/35 via-transparent to-transparent" />
            </div>

            {/* Conteúdo */}
            <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-center px-6 py-20 lg:px-10 lg:py-28">
                <div className="max-w-3xl">
                    <h1 className="text-[32px] font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-[43px] lg:text-[54px] xl:text-[58px]">
                        Reserve o espaço ideal
                        <br />
                        para trabalhar{' '}
                        <span className="text-[#14B8A6]">
                            melhor.
                        </span>
                    </h1>

                    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-200">
                        Reserve secretárias, salas de reunião e espaços de
                        coworking em segundos. Faça check-in por QR Code e
                        acompanhe toda a ocupação em tempo real numa única
                        plataforma.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href={
                                auth?.user
                                    ? route('reservas.create')
                                    : route('login')
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-[#14B8A6]/80 px-6 py-2.5 text-base font-semibold text-[#03172B] shadow-lg shadow-[#14B8A6]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#14B8A6] hover:shadow-[#14B8A6]/40 active:translate-y-0"
                        >
                            <CalendarPlus className="h-[18px] w-[18px]" />

                            {auth?.user
                                ? 'Reservar um espaço'
                                : 'Entrar para reservar'}
                        </Link>

                        <button
                            type="button"
                            onClick={scrollToSpaces}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-2.5 text-base font-medium text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/50 hover:bg-white/10 hover:text-[#14B8A6] active:translate-y-0"
                        >
                            <MapPin className="h-[18px] w-[18px]" />

                            Conhecer os espaços
                        </button>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#03172B] to-transparent lg:h-36" />
        </section>
    );
}
