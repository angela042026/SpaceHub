import {
    BarChart3,
    Building2,
    History,
    Map,
    MessageSquare,
    ShieldCheck,
} from 'lucide-react';

const features = [
    {
        title: 'Suporte em tempo real',
        description:
            'Tire dúvidas a qualquer momento através do chat e do Centro de Ajuda, sem sair da plataforma.',
        icon: MessageSquare,
    },
    {
        title: 'Histórico e cancelamento',
        description:
            'Consulte reservas passadas e cancele quando precisar, tudo numa única área.',
        icon: History,
    },
    {
        title: 'Mapa interativo',
        description:
            'Visualize a disponibilidade dos espaços e encontre facilmente o lugar ideal.',
        icon: Map,
    },
    {
        title: 'Estatísticas inteligentes',
        description:
            'Acompanhe a utilização dos espaços e tome decisões com base em dados reais.',
        icon: BarChart3,
    },
    {
        title: 'Gestão centralizada',
        description:
            'Administre edifícios, pisos, setores, secretárias e utilizadores numa única plataforma.',
        icon: Building2,
    },
    {
        title: 'Segurança e controlo',
        description:
            'Garanta a proteção dos dados e controle o acesso através de diferentes permissões.',
        icon: ShieldCheck,
    },
];

export default function FeaturesSection() {
    return (
        <section
            id="funcionalidades"
            className="scroll-mt-[74px] bg-white px-6 pb-20 pt-24 lg:px-10 lg:pb-24 lg:pt-28"
        >
            <div className="mx-auto max-w-[1380px]">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#14B8A6]">
                        Funcionalidades
                    </span>

                    <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#071A33] sm:text-5xl">
                        Tudo o que precisa para gerir melhor os seus espaços
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
                        Uma plataforma completa para simplificar reservas,
                        acessos e gestão de espaços de trabalho.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ title, description, icon: Icon }) => (
                        <article
                            key={title}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#14B8A6]/40 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
                        >
                            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#14B8A6] opacity-70 transition-all duration-300 group-hover:w-1.5 group-hover:opacity-100" />

                            <div className="flex items-start gap-5">
                                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-[#14B8A6]/20 bg-[#EAFBF8] text-[#14B8A6] transition-all duration-300 group-hover:bg-[#14B8A6] group-hover:text-white">
                                    <Icon size={25} strokeWidth={1.8} />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-[#071A33]">
                                        {title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
