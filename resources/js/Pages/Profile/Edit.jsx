import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import GoogleCalendarForm from './Partials/GoogleCalendarForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, googleCalendarConectado }) {
    return (
        <DashboardLayout>
            <Head title="Definições" />

            <div className="space-y-6">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />

                <GoogleCalendarForm conectado={googleCalendarConectado} />

                <UpdatePasswordForm />

                <DeleteUserForm />
            </div>
        </DashboardLayout>
    );
}
