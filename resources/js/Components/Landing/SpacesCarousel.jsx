import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from 'lucide-react';

export default function SpacesCarousel() {
    const { t } = useTranslation('landing');

    const spaceImages = [
        '/images/landing/espaco-trabalho.png',
        '/images/landing/espaco-comum.png',
        '/images/landing/saladereuniao.png',
        '/images/landing/lounge.png',
        '/images/landing/rececao.png',
        '/images/landing/escritorio-privado.png',
        '/images/landing/phone-booth.png',
        '/images/landing/terraco.png',
    ];

    const spaces = t('spaces.itens', { returnObjects: true }).map((item, indice) => ({
        title: item.titulo,
        description: item.descricao,
        image: spaceImages[indice],
        category: item.categoria,
        location: item.localizacao,
    }));

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
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                        {t('spaces.eyebrow')}
                    </span>

                    <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-4xl lg:text-5xl">
                        {t('spaces.titulo')}{' '}
                        <span className="text-[#14B8A6]">
                            {t('spaces.tituloDestaque')}
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                        {t('spaces.descricao')}
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
                                    aria-label={t('spaces.anterior')}
                                    className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#071A33] transition-all duration-300 hover:border-[#14B8A6] hover:bg-[#14B8A6] hover:text-white"
                                >
                                    <ChevronLeft size={21} />
                                </button>

                                <button
                                    type="button"
                                    onClick={goToNext}
                                    aria-label={t('spaces.seguinte')}
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
                            aria-label={t('spaces.verEspaco', { titulo: space.title })}
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
