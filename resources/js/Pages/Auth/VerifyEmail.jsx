import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthLayout from '@/Components/Auth/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    LogOut,
    MailCheck,
} from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { t } = useTranslation('auth');
    const { post, processing } = useForm({});

    const submit = (event) => {
        event.preventDefault();

        post(route('verification.send'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${t('verificarEmail.titulo')} ${t('verificarEmail.tituloDestaque')}`} />

            <AuthLayout
                title={t('verificarEmail.titulo')}
                highlightedTitle={t('verificarEmail.tituloDestaque')}
                subtitle={t('verificarEmail.subtitulo')}
                heroTitle={t('verificarEmail.heroTitulo')}
                heroPrefix={t('verificarEmail.heroPrefixo')}
                heroHighlightedTitle={t('verificarEmail.heroTituloDestaque')}
                heroDescription={t('verificarEmail.heroDescricao')}
            >
                {status === 'verification-link-sent' && (
                    <output
                        className="
                            mb-5 block rounded-xl
                            border border-emerald-200
                            bg-emerald-50
                            px-4 py-3
                            text-sm font-medium
                            text-emerald-700
                            dark:border-emerald-400/20
                            dark:bg-emerald-400/10
                            dark:text-emerald-300
                        "
                    >
                        {t('verificarEmail.linkReenviado')}
                    </output>
                )}

                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <div
                            className="
                                flex items-start gap-3
                                rounded-xl
                                border border-slate-200
                                bg-slate-50
                                px-4 py-3
                                text-sm leading-6
                                text-slate-600
                                dark:border-white/10
                                dark:bg-white/5
                                dark:text-slate-300
                            "
                        >
                            <MailCheck
                                size={20}
                                className="
                                    mt-0.5 shrink-0
                                    text-[#14B8A6]
                                    dark:text-[#5EEAD4]
                                "
                            />

                            <p>
                                {t('verificarEmail.aviso')}
                            </p>
                        </div>

                        <AuthActions
                            processing={processing}
                            submitText={t('verificarEmail.reenviar')}
                            processingText={t('verificarEmail.aEnviar')}
                            submitIcon={MailCheck}
                            showSecondary={false}
                        />
                    </AuthCard>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="
                            inline-flex items-center gap-2
                            font-semibold
                            text-[#0F9E90]
                            transition
                            hover:underline
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#14B8A6]/30
                            dark:text-[#5EEAD4]
                        "
                    >
                        <LogOut
                            size={16}
                            aria-hidden="true"
                        />

                        {t('verificarEmail.terminarSessao')}
                    </Link>
                </div>
            </AuthLayout>
        </>
    );
}
