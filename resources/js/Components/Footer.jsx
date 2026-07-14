export default function Footer() {
    return (
        <footer className="mt-10 border-t border-slate-200/70 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            © {new Date().getFullYear()} SpaceHub. Todos os direitos reservados.
        </footer>
    );
}
