import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['Sora', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                navy: {
                    800: 'var(--color-navy-800)',
                    900: 'var(--color-navy-900)',
                    950: 'var(--color-navy-950)',
                },
                teal: {
                    400: 'var(--color-teal-400)',
                    500: 'var(--color-teal-500)',
                    600: 'var(--color-teal-600)',
                },
                status: {
                    livre: 'var(--color-status-livre)',
                    reservada: 'var(--color-status-reservada)',
                    ocupada: 'var(--color-status-ocupada)',
                    indisponivel: 'var(--color-status-indisponivel)',
                    expira: 'var(--color-status-expira)',
                },
                surface: 'var(--color-surface)',
                card: 'var(--color-card)',
            },
            boxShadow: {
                card: 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
            },
            borderRadius: {
                card: 'var(--radius-card)',
                pill: 'var(--radius-pill)',
            },
        },
    },

    plugins: [forms],
};
