import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthField from '@/Components/Auth/AuthField';
import AuthLayout from '@/Components/Auth/AuthLayout';
import PasswordField from '@/Components/Auth/PasswordField';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    Mail,
} from 'lucide-react';

export default function ResetPassword({ token, email }) {
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
            <Head title="Redefinir senha" />

            <AuthLayout
                title="Crie uma nova"
                highlightedTitle="senha"
                subtitle="Escolha uma senha forte para voltar a aceder à sua conta."
                heroTitle="Nova senha."
                heroPrefix="Proteja a sua"
                heroHighlightedTitle="conta."
                heroDescription="A sua nova senha será utilizada nos próximos acessos ao SpaceHub."
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
                                Introduza uma nova senha e confirme-a
                                para concluir a recuperação da conta.
                            </p>
                        </div>

                        <AuthField
                            id="email"
                            label="E-mail"
                            name="email"
                            type="email"
                            icon={Mail}
                            value={data.email}
                            placeholder="exemplo@spacehub.pt"
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
                            label="Nova senha"
                            name="password"
                            value={data.password}
                            placeholder="Introduza a nova senha"
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
                            label="Confirmar nova senha"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Confirme a nova senha"
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
                            submitText="Redefinir senha"
                            processingText="A guardar..."
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
                    Lembrou-se da senha?{' '}

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
                        Voltar ao login
                    </Link>
                </p>
            </AuthLayout>
        </>
    );
}
