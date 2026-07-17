import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'spacehub-theme';

function getPreferredTheme() {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export default function useTheme() {
    const [theme, setTheme] = useState(getPreferredTheme);

    useEffect(() => {
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark',
        );

        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) =>
            current === 'dark' ? 'light' : 'dark',
        );
    }, []);

    return {
        theme,
        toggleTheme,
    };
}
