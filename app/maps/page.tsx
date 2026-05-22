import React from 'react';
import MapsClient from './MapsClient';
import { getSession } from '@/lib/auth';
import { getBrowseProperties } from '@/lib/services/property-browser';

export const metadata = {
    title: 'Maps | Namsari',
    description: 'Browse properties on the map',
};

export default async function MapsPage(props: { searchParams: Promise<{ q?: string; rawQuery?: string; type?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    const user = session ? await import('@/lib/prisma').then(({ default: db }) => db.user.findUnique({ where: { id: Number(session.id) } })) : null;
    const properties = await getBrowseProperties(80, { onlyMappable: true });

    return (
        <MapsClient
            initialUser={user}
            initialQuery={searchParams.rawQuery || searchParams.q || ''}
            initialProperties={properties}
        />
    );
}
