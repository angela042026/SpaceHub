import '../css/app.css';
import './bootstrap';
import './echo';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import i18n, { initI18n } from './i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - SpaceHub` : 'SpaceHub'),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // O idioma vem da prop partilhada pelo Laravel (sessão/cookie
        // resolvidos no SetLocale) — os recursos já estão em memória,
        // por isso init() fica pronto antes do primeiro render.
        initI18n(props.initialPage.props.locale);

        // Mantém o i18next alinhado com o locale do servidor em cada
        // navegação Inertia (links, router.get/post) — cobre o caso
        // de voltar atrás/avançar no histórico com um locale diferente
        // do que está ativo no cliente.
        router.on('navigate', (event) => {
            const locale = event.detail.page.props.locale;

            if (locale && locale !== i18n.language) {
                i18n.changeLanguage(locale);
            }
        });

        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
