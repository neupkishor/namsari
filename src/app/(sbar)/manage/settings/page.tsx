import React from 'react';
import { getSystemSettings } from '@/actions/settings';
import SettingsClient from '@/app/(sbar)/manage/settings/SettingsClient';

export default async function SettingsPage() {
    const settings = await getSystemSettings();

    return (
        <main>
            <SettingsClient settings={settings} />
        </main>
    );
}
