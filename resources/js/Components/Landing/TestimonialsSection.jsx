import { useState } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: 'A reserva de secretárias deixou de ser um problema. Em menos de um minuto sei onde vou trabalhar amanhã.',
        name: 'Mariana Sousa',
        role: 'Coordenadora de RH, Grupo Aurora',
        initials: 'MS',
        color: '#14B8A6',
        photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        quote: 'O check-in por QR Code na própria secretária poupa-nos imenso tempo. Já não há filas nem confusão de manhã.',
        name: 'Rui Pereira',
        role: 'Gestor de instalações, Nova Workspaces',
        initials: 'RP',
        color: '#0F766E',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
        quote: 'O lounge exterior é o meu espaço preferido para fazer uma pausa ou trabalhar num dia de sol. Reservo tudo pela mesma plataforma, sem complicações.',
        name: 'Catarina Ferreira',
        role: 'Consultora, Consultora Vórtice',
        initials: 'CF',
        color: '#03172B',
        photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
        quote: 'O mapa em tempo real evita conflitos de sala todos os dias. Toda a gente vê a ocupação atualizada.',
        name: 'João Lima',
        role: 'Facilities, Espaço Meridiano',
        initials: 'JL',
        color: '#2DD4BF',
        photo: 'https://i.pravatar.cc/150?u=joao-lima-spacehub',
    },
];

const cards = [...testimonials, ...testimonials];

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

export default function TestimonialsSection() {
    return (
        <section
            id="testemunhos"
            className="scroll-mt-[74px] bg-[#F8FAFC] py-20 lg:py-28"
        >
            <div className="mx-auto max-w-3xl px-6 text-center">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                    O que dizem sobre nós
                </span>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-5xl">
                    Equipas que já trabalham melhor com o SpaceHub
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                    Feedback real de quem usa a plataforma no dia a dia.
                </p>
            </div>

            <div className="group relative mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max gap-6 animate-marquee group-hover:[animation-play-state:paused]">
                    {cards.map((testimonial, index) => (
                        <article
                            key={`${testimonial.name}-${index}`}
                            aria-hidden={index >= testimonials.length}
                            className="flex h-[280px] w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
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
