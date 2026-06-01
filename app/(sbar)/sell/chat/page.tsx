import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';
import ChatListingClient from './ChatListingClient';

export default async function SellChatPage() {
    const session = await getSession();

    if (!session?.id) {
        return (
            <LoginPromptCard
                title="Start listing with chat"
                description="Please log in to use the property listing assistant."
            />
        );
    }

    const user = await prisma.user.findUnique({ where: { id: Number(session.id) } });

    if (!user) {
        redirect('/auth/login');
    }

    return <ChatListingClient currentUser={user} />;
}
