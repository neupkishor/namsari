import React from 'react';
import SearchClient from './SearchClient';
import { getSession } from '@/lib/auth';
import { getBrowseProperties } from '@/lib/services/property-browser';

export const metadata = {
    title: 'Search | Namsari',
    description: 'Search properties in feed view',
};

export default async function SearchPage(props: { searchParams: Promise<{ q?: string; rawQuery?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    const user = session ? await import('@/lib/prisma').then(({ default: db }) => db.user.findUnique({ where: { id: Number(session.id) } })) : null;
    const properties = await getBrowseProperties(60);

    return (
        <SearchClient
            initialUser={user}
            initialQuery={searchParams.rawQuery || searchParams.q || ''}
            initialProperties={properties}
        />
    );
}