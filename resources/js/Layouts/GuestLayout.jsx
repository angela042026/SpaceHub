import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-surface pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24 object-contain" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white px-6 py-4 shadow-card sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
