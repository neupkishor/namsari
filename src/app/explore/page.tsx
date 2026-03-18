import React from 'react';
import ExploreClient from '@/app/explore/ExploreClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function ExplorePage(props: { searchParams: Promise<{ q?: string; view?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    const user = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;
    const cookieStore = await cookies();
    const savedExploreView = cookieStore.get('explore_view')?.value;
    const initialShowMap = searchParams.view === 'map' || (!searchParams.view && savedExploreView === 'map');

    return (
        <ExploreClient
            initialUser={user}
            initialQuery={searchParams.q || ''}
            initialShowMap={initialShowMap}
        />
    );
}
