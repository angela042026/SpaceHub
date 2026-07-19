import { usePage } from '@inertiajs/react';

export default function PrintHeader({ title, subtitle, geradoEm }) {
    const { auth } = usePage().props;

    return (
        <div className="hidden print:mb-8 print:flex print:items-center print:justify-between print:border-b print:border-slate-300 print:pb-4">
            <div className="flex items-center gap-3">
                <img src="/images/logo/logo.png" alt="SpaceHub" className="h-10 w-auto" />

                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="text-right text-xs text-slate-500">
                <p>Gerado em {geradoEm}</p>
                <p>Por {auth.user?.name ?? '-'}</p>
            </div>
        </div>
    );
}
