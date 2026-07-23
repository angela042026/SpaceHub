const steps = [
    {
        number: '01',
        title: 'Escolha o espaço',
        description:
            'Consulte os espaços disponíveis e encontre a opção ideal para o seu dia de trabalho.',
        image: '/images/landing/espaco-trabalho.png',
    },
    {
        number: '02',
        title: 'Faça a reserva',
        description:
            'Selecione a data, o período e confirme a sua reserva em poucos segundos.',
        image: '/images/landing/rececao.png',
    },
    {
        number: '03',
        title: 'Faça o check-in',
        description:
            'Utilize o QR Code para confirmar a sua chegada de forma rápida e segura.',
        image: '/images/landing/checkin.png',
    },
    {
        number: '04',
        title: 'Aproveite o espaço',
        description:
            'Trabalhe num ambiente confortável, moderno e preparado para si.',
        image: '/images/landing/lounge.png',
    },
];

export default function HowItWorksSection() {
    return (
        <section
            id="como-funciona"
            className="relative scroll-mt-[74px] overflow-hidden bg-[#F8FAFC] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
            {/* Decoração de fundo */}
            <div className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full bg-[#14B8A6]/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#14B8A6]/10 blur-3xl" />

            <div className="relative mx-auto max-w-[1450px]">
                {/* Cabeçalho */}
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#14B8A6]">
                        Como funciona
                    </span>

                    <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em] text-[#071A33] sm:text-4xl lg:text-5xl">
                        Reserve o seu espaço em{' '}
                        <span className="text-[#14B8A6]">
                            quatro passos simples
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                        Da escolha do espaço ao check-in, todo o processo foi
                        pensado para ser rápido, intuitivo e sem complicações.
                    </p>
                </div>

                {/* Linha dos passos */}
                <div className="relative">
                    <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-slate-200 xl:block" />

                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                        {steps.map(
                            ({
                                number,
                                title,
                                description,
                                image,
                            }) => (
                                <article
                                    key={number}
                                    className="group relative"
                                >
                                    {/* Número do passo */}
                                    <div className="relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#F8FAFC] bg-[#14B8A6] text-sm font-black text-white shadow-lg shadow-[#14B8A6]/25">
                                        {number}
                                    </div>

                                    {/* Card */}
                                    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#14B8A6]/35 hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]">
                                        {/* Imagem */}
                                        <div className="relative h-60 overflow-hidden bg-slate-100">
                                            <picture>
                                                <source
                                                    srcSet={image.replace(
                                                        /\.png$/,
                                                        '.webp',
                                                    )}
                                                    type="image/webp"
                                                />

                                                <img
                                                    src={image}
                                                    alt={title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="block h-full w-full object-cover object-center"
                                                />
                                            </picture>

                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071A33]/20 via-transparent to-transparent" />
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold tracking-tight text-[#071A33]">
                                                {title}
                                            </h3>

                                            <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-600">
                                                {description}
                                            </p>

                                            <div className="mt-6 flex items-center gap-3">
                                                <span className="h-px flex-1 bg-slate-200" />

                                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#14B8A6]">
                                                    Passo {number}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
