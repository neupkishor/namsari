import { getSiteSettings } from '@/actions/settings';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SiteClient from './SiteClient';

export default async function SitePage() {
    const session = await getSession();
    if (!session || session.type !== 'admin') redirect('/manage');

    const settings = await getSiteSettings();

    return (
        <div className="layout-container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    Site Sections
                </h1>
                <p style={{ color: '#64748b' }}>Control which sections are visible on the homepage.</p>
            </div>
            <SiteClient settings={settings} />
        </div>
    );
}
