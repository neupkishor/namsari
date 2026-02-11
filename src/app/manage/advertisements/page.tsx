import React from 'react';
import { getAdvertisements } from './actions';
import AdvertisementManager from './Client';

export const dynamic = 'force-dynamic';

export default async function ManageAdvertisementsPage() {
    const ads = await getAdvertisements();

    return <AdvertisementManager initialAds={ads} />;
}
