import { useState } from 'react';

import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import Footer from '@/Components/Footer';
import Toast from '@/Components/Toast';

export default function DashboardLayout({ children, header = true }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <main className="min-h-screen lg:pl-72">
                <div className="mx-auto max-w-[1660px] px-5 py-6 sm:px-7 lg:px-9">
                    {header && (
                        <DashboardHeader onOpenNav={() => setMobileNavOpen(true)} />
                    )}

                    <div className="space-y-6">
                        {children}
                    </div>

                    <Footer />
                </div>
            </main>

            <Toast />
        </div>
    );
}
