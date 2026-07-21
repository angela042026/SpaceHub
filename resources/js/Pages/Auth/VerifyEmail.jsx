import AuthActions from '@/Components/Auth/AuthActions';
import AuthCard from '@/Components/Auth/AuthCard';
import AuthLayout from '@/Components/Auth/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    LogOut,
    MailCheck,
} from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (event) => {
        event.preventDefault();

        post(route('verification.send'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Verificação de e-mail" />

            <AuthLayout
                title="Verifique o seu"
                highlightedTitle="e-mail"
                subtitle="Antes de continuar, confirme o endereço de e-mail associado à sua conta."
                heroTitle="Quase terminado."
                heroPrefix="Falta apenas"
                heroHighlightedTitle="um passo."
                heroDescription="Clique no link enviado para o seu e-mail para ativar a sua conta no SpaceHub."
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
                        Foi enviado um novo link de verificação para o seu
                        endereço de e-mail.
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
                                Obrigado por se registar! Antes de começar,
                                confirme o seu endereço de e-mail clicando no
                                link que enviámos. Caso não o tenha recebido,
                                pode solicitar um novo.
                            </p>
                        </div>

                        <AuthActions
                            processing={processing}
                            submitText="Reenviar e-mail de verificação"
                            processingText="A enviar..."
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

                        Terminar sessão
                    </Link>
                </div>
            </AuthLayout>
        </>
    );
}
