import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthField from '@/Components/Auth/AuthField';
import AuthLayout from '@/Components/Auth/AuthLayout';
import Checkbox from '@/Components/Checkbox';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    LogIn,
    Mail,
} from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('login'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sessão" />

            <AuthLayout
                title="Bem-vindo de"
                highlightedTitle="volta!"
                subtitle="Faça login para aceder à sua conta e gerir os seus espaços de trabalho."
                heroTitle="Acesso seguro."
                heroPrefix="Gestão"
                heroHighlightedTitle="inteligente."
                heroDescription="Os seus dados e espaços estão protegidos com a máxima segurança."
            >
                {status && (
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
                        {status}
                    </output>
                )}

                <form
                    onSubmit={submit}
                    noValidate
                >
                    <AuthCard>
                        <AuthField
                            id="email"
                            label="E-mail"
                            name="email"
                            type="email"
                            icon={Mail}
                            value={data.email}
                            placeholder="exemplo@spacehub.pt"
                            autoComplete="username"
                            autoFocus
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
                            label="Senha"
                            name="password"
                            value={data.password}
                            placeholder="Introduza a sua senha"
                            autoComplete="current-password"
                            error={errors.password}
                            className="mt-5"
                            onChange={(event) =>
                                setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                        >
                            {canResetPassword && (
                                <div className="mt-2 text-right">
                                    <Link
                                        href={route(
                                            'password.request',
                                        )}
                                        className="
                                            text-xs font-semibold
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
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                            )}
                        </PasswordField>

                        <label
                            htmlFor="remember"
                            className="
                                mt-5 flex cursor-pointer
                                items-center gap-3
                                text-sm text-slate-700
                                dark:text-slate-200
                            "
                        >
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onChange={(event) =>
                                    setData(
                                        'remember',
                                        event.target.checked,
                                    )
                                }
                                className="
                                    h-4 w-4 rounded
                                    border-slate-300
                                    text-[#14B8A6]
                                    focus:ring-[#14B8A6]
                                    dark:border-white/20
                                    dark:bg-[#071A30]
                                "
                            />

                            <span>Lembrar-me</span>
                        </label>

                        <AuthActions
                            processing={processing}
                            submitText="Entrar"
                            processingText="A entrar..."
                            submitIcon={LogIn}
                            googleText="Entrar com Google"
                            onGoogleClick={() => {
                                window.location.href = route('google.redirect');
                            }}
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
                    Ainda não tem conta?{' '}

                    <Link
                        href={route('register')}
                        className="
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
                        Registe-se
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
