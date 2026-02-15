import React from 'react';
import { getAboutContent } from '@/actions/about';
import AboutManagementClient from '@/app/(sbar)/manage/about/AboutManagementClient';

export default async function ManageAboutPage() {
    const initialData = await getAboutContent();

    return <AboutManagementClient initialData={initialData} />;
}
