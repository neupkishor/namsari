import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import RequirementsClient from './RequirementsClient';

export const metadata = {
    title: 'Post Requirements | Namsari',
    description: 'Post your property requirements and find your dream home in Nepal.',
};

export default async function RequirementsPage() {
    const session = await getSession();
    const user = session ? await prisma.user.findUnique({ where: { id: Number(session.id) } }) : null;

    return <RequirementsClient currentUser={user} />;
}
