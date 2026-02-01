import React from 'react';
import ExploreClient from './ExploreClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function ExplorePage() {
    const session = await getSession();
    const user = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;
    return <ExploreClient initialUser={user} />;
}
