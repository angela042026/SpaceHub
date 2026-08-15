// Lista sincronizada com Rule::in(...) em StoreSetorRequest/UpdateSetorRequest.
// Os values são os valores reais guardados na coluna `tipo` da tabela
// `setores`; os labels são apenas a apresentação em português.
export const TIPOS_SETOR = [
    { value: 'open_space', label: 'Open Space' },
    { value: 'escritorio', label: 'Escritório' },
    { value: 'escritorio_executivo', label: 'Escritório Executivo' },
    { value: 'sala_reunioes', label: 'Sala de Reuniões' },
    { value: 'sala_criativa', label: 'Sala Criativa' },
    { value: 'phone_booth', label: 'Phone Booth' },
    { value: 'rececao', label: 'Receção' },
    { value: 'copa', label: 'Copa' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'sala_espera', label: 'Sala de Espera' },
    { value: 'wc', label: 'Instalações Sanitárias' },
    { value: 'estacionamento', label: 'Estacionamento' },
    { value: 'tecnico', label: 'Sala Técnica' },
    { value: 'outro', label: 'Outro' },
];

export function tipoSetorLabel(tipo) {
    return TIPOS_SETOR.find((item) => item.value === tipo)?.label ?? tipo ?? '-';
}
