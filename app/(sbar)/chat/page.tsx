import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';
import ChatListingClient from './ChatListingClient';
import { AI_AGENT_OCCUPIED_MESSAGE, runPropertyChatTurn } from '@/lib/ai/property-chat';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';

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

    const initialTurn = await runPropertyChatTurn({
        messages: [],
        draft: {},
        defaultRate: getDefaultPropertyPriceRate(),
        userContext: {
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                type: user.type,
            },
            properties: recentProperties.map((property) => ({
                id: property.id,
                title: property.title,
                status: property.status,
                district: property.location?.district || null,
                cityVillage: property.location?.cityVillage || null,
            })),
            requirements: recentRequirements,
        },
    }).catch(() => ({
        assistantMessage: AI_AGENT_OCCUPIED_MESSAGE,
        draft: {},
        missingFields: [],
        readyToCreate: false,
    }));

    return (
        <ChatListingClient
            currentUser={user}
            initialAssistantMessage={initialTurn.assistantMessage}
            initialDraft={initialTurn.draft}
            contextSummary={{
                propertyCount,
                requirementCount,
                recentProperties,
                recentRequirements,
            }}
        />
    );
}
