import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
} from 'react-icons/fa';

export default function Footer() {
    const { t } = useTranslation('landing');
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: t('nav.funcionalidades'), href: '#funcionalidades' },
        { label: t('nav.comoReservar'), href: '#como-funciona' },
        { label: t('nav.espacos'), href: '#espacos' },
        { label: t('nav.precos'), href: '#precos' },
        { label: t('nav.beneficios'), href: '#beneficios' },
    ];

    const legalLinks = [
        { label: t('footer.termosDeUtilizacao'), routeName: 'legal.terms' },
        { label: t('footer.politicaDePrivacidade'), routeName: 'legal.privacy' },
        { label: t('footer.politicaDeCookies'), routeName: 'legal.cookies' },
    ];

    const socialLinks = [
        { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: FaLinkedinIn },
        { label: 'Instagram', href: 'https://www.instagram.com', icon: FaInstagram },
        { label: 'Facebook', href: 'https://www.facebook.com', icon: FaFacebookF },
    ];

    const scrollToSection = (href) => {
        const section = document.querySelector(href);

        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <footer
            id="contacto"
            className="scroll-mt-[74px] bg-[#04162A] px-5 pt-14 text-white sm:px-8 lg:px-10 lg:pt-16"
        >
            <div className="mx-auto max-w-[1450px]">
                <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:gap-14">
                    {/* Marca */}
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center"
                            aria-label={t('nav.paginaInicial')}
                        >
                            <img
                                src="/images/logo/logobranco.png"
                                alt="SpaceHub"
                                className="h-12 w-auto object-contain sm:h-14"
                            />
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
                            {t('footer.descricao')}
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            {socialLinks.map(
                                ({
                                    label,
                                    href,
                                    icon: Icon,
                                }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#14B8A6] hover:text-[#04162A]"
                                    >
                                        <Icon size={17} />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Navegação */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4]">
                            {t('footer.navegacao')}
                        </h3>

                        <nav
                            className="mt-5 flex flex-col gap-3"
                            aria-label="Navegação do rodapé"
                        >
                            {quickLinks.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        scrollToSection(item.href);
                                    }}
                                    className="w-fit text-left text-sm text-slate-300 transition-all duration-300 hover:translate-x-1 hover:text-[#5EEAD4]"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Informações */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4]">
                            {t('footer.informacoes')}
                        </h3>

                        <nav className="mt-5 flex flex-col gap-3">
                            {legalLinks.map((item) => (
                                <Link
                                    key={item.label}
                                    href={route(item.routeName)}
                                    className="w-fit text-sm text-slate-300 transition-all duration-300 hover:translate-x-1 hover:text-[#5EEAD4]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5EEAD4]">
                            {t('footer.contacto')}
                        </h3>

                        <div className="mt-5 space-y-4">
                            <a
                                href="mailto:spacehubbraga@gmail.com"
                                className="group flex items-center gap-3 text-sm text-slate-300 transition-colors duration-300 hover:text-[#5EEAD4]"
                            >
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-white transition group-hover:bg-[#14B8A6]/10">
                                    <Mail size={17} />
                                </div>

                                <span>spacehubbraga@gmail.com</span>
                            </a>

                            <a
                                href="tel:+351000000000"
                                className="group flex items-center gap-3 text-sm text-slate-300 transition-colors duration-300 hover:text-[#5EEAD4]"
                            >
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-white transition group-hover:bg-[#14B8A6]/10">
                                    <Phone size={17} />
                                </div>

                                <span>+351 253 000 000</span>
                            </a>

                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-white">
                                    <MapPin size={17} />
                                </div>

                                <span>{t('footer.morada')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linha inferior */}
                <div className="py-6 text-center text-xs text-slate-400">
                    <p>
                        {t('footer.direitosReservados', { ano: currentYear })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
