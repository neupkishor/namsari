import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import SellClient from './SellClient';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';

export default async function SellPage({ searchParams }: { searchParams: Promise<{ purpose?: string }> }) {
    const { purpose } = await searchParams;
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

    return (
        <SellClient
            currentUser={user}
            initialPurpose={purpose}
        />
    );
}
