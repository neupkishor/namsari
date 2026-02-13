import React from 'react';
import { getSystemSettings } from './actions';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const settings = await getSystemSettings();

    return (
        <main>
            <SettingsClient settings={settings} />
        </main>
    );
}
