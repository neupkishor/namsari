import React from 'react';
import { getAboutContent } from '@/actions/about';
import AboutManagementClient from '@/app/manage/about/AboutManagementClient';

export default async function ManageAboutPage() {
    const initialData = await getAboutContent();

    return <AboutManagementClient initialData={initialData} />;
}
