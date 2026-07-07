export default function OfficeMap({ selectedFloor, setSelectedFloor }) {
    const floors = {
        garagem: {
            label: 'Garagem',
            image: '/images/maps/Piso-1Garagem.png',
        },
        piso0: {
            label: 'Piso 0',
            image: '/images/maps/Piso0.png',
        },
        piso1: {
            label: 'Piso 1',
            image: '/images/maps/Piso1.png',
        },
        piso2: {
            label: 'Piso 2 / Terraço',
            image: '/images/maps/Piso2Terraco.png',
        },
    };

    const currentFloor = floors[selectedFloor];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Mapa do Escritório
                    </h2>

                    <p className="text-sm text-slate-500">
                        Planta atual: {currentFloor.label}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                        <option>Braga</option>
                    </select>

                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    >
                        <option value="garagem">Garagem</option>
                        <option value="piso0">Piso 0</option>
                        <option value="piso1">Piso 1</option>
                        <option value="piso2">Piso 2 / Terraço</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                    src={currentFloor.image}
                    alt={currentFloor.label}
                    className="h-[430px] w-full object-contain"
                />
            </div>
        </div>
    );
}
