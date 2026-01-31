import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SellClient from './SellClient';

export default async function SellPage() {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login');
    }

    const userId = Number(session.id);

    // Fetch all users for owner/authorized person selection
    // In a real app, you might limit this to users relevant to the agent or verified owners
    const users = await prisma.user.findMany({
        include: { kyc: true } as any,
        orderBy: { name: 'asc' }
    });

    const currentUser = users.find(u => u.id === userId);

    return (
        <SellClient
            users={(users as any[]).map(u => ({
                id: u.id,
                name: u.name,
                email: u.kyc?.email || '',
                phone: u.kyc?.phone || u.contact_number || ''
            }))}
            currentUserId={userId}
        />
    );
}
