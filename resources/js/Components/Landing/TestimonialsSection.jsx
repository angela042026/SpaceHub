import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

// Triplicado para garantir preenchimento em qualquer largura de ecrã.
// A keyframe marquee deve ir de 0 a -33.333% (ver tailwind.config.js).

function Avatar({ photo, initials, color, name }) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: color }}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={photo}
            alt={name}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
    );
}

const testimonialMeta = [
    { initials: 'MS', color: '#14B8A6', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { initials: 'RP', color: '#0F766E', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { initials: 'CF', color: '#03172B', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { initials: 'JL', color: '#2DD4BF', photo: 'https://i.pravatar.cc/150?u=joao-lima-spacehub' },
];

export default function TestimonialsSection() {
    const { t } = useTranslation('landing');

    const testimonials = t('testimonials.itens', { returnObjects: true }).map((item, indice) => ({
        quote: item.citacao,
        name: item.nome,
        role: item.cargo,
        ...testimonialMeta[indice],
    }));

    const cards = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section
            id="testemunhos"
            className="scroll-mt-[74px] bg-[#F8FAFC] py-20 lg:py-28"
        >
            <div className="mx-auto max-w-3xl px-6 text-center">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                    {t('testimonials.eyebrow')}
                </span>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-5xl">
                    {t('testimonials.titulo')}
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                    {t('testimonials.descricao')}
                </p>
            </div>

            <div className="group relative mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
                    {cards.map((testimonial, index) => (
                        <article
                            key={`${testimonial.name}-${index}`}
                            aria-hidden={index >= testimonials.length}
                            className="mr-6 flex h-[280px] w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
                        >
                            <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                    <Star
                                        key={starIndex}
                                        size={15}
                                        fill="currentColor"
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>

                            <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>

                            <div className="mt-6 flex items-center gap-3">
                                <Avatar
                                    photo={testimonial.photo}
                                    initials={testimonial.initials}
                                    color={testimonial.color}
                                    name={testimonial.name}
                                />

                                <div>
                                    <div className="text-sm font-bold text-[#071A33]">
                                        {testimonial.name}
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
