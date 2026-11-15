import React from 'react';
import SearchClient from './layout.client';
import { getSession } from '@/lib/auth';
import { getProperties } from '@/services/properties/getProperties';

export const metadata = {
    title: 'Search | Namsari',
    description: 'Search properties in feed view',
};

export default async function SearchPage(props: { searchParams: Promise<{ q?: string; rawQuery?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    const user = session ? await import('@/lib/prisma').then(({ default: db }) => db.user.findUnique({ where: { id: Number(session.id) } })) : null;
    const properties = await getProperties({ limit: 200, pricedOnly: false });

    return (
        <SearchClient
            initialUser={user}
            initialQuery={searchParams.rawQuery || searchParams.q || ''}
            initialProperties={properties}
        />
    );
}
