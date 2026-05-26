import React from 'react';
import { getAboutContent } from '@/actions/about';
import AboutManagementClient from '@/app/(sbar)/manage/about/AboutManagementClient';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function ManageAboutPage() {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    if (user.type !== 'admin' && !user.role?.role?.toLowerCase().includes('admin')) {
        redirect('/manage');
    }

    const initialData = await getAboutContent();

    return <AboutManagementClient initialData={initialData} />;
}
