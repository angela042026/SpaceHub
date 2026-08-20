import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp } from 'lucide-react';

// Só cuida da própria visibilidade e aparência — a posição fixa e o
// espaçamento em relação ao botão de cookies são geridos pelo grupo
// flutuante que o envolve (LeftFloatingActions).
//
// Visibilidade: não usa uma distância de scroll fixa (a posição das
// secções muda com o tamanho do ecrã) — em vez disso observa a
// secção "Benefícios" (#beneficios). A seta aparece assim que essa
// secção começa a entrar no ecrã e mantém-se visível daí em diante
// (inclui Contacto e rodapé, que vêm depois); só volta a esconder-se
// se o utilizador subir de novo para antes da secção Benefícios.
export default function ScrollToTopButton() {
    const { t } = useTranslation('landing');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const secaoBeneficios =
            document.getElementById('beneficios');

        if (!secaoBeneficios) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    return;
                }

                // Não está a intersetar: se o topo da secção está
                // acima do ecrã (valor negativo) é porque já a
                // ultrapassámos a descer — mantém a seta visível.
                // Se está abaixo do ecrã, ainda não lá chegámos (ou
                // subimos de novo para antes dela) — esconde.
                setVisible(
                    entry.boundingClientRect.top < 0,
                );
            },
            { threshold: 0 },
        );

        observer.observe(secaoBeneficios);

        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className="group relative">
            <button
                type="button"
                onClick={scrollToTop}
                aria-label={t('cookies.voltarAoTopo')}
                tabIndex={visible ? 0 : -1}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#03172B]/95 text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#14B8A6]/40 hover:bg-[#14B8A6] hover:text-[#03172B] hover:shadow-[#14B8A6]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03172B] active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    visible
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-3 opacity-0'
                }`}
            >
                <ChevronUp className="h-5 w-5" />
            </button>

            <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#03172B] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            >
                {t('cookies.voltarAoTopo')}
            </span>
        </div>
    );
}
