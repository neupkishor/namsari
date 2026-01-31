import React from 'react';
import ExploreClient from './ExploreClient';
import { getSession } from '@/lib/auth';

export default async function ExplorePage() {
    const session = await getSession();
    return <ExploreClient initialUser={session} />;
}
