import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation('landing');

    return (
        <footer className="mt-10 border-t border-slate-200/70 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
            {t('footer.direitosReservados', { ano: new Date().getFullYear() })}
        </footer>
    );
}
