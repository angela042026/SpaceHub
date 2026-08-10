import { useState } from 'react';

import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import Footer from '@/Components/Footer';
import Toast from '@/Components/Toast';
import ChatWidget from '@/Components/Chat/ChatWidget';

export default function DashboardLayout({ children, header = true }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface lg:flex">
            <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

            <main className="spacehub-page-bg min-h-screen flex-1 print:pl-0">
                <div className="mx-auto max-w-[1660px] px-5 py-6 sm:px-7 lg:px-9 print:px-0 print:py-0">
                    {header && (
                        <div className="print:hidden">
                            <DashboardHeader onOpenNav={() => setMobileNavOpen(true)} />
                        </div>
                    )}

                    <div className="space-y-6">
                        {children}
                    </div>

                    <div className="print:hidden">
                        <Footer />
                    </div>
                </div>
            </main>

            <Toast />

            <ChatWidget />
        </div>
    );
}
