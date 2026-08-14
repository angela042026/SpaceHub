/**
 * Ícone oficial do Google Calendar (public/images/logo/google-calendar-icon.png)
 * — usado nos pontos da app que mostram a ligação/sincronização com o
 * Google Calendar, em vez de um ícone genérico de calendário.
 */
export default function GoogleCalendarIcon({ size = 22, className = '' }) {
    return (
        <img
            src="/images/logo/google-calendar-icon.png"
            alt="Google Calendar"
            width={size}
            height={size}
            className={className}
        />
    );
}
