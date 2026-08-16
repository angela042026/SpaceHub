import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthLayout from '@/Components/Auth/AuthLayout';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    ShieldCheck,
} from 'lucide-react';

export default function ConfirmPassword() {
    const { t } = useTranslation('auth');
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.confirm'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title={t('confirmarSenha.confirmar')} />

            <AuthLayout
                title={t('confirmarSenha.titulo')}
                highlightedTitle={t('confirmarSenha.tituloDestaque')}
                subtitle={t('confirmarSenha.subtitulo')}
                heroTitle={t('confirmarSenha.heroTitulo')}
                heroPrefix={t('confirmarSenha.heroPrefixo')}
                heroHighlightedTitle={t('confirmarSenha.heroTituloDestaque')}
                heroDescription={t('confirmarSenha.heroDescricao')}
            >
                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <div
                            className="
                                mb-5 flex items-start gap-3
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
                            <ShieldCheck
                                size={20}
                                aria-hidden="true"
                                className="
                                    mt-0.5 shrink-0
                                    text-[#14B8A6]
                                    dark:text-[#5EEAD4]
                                "
                            />

                            <p>
                                {t('confirmarSenha.aviso')}
                            </p>
                        </div>

                        <PasswordField
                            id="password"
                            label={t('campos.senha')}
                            name="password"
                            value={data.password}
                            placeholder={t('campos.senhaPlaceholder')}
                            autoComplete="current-password"
                            error={errors.password}
                            onChange={(event) =>
                                setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        />

                        <AuthActions
                            processing={processing}
                            submitText={t('confirmarSenha.confirmar')}
                            processingText={t('confirmarSenha.aConfirmar')}
                            submitIcon={ShieldCheck}
                            showSecondary={false}
                        />
                    </AuthCard>
                </form>

                <p
                    className="
                        mt-6 text-center
                        text-sm text-slate-600
                        dark:text-slate-300
                    "
                >
                    {t('confirmarSenha.naoPretendeContinuar')}{' '}

                    <Link
                        href={route('dashboard')}
                        className="
                            inline-flex items-center gap-1
                            font-semibold
                            text-[#0F9E90]
                            underline-offset-4
                            transition
                            hover:underline
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#14B8A6]/30
                            dark:text-[#5EEAD4]
                        "
                    >
                        <ArrowLeft
                            size={15}
                            aria-hidden="true"
                        />

                        {t('confirmarSenha.voltarAoDashboard')}
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
