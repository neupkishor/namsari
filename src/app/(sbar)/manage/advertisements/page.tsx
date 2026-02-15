import React from 'react';
import { getAdvertisements } from '@/actions/advertisements';
import AdvertisementManager from '@/app/(sbar)/manage/advertisements/Client';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ManageAdvertisementsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Only Admins can manage advertisements
    if (user.type !== 'admin') {
        redirect('/manage');
    }

    const ads = await getAdvertisements();

    return <AdvertisementManager initialAds={ads} />;
}
