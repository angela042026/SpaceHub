import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthField from '@/Components/Auth/AuthField';
import AuthLayout from '@/Components/Auth/AuthLayout';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2,
    Mail,
    User,
    UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) {
        score += 1;
    }

    if (/[A-Z]/.test(password)) {
        score += 1;
    }

    if (/[a-z]/.test(password)) {
        score += 1;
    }

    if (/\d/.test(password)) {
        score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    }

    if (score <= 2) {
        return {
            key: 'fraca',
            percentage: 33,
            barClass: 'bg-red-500',
            textClass: 'text-red-500',
        };
    }

    if (score <= 4) {
        return {
            key: 'media',
            percentage: 66,
            barClass: 'bg-amber-500',
            textClass: 'text-amber-500',
        };
    }

    return {
        key: 'forte',
        percentage: 100,
        barClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    };
}

function PasswordStrength({ password }) {
    const { t } = useTranslation('auth');

    const strength = useMemo(
        () => calculatePasswordStrength(password),
        [password],
    );

    if (!password) {
        return null;
    }

    return (
        <div className="mt-3">
            <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                        className={`
                            h-full rounded-full
                            transition-all duration-300
                            ${strength.barClass}
                        `}
                        style={{
                            width: `${strength.percentage}%`,
                        }}
                    />
                </div>

                <span
                    className={`
                        text-xs font-semibold
                        ${strength.textClass}
                    `}
                >
                    {t(`forcaSenha.${strength.key}`)}
                </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t('forcaSenha.dica')}
            </p>
        </div>
    );
}

function PasswordMatchMessage({
    confirmation,
    matches,
}) {
    const { t } = useTranslation('auth');

    if (!confirmation) {
        return null;
    }

    if (matches) {
        return (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2
                    size={14}
                    aria-hidden="true"
                />
                {t('confirmacaoSenha.coincidem')}
            </p>
        );
    }

    return (
        <p className="mt-2 text-xs font-medium text-red-500">
            {t('confirmacaoSenha.naoCoincidem')}
        </p>
    );
}

function TermsAgreement({
    accepted,
    onChange,
    showError,
}) {
    const { t } = useTranslation('auth');

    return (
        <div className="mt-5">
            <label
                htmlFor="terms"
                className="
                    flex cursor-pointer
                    items-start gap-3
                    text-sm leading-6
                    text-slate-600
                    dark:text-slate-300
                "
            >
                <input
                    id="terms"
                    type="checkbox"
                    checked={accepted}
                    onChange={onChange}
                    className="
                        mt-1 h-4 w-4 rounded
                        border-slate-300
                        text-[#14B8A6]
                        focus:ring-[#14B8A6]
                        dark:border-white/20
                        dark:bg-[#071A30]
                    "
                />

                <span>
                    {t('registo.aceitoOs')}{' '}
                    <Link
                        href={route('legal.terms')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            font-semibold
                            text-[#0F9E90]
                            underline-offset-4
                            transition
                            hover:underline
                            dark:text-[#5EEAD4]
                        "
                    >
                        {t('registo.termosDeUtilizacao')}
                    </Link>
                    <span> {t('registo.ea')} </span>
                    <Link
                        href={route('legal.privacy')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            font-semibold
                            text-[#0F9E90]
                            underline-offset-4
                            transition
                            hover:underline
                            dark:text-[#5EEAD4]
                        "
                    >
                        {t('registo.politicaDePrivacidade')}
                    </Link>
                    <span>.</span>
                </span>
            </label>

            {showError && (
                <p className="mt-2 text-xs text-red-500">
                    {t('registo.termosErro')}
                </p>
            )}
        </div>
    );
}

export default function Register() {
    const { t } = useTranslation('auth');
    const [attemptedSubmit, setAttemptedSubmit] =
        useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const hasConfirmation =
        data.password_confirmation.length > 0;

    const passwordsMatch =
        hasConfirmation &&
        data.password === data.password_confirmation;

    let confirmationState = 'default';

    if (hasConfirmation && passwordsMatch) {
        confirmationState = 'valid';
    }

    if (hasConfirmation && !passwordsMatch) {
        confirmationState = 'invalid';
    }

    const handleTermsChange = (event) => {
        const checked = event.target.checked;

        setData('terms', checked);

        if (checked) {
            setAttemptedSubmit(false);
        }
    };

    const submit = (event) => {
        event.preventDefault();
        setAttemptedSubmit(true);

        if (!data.terms) {
            return;
        }

        post(route('register'), {
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
            <Head title={t('registo.criarConta')} />

            <AuthLayout
                title={t('registo.titulo')}
                highlightedTitle={t('registo.tituloDestaque')}
                subtitle={t('registo.subtitulo')}
                heroTitle={t('registo.heroTitulo')}
                heroPrefix={t('registo.heroPrefixo')}
                heroHighlightedTitle={t('registo.heroTituloDestaque')}
                heroDescription={t('registo.heroDescricao')}
            >
                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <AuthField
                            id="name"
                            label={t('campos.nome')}
                            name="name"
                            icon={User}
                            value={data.name}
                            placeholder={t('campos.nomePlaceholder')}
                            autoComplete="name"
                            autoFocus
                            error={errors.name}
                            onChange={(event) =>
                                setData(
                                    'name',
                                    event.target.value,
                                )
                            }
                        />

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
                            className="mt-5"
                            onChange={(event) =>
                                setData(
                                    'email',
                                    event.target.value,
                                )
                            }
                        />

                        <PasswordField
                            id="password"
                            label={t('campos.senha')}
                            name="password"
                            value={data.password}
                            placeholder={t('campos.criarSenhaPlaceholder')}
                            error={errors.password}
                            className="mt-5"
                            onChange={(event) =>
                                setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        >
                            <PasswordStrength
                                password={data.password}
                            />
                        </PasswordField>

                        <PasswordField
                            id="password_confirmation"
                            label={t('campos.confirmarSenha')}
                            name="password_confirmation"
                            value={
                                data.password_confirmation
                            }
                            placeholder={t('campos.confirmarSenhaPlaceholder')}
                            validationState={
                                confirmationState
                            }
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
                        >
                            <PasswordMatchMessage
                                confirmation={
                                    data.password_confirmation
                                }
                                matches={passwordsMatch}
                            />
                        </PasswordField>

                        <TermsAgreement
                            accepted={data.terms}
                            onChange={handleTermsChange}
                            showError={
                                (attemptedSubmit &&
                                    !data.terms) ||
                                Boolean(errors.terms)
                            }
                        />
                        <AuthActions
                            processing={processing}
                            disabled={!data.terms}
                            submitText={t('registo.criarConta')}
                            processingText={t('registo.aCriarConta')}
                            submitIcon={UserPlus}
                            googleText={t('registo.registarComGoogle')}
                            onGoogleClick={() => {
                                window.location.href = route('google.redirect');
                            }}
                        />
                    </AuthCard>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    {t('registo.jaTemConta')}{' '}

                    <Link
                        href={route('login')}
                        className="
                            font-semibold
                            text-[#0F9E90]
                            underline-offset-4
                            transition
                            hover:underline
                            dark:text-[#5EEAD4]
                        "
                    >
                        {t('registo.iniciarSessao')}
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
