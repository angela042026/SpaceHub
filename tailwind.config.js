import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',

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
                    400: 'rgb(var(--color-teal-400) / <alpha-value>)',
                    500: 'rgb(var(--color-teal-500) / <alpha-value>)',
                    600: 'rgb(var(--color-teal-600) / <alpha-value>)',
                },

                surface: 'var(--color-surface)',
                card: 'var(--color-card)',
                border: 'var(--color-border)',
                'text-secondary': 'var(--color-text-secondary)',

                status: {
                    livre: 'var(--color-status-livre)',
                    reservada: 'var(--color-status-reservada)',
                    ocupada: 'var(--color-status-ocupada)',
                    indisponivel: 'var(--color-status-indisponivel)',
                    expira: 'var(--color-status-expira)',
                },
            },

            borderRadius: {
                card: 'var(--radius-card)',
                pill: 'var(--radius-pill)',
            },

            boxShadow: {
                card: 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
            },

            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-33.333%)' },
                },

                'desk-pop': {
                    '0%': {
                        transform:
                            'translate(-50%, -50%) scale(0.7)',
                        opacity: '0.7',
                    },
                    '60%': {
                        transform:
                            'translate(-50%, -50%) scale(1.22)',
                        opacity: '1',
                    },
                    '100%': {
                        transform:
                            'translate(-50%, -50%) scale(1.15)',
                        opacity: '1',
                    },
                },

                'modal-in': {
                    '0%': {
                        transform: 'translateY(8px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                },
            },

            animation: {
                marquee: 'marquee 32s linear infinite',
                'desk-pop':
                    'desk-pop 220ms ease-out forwards',
                'modal-in':
                    'modal-in 200ms ease-out forwards',
            },
        },
    },

    plugins: [forms],
};
