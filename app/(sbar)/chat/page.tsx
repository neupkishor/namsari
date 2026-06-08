import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';
import ChatListingClient from './ChatListingClient';

export default async function ChatPage() {
    const session = await getSession();

    if (!session?.id) {
        return (
            <LoginPromptCard
                title="Start listing with chat"
                description="Please log in to use the property listing assistant."
            />
        );
    }

    const userId = Number(session.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        redirect('/auth/login');
    }

    const [propertyCount, requirementCount, recentProperties, recentRequirements] = await Promise.all([
        prisma.property.count({ where: { listedById: userId } }),
        prisma.requirement.count({ where: { userId } }),
        prisma.property.findMany({
            where: { listedById: userId },
            orderBy: { created_on: 'desc' },
            take: 3,
            select: {
                id: true,
                title: true,
                status: true,
                location: {
                    select: {
                        district: true,
                        cityVillage: true,
                    },
                },
            },
        }),
        prisma.requirement.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' },
            take: 3,
            select: {
                id: true,
                content: true,
                propertyTypes: true,
                purposes: true,
                district: true,
                cityVillage: true,
                status: true,
            },
        }),
    ]);

    return (
        <ChatListingClient
            currentUser={user}
            initialAssistantMessage="Please share what you&apos;d like to do."
            initialDraft={{}}
            contextSummary={{
                propertyCount,
                requirementCount,
                recentProperties,
                recentRequirements,
            }}
        />
    );
}
