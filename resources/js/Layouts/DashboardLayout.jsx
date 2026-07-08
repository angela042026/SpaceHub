import { useState } from 'react';

import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';

export default function DashboardLayout({ children, header = true }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <main className="min-h-screen lg:pl-72">
                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
                    {header && (
                        <DashboardHeader onOpenNav={() => setMobileNavOpen(true)} />
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
