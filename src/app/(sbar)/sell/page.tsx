import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import SellClient from './SellClient';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';

export default async function SellPage() {
    const session = await getSession();
    if (!session || !session.id) {
        return (
            <LoginPromptCard 
                title="Start Selling Today" 
                description="Please login to list your properties and reach potential buyers." 
            />
        );
    }

    const userId = Number(session.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Fetch all users for owner/authorized person selection
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <SellClient
            currentUser={user}
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
