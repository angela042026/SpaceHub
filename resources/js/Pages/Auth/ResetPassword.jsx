import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthField from '@/Components/Auth/AuthField';
import AuthLayout from '@/Components/Auth/AuthLayout';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    KeyRound,
    Mail,
} from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { t } = useTranslation('auth');
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.store'), {
            preserveScroll: true,
            onFinish: () =>
                reset(
                    'password',
                    'password_confirmation',
                ),
        });
    };

    return (
        <>
            <Head title={t('redefinirSenha.redefinir')} />

            <AuthLayout
                title={t('redefinirSenha.titulo')}
                highlightedTitle={t('redefinirSenha.tituloDestaque')}
                subtitle={t('redefinirSenha.subtitulo')}
                heroTitle={t('redefinirSenha.heroTitulo')}
                heroPrefix={t('redefinirSenha.heroPrefixo')}
                heroHighlightedTitle={t('redefinirSenha.heroTituloDestaque')}
                heroDescription={t('redefinirSenha.heroDescricao')}
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
                            <KeyRound
                                size={20}
                                className="
                                    mt-0.5 shrink-0
                                    text-[#14B8A6]
                                    dark:text-[#5EEAD4]
                                "
                            />

                            <p>
                                {t('redefinirSenha.aviso')}
                            </p>
                        </div>

                        <AuthField
                            id="email"
                            label={t('campos.email')}
                            name="email"
                            type="email"
                            icon={Mail}
                            value={data.email}
                            placeholder={t('campos.emailPlaceholder')}
                            autoComplete="username"
                            error={errors.email}
                            onChange={(event) =>
                                setData(
                                    'email',
                                    event.target.value,
                                )
                            }
                        />

                        <PasswordField
                            id="password"
                            label={t('campos.novaSenha')}
                            name="password"
                            value={data.password}
                            placeholder={t('campos.novaSenhaPlaceholder')}
                            autoComplete="new-password"
                            error={errors.password}
                            className="mt-5"
                            onChange={(event) =>
                                setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        />

                        <PasswordField
                            id="password_confirmation"
                            label={t('campos.confirmarNovaSenha')}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder={t('campos.confirmarNovaSenhaPlaceholder')}
                            autoComplete="new-password"
                            error={
                                errors.password_confirmation
                            }
                            className="mt-5"
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                        />

                        <AuthActions
                            processing={processing}
                            submitText={t('redefinirSenha.redefinir')}
                            processingText={t('redefinirSenha.aGuardar')}
                            submitIcon={KeyRound}
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
                    {t('recuperarSenha.lembrouSeDaSenha')}{' '}

                    <Link
                        href={route('login')}
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
                        {t('recuperarSenha.voltarAoLogin')}
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
