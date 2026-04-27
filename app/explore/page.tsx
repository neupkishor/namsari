import React from 'react';
import ExploreClient from '@/app/explore/ExploreClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function ExplorePage(props: { searchParams: Promise<{ q?: string; rawQuery?: string; view?: string; type?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    const user = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;
    const cookieStore = await cookies();
    const savedExploreView = cookieStore.get('explore_view')?.value;
    const requestedType = searchParams.type || (searchParams.view === 'map' ? 'map' : searchParams.view === 'list' ? 'feed' : undefined);
    const initialShowMap = requestedType ? requestedType === 'map' : savedExploreView === 'map';

    return (
        <ExploreClient
            initialUser={user}
            initialQuery={searchParams.rawQuery || searchParams.q || ''}
            initialShowMap={initialShowMap}
        />
    );
}
