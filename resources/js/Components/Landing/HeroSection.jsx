import { Link, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { CalendarPlus, MapPin } from "lucide-react";

export default function HeroSection() {
    const { t } = useTranslation("landing");
    const { auth } = usePage().props;

    const scrollToSpaces = () => {
        document.querySelector("#espacos")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <section className="relative overflow-hidden bg-[#03172B] pt-[82px] text-white">
            {/* Background */}
            <div className="absolute inset-0">
                <picture>
                    <source
                        srcSet="/images/landing/espaco-comum.webp"
                        type="image/webp"
                    />

                    <img
                        src="/images/landing/espaco-comum.png"
                        alt={t("hero.imagemAlt")}
                        fetchpriority="high"
                        className="h-full w-full object-cover object-center"
                    />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-r from-[#03172B]/95 via-[#03172B]/70 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#03172B]/35 via-transparent to-transparent" />
            </div>

            {/* Conteúdo */}
            <div className="relative mx-auto flex min-h-[calc(100svh-82px)] max-w-[1500px] items-center px-5 py-12 sm:min-h-[640px] sm:px-6 sm:py-16 lg:min-h-[720px] lg:px-10 lg:py-28">
                <div className="max-w-3xl">
                    <h1 className="text-[28px] font-black leading-[1.08] tracking-[-0.03em] text-white sm:hidden">
                        <span className="block">
                            {t("hero.tituloMobileLinha1")}
                        </span>
                        <span className="block">
                            {t("hero.tituloMobileLinha2")}
                        </span>
                        <span className="block text-[#14B8A6]">
                            {t("hero.tituloDestaque")}
                        </span>
                    </h1>

                    <h1 className="hidden font-black leading-[1.02] tracking-[-0.03em] text-white sm:block sm:text-[43px] lg:text-[54px] xl:text-[58px]">
                        {t("hero.tituloLinha1")}
                        <br />
                        {t("hero.tituloLinha2")}{" "}
                        <span className="text-[#14B8A6]">
                            {t("hero.tituloDestaque")}
                        </span>
                    </h1>

                    <p className="mt-4 max-w-[32rem] text-[15px] leading-6 text-slate-200 sm:hidden">
                        {t("hero.descricaoMobile")}
                    </p>

                    <p className="mt-7 hidden max-w-xl text-lg leading-8 text-slate-200 sm:block">
                        {t("hero.descricao")}
                    </p>

                    <div className="mt-6 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
                        <Link
                            href={
                                auth?.user
                                    ? route("reservas.create")
                                    : route("login")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#14B8A6]/80 px-4 py-2.5 text-sm font-semibold text-[#03172B] shadow-lg shadow-[#14B8A6]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#14B8A6] hover:shadow-[#14B8A6]/40 active:translate-y-0 sm:px-6 sm:text-base"
                        >
                            <CalendarPlus className="h-[18px] w-[18px]" />

                            {auth?.user
                                ? t("hero.ctaReservar")
                                : t("hero.ctaEntrarReservar")}
                        </Link>

                        <button
                            type="button"
                            onClick={scrollToSpaces}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/50 hover:bg-white/10 hover:text-[#14B8A6] active:translate-y-0 sm:px-6 sm:text-base"
                        >
                            <MapPin className="h-[18px] w-[18px]" />

                            {t("hero.ctaConhecerEspacos")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#03172B] to-transparent lg:h-36" />
        </section>
    );
}
