import { useEffect, useMemo, useState } from 'react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from 'lucide-react';

const spaces = [
    {
        title: 'Espaço de trabalho',
        description:
            'Um ambiente moderno, confortável e preparado para promover a produtividade ao longo do dia.',
        image: '/images/landing/espaco-trabalho.png',
        category: 'Coworking',
        location: 'Piso 1 · Setor A',
    },
    {
        title: 'Espaço comum',
        description:
            'Uma área aberta e versátil para trabalhar, colaborar com a equipa e partilhar novas ideias.',
        image: '/images/landing/espaco-comum.png',
        category: 'Colaboração',
        location: 'Piso 0 · Área comum',
    },
    {
        title: 'Sala de reunião',
        description:
            'Salas totalmente equipadas para reuniões, apresentações e momentos de trabalho em equipa.',
        image: '/images/landing/saladereuniao.png',
        category: 'Reuniões',
        location: 'Piso 2 · Setor B',
    },
    {
        title: 'Lounge',
        description:
            'Um ambiente descontraído para fazer uma pausa, conversar e criar novas ligações profissionais.',
        image: '/images/landing/lounge.png',
        category: 'Conforto',
        location: 'Piso 0 · Lounge',
    },
    {
        title: 'Receção',
        description:
            'Uma entrada moderna, profissional e acolhedora para receber utilizadores e visitantes.',
        image: '/images/landing/rececao.png',
        category: 'Acolhimento',
        location: 'Piso 0 · Entrada',
    },
    {
        title: 'Escritório privado',
        description:
            'Mais privacidade, concentração e conforto para equipas e profissionais que precisam de foco.',
        image: '/images/landing/escritorio-privado.png',
        category: 'Privacidade',
        location: 'Piso 3 · Setor C',
    },
    {
        title: 'Phone Booth',
        description:
            'Cabines silenciosas preparadas para chamadas, videoconferências e reuniões individuais.',
        image: '/images/landing/phone-booth.png',
        category: 'Chamadas',
        location: 'Piso 1 · Setor B',
    },
    {
        title: 'Terraço',
        description:
            'Um espaço exterior agradável para trabalhar, relaxar ou fazer uma pausa durante o dia.',
        image: '/images/landing/terraco.png',
        category: 'Exterior',
        location: 'Piso 4 · Terraço',
    },
];

export default function SpacesCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const currentSpace = useMemo(
        () => spaces[currentIndex],
        [currentIndex],
    );

    const goToPrevious = () => {
        setCurrentIndex((current) =>
            current === 0 ? spaces.length - 1 : current - 1,
        );
    };

    const goToNext = () => {
        setCurrentIndex((current) =>
            current === spaces.length - 1 ? 0 : current + 1,
        );
    };

    useEffect(() => {
        if (isPaused) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setCurrentIndex((current) =>
                current === spaces.length - 1 ? 0 : current + 1,
            );
        }, 5000);

        return () => window.clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        const nextIndex =
            currentIndex === spaces.length - 1 ? 0 : currentIndex + 1;

        const preload = new window.Image();
        preload.src = spaces[nextIndex].image.replace(/\.png$/, '.webp');
    }, [currentIndex]);

    return (
        <section
            id="espacos"
            className="relative scroll-mt-[74px] overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
            <div className="relative mx-auto max-w-[1450px]">
                <div className="mx-auto mb-14 max-w-3xl text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#14B8A6]">
                        Os nossos espaços
                    </span>

                    <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-4xl lg:text-5xl">
                        Ambientes pensados para{' '}
                        <span className="text-[#14B8A6]">
                            trabalhar melhor
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                        Descubra espaços modernos, confortáveis e preparados
                        para diferentes formas de trabalhar.
                    </p>
                </div>

                <div
                    className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#FCFCFD] shadow-[0_14px_45px_rgba(15,23,42,0.07)]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="grid min-h-[570px] lg:grid-cols-[0.82fr_1.35fr]">
                        <div className="relative flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12 xl:px-16">
                            <div className="absolute left-0 top-12 h-20 w-1 rounded-r-full bg-[#14B8A6]" />

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">
                                <Building2 size={16} />

                                {currentSpace.category}
                            </div>

                            <h3 className="mt-7 text-4xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-5xl">
                                {currentSpace.title}
                            </h3>

                            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
                                {currentSpace.description}
                            </p>

                            <div className="mt-7 flex items-center gap-3 text-sm font-semibold text-slate-500">
                                <MapPin
                                    size={19}
                                    className="text-[#14B8A6]"
                                />

                                {currentSpace.location}
                            </div>

                            <div className="mt-12 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={goToPrevious}
                                    aria-label="Ver espaço anterior"
                                    className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#071A33] transition-all duration-300 hover:border-[#14B8A6] hover:bg-[#14B8A6] hover:text-white"
                                >
                                    <ChevronLeft size={21} />
                                </button>

                                <button
                                    type="button"
                                    onClick={goToNext}
                                    aria-label="Ver próximo espaço"
                                    className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#071A33] transition-all duration-300 hover:border-[#14B8A6] hover:bg-[#14B8A6] hover:text-white"
                                >
                                    <ChevronRight size={21} />
                                </button>

                                <div className="ml-2 text-sm font-bold text-[#071A33]">
                                    {String(currentIndex + 1).padStart(2, '0')}

                                    <span className="mx-2 text-slate-300">
                                        /
                                    </span>

                                    <span className="text-slate-400">
                                        {String(spaces.length).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative min-h-[380px] overflow-hidden lg:min-h-[570px]">
                            <picture>
                                <source
                                    srcSet={currentSpace.image.replace(
                                        /\.png$/,
                                        '.webp',
                                    )}
                                    type="image/webp"
                                />

                                <img
                                    key={currentSpace.image}
                                    src={currentSpace.image}
                                    alt={`${currentSpace.title} — ${currentSpace.category}, ${currentSpace.location}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                />
                            </picture>

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-transparent lg:from-white/35" />
                        </div>
                    </div>
                </div>

                <div className="mt-7 flex justify-center gap-2">
                    {spaces.map((space, index) => (
                        <button
                            key={space.title}
                            type="button"
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Ver ${space.title}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentIndex === index
                                    ? 'w-8 bg-[#14B8A6]'
                                    : 'w-2 bg-slate-300 hover:bg-[#14B8A6]/50'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
