import { getPropertyTypeCounts, updatePropertyTypeCount, syncPropertyTypeCounts } from '@/actions/settings';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const session = await getSession();
    if (!session || session.type !== 'admin') {
        redirect('/manage');
    }

    const propertyTypes = await getPropertyTypeCounts();

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    System Settings
                </h1>
                <p style={{ color: '#64748b' }}>Manage global configurations and cached data.</p>
            </div>

            <SettingsClient propertyTypes={propertyTypes} />
        </div>
    );
}