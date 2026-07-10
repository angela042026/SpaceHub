import { useState } from 'react';

import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';

export default function DashboardLayout({ children, header = true }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F7FAFC]">
            <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <main className="min-h-screen lg:pl-72">
                <div className="mx-auto max-w-[1660px] px-5 py-6 sm:px-7 lg:px-9">
                    {header && (
                        <DashboardHeader onOpenNav={() => setMobileNavOpen(true)} />
                    )}

                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
