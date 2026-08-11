import { MapPin } from 'lucide-react';

/**
 * Linha de localização partilhada pelos cartões de espaço em "Reservar
 * Espaço", "Minhas Reservas" e "Editar Reserva" — sempre no formato
 * "{edifício} · Piso {número}", para as três páginas ficarem idênticas
 * ao ícone, tamanho, cor e espaçamento.
 */
export default function LocalizacaoEspaco({ secretaria, className = '' }) {
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
                className="shrink-0 text-slate-400 dark:text-slate-500"
            />

            <span className="min-w-0 flex-1 truncate">
                {nomeEdificio ?? '-'}
                {numeroPiso != null && ` · Piso ${numeroPiso}`}
            </span>
        </p>
    );
}
