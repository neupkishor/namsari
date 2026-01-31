import React from 'react';
import prisma from '@/lib/prisma';
import AgencyManagementClient from './AgencyManagementClient';

export default async function AgencyManagementPage() {
    // Fetching agencies from the database
    const agencies = await (prisma as any).agency.findMany({
        orderBy: { created_at: 'desc' }
    });

    return (
        <main>
            <AgencyManagementClient agencies={agencies} />
        </main>
    );
}
