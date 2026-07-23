<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'SpaceHub') }}</title>

        <meta name="description" content="Reserve secretárias, salas de reunião e espaços de coworking em segundos. Faça check-in por QR Code e acompanhe a ocupação em tempo real com o SpaceHub.">

        <!-- Open Graph -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name', 'SpaceHub') }}">
        <meta property="og:locale" content="pt_PT">
        <meta property="og:url" content="{{ url('/') }}">
        <meta property="og:title" content="SpaceHub — Reserve o espaço ideal para trabalhar melhor">
        <meta property="og:description" content="Reserve secretárias, salas de reunião e espaços de coworking em segundos. Faça check-in por QR Code e acompanhe a ocupação em tempo real com o SpaceHub.">
        <meta property="og:image" content="{{ asset('images/landing/espaco-comum.png') }}">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="SpaceHub — Reserve o espaço ideal para trabalhar melhor">
        <meta name="twitter:description" content="Reserve secretárias, salas de reunião e espaços de coworking em segundos. Faça check-in por QR Code e acompanhe a ocupação em tempo real com o SpaceHub.">
        <meta name="twitter:image" content="{{ asset('images/landing/espaco-comum.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <link rel="icon" type="image/x-icon" href="/images/logo/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo/spacehub-logo.png">

        <!-- Dark mode: aplicado antes do primeiro paint para evitar flash do tema errado -->
        <script>
            (function () {
                var stored = localStorage.getItem('spacehub-theme');
                var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDark);
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
