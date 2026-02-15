import React from 'react';
import { getAdvertisements } from '@/actions/advertisements';
import AdvertisementManager from '@/app/(sbar)/manage/advertisements/Client';

export const dynamic = 'force-dynamic';

export default async function ManageAdvertisementsPage() {
    const ads = await getAdvertisements();

    return <AdvertisementManager initialAds={ads} />;
}
