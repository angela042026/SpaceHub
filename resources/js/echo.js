import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const appKey = import.meta.env.VITE_REVERB_APP_KEY?.trim();

// No deploy inicial o broadcasting pode estar desativado. Sem esta guarda,
// o cliente Pusher usado internamente pelo Reverb lança uma exceção antes de
// o React arrancar e deixa a aplicação inteira em branco.
if (appKey) {
    window.Pusher = Pusher;

    const isSecure = (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: appKey,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? (isSecure ? 443 : 8080),
        wssPort: import.meta.env.VITE_REVERB_PORT ?? (isSecure ? 443 : 8080),
        forceTLS: isSecure,
        enabledTransports: ['ws', 'wss'],
    });
}
