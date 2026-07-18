import useTheme from '@/Hooks/useTheme';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthFooter from '@/Components/Auth/AuthFooter';
import AuthHeader from '@/Components/Auth/AuthHeader';

export default function LegalLayout({
    icon: Icon,
    title,
    subtitle,
    updatedAt,
    sections,
    children,
}) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            className="
                min-h-screen bg-white
                text-slate-900
                transition-colors duration-300
                dark:bg-[#06172A]
                dark:text-white
            "
        >
            <AuthHeader
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className="relative overflow-hidden">
                <div
                    className="
                        pointer-events-none absolute inset-0
                        bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,0.07),transparent_32%)]
                        dark:bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,0.14),transparent_34%)]
                    "
                />

                <div className="relative mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
                    <div className="mb-12 max-w-2xl">
                        {Icon && (
                            <div
                                className="
                                    mb-6 flex h-14 w-14
                                    items-center justify-center
                                    rounded-2xl
                                    border border-[#14B8A6]/25
                                    bg-[#14B8A6]/10
                                    text-[#14B8A6]
                                    dark:border-[#5EEAD4]/25
                                    dark:text-[#5EEAD4]
                                "
                            >
                                <Icon size={26} strokeWidth={1.9} />
                            </div>
                        )}

                        <h1
                            className="
                                text-3xl font-extrabold
                                tracking-tight
                                text-[#102E55]
                                dark:text-white
                                sm:text-4xl
                            "
                        >
                            {title}
                        </h1>

                        {subtitle && (
                            <p
                                className="
                                    mt-4 text-base leading-7
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                {subtitle}
                            </p>
                        )}

                        {updatedAt && (
                            <span
                                className="
                                    mt-5 inline-flex items-center
                                    rounded-full
                                    border border-slate-200
                                    bg-slate-50
                                    px-3 py-1
                                    text-xs font-semibold
                                    text-slate-500
                                    dark:border-white/10
                                    dark:bg-white/5
                                    dark:text-slate-400
                                "
                            >
                                Última atualização: {updatedAt}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
                        {sections && sections.length > 0 && (
                            <nav
                                aria-label="Índice"
                                className="hidden lg:block"
                            >
                                <div className="sticky top-28">
                                    <p
                                        className="
                                            mb-3 text-xs font-bold
                                            uppercase tracking-wide
                                            text-slate-400
                                            dark:text-slate-500
                                        "
                                    >
                                        Índice
                                    </p>

                                    <ul className="space-y-1 border-l border-slate-200 dark:border-white/10">
                                        {sections.map((section) => (
                                            <li key={section.id}>
                                                <a
                                                    href={`#${section.id}`}
                                                    className="
                                                        -ml-px block
                                                        border-l-2 border-transparent
                                                        py-1.5 pl-4
                                                        text-sm text-slate-500
                                                        transition
                                                        hover:border-[#14B8A6]
                                                        hover:text-[#0F9E90]
                                                        dark:text-slate-400
                                                        dark:hover:border-[#5EEAD4]
                                                        dark:hover:text-[#5EEAD4]
                                                    "
                                                >
                                                    {section.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </nav>
                        )}

                        <AuthCard className="min-w-0">
                            {children}
                        </AuthCard>
                    </div>
                </div>
            </main>

            <AuthFooter />
        </div>
    );
}
