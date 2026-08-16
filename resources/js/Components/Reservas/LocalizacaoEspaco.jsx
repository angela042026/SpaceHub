import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Linha de localização partilhada pelos cartões de espaço em "Reservar
 * Espaço", "Minhas Reservas" e "Editar Reserva" — sempre no formato
 * "{edifício} · Piso {número}", para as três páginas ficarem idênticas
 * ao ícone, tamanho, cor e espaçamento.
 */
export default function LocalizacaoEspaco({
    secretaria,
    className = '',
    iconeClassName = 'text-slate-400 dark:text-slate-500',
}) {
    const { t } = useTranslation('reservas');
    const nomeEdificio = secretaria?.setor?.piso?.edificio?.nome;
    const numeroPiso = secretaria?.setor?.piso?.numero;

    if (!nomeEdificio && numeroPiso == null) {
        return null;
    }

    return (
        <p
            className={`flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 ${className}`}
        >
            <MapPin
                size={14}
                strokeWidth={1.9}
                className={`shrink-0 ${iconeClassName}`}
            />

            <span className="min-w-0 flex-1 truncate">
                {nomeEdificio ?? '-'}
                {numeroPiso != null && ` · ${t('localizacao.piso', { numero: numeroPiso })}`}
            </span>
        </p>
    );
}
