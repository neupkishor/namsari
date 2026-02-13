import React from 'react';
import { getAboutContent } from './actions';
import AboutManagementClient from './AboutManagementClient';

export default async function ManageAboutPage() {
    const initialData = await getAboutContent();

    return <AboutManagementClient initialData={initialData} />;
}
