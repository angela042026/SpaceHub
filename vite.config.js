import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
        },
    },

    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],

    build: {
        rollupOptions: {
            output: {
                // Separa bibliotecas de terceiros do código da app: mudam
                // com pouca frequência, por isso o browser reaproveita o
                // cache destes ficheiros entre deploys em vez de os voltar
                // a descarregar sempre que só o código da app muda.
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', '@inertiajs/react'],
                    'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                    'vendor-realtime': ['laravel-echo', 'pusher-js'],
                },
            },
        },
    },
});