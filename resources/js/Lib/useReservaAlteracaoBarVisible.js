import { useEffect, useState } from 'react';
import { RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT } from '@/Lib/reservaAlteracaoBar';

export default function useReservaAlteracaoBarVisible() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleVisibility = (event) => {
            setVisible(event.detail.visible);
        };

        window.addEventListener(
            RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT,
            handleVisibility,
        );

        return () =>
            window.removeEventListener(
                RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT,
                handleVisibility,
            );
    }, []);

    return visible;
}
