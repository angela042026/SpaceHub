import { Link } from '@inertiajs/react';

export default function AuthFooter() {
    return (
        <footer
            className="
                border-t border-slate-100
                bg-white
                dark:border-white/10
                dark:bg-[#041221]
            "
        >
            <div className="mx-auto flex min-h-[72px] max-w-[1500px] flex-col items-center justify-center gap-3 px-6 py-4 text-sm text-slate-400 sm:flex-row">
                <span>
                    © {new Date().getFullYear()} SpaceHub.
                    Todos os direitos reservados.
                </span>

                <span className="hidden h-5 w-px bg-slate-300 dark:bg-white/15 sm:block" />

                <Link
                    href={route('legal.privacy')}
                    className="transition hover:text-[#0F9E90] dark:hover:text-[#5EEAD4]"
                >
                    Política de Privacidade
                </Link>

                <span className="hidden h-5 w-px bg-slate-300 dark:bg-white/15 sm:block" />

                <Link
                    href={route('legal.terms')}
                    className="transition hover:text-[#0F9E90] dark:hover:text-[#5EEAD4]"
                >
                    Termos de Utilização
                </Link>
            </div>
        </footer>
    );
}
