import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import SellClient from './SellClient';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';
import { redirect } from 'next/navigation';
import {
    createBlankPropertyDraftChanges,
    createPropertyDraftChangesFromProperty,
    normalizePropertyDraftChanges,
} from './draft-utils';
import {
    getLatestPropertyDraftForUser,
    getPropertyDraftById,
} from './actions/drafts';

export default async function SellPage({ searchParams }: { searchParams: Promise<{ purpose?: string; id?: string }> }) {
    const { purpose, id } = await searchParams;
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

    if (!user) {
        redirect('/auth/login');
    }

    const db = prisma as any;
    const draftId = id ? Number(id) : NaN;
    let draft: any = null;

    if (Number.isFinite(draftId)) {
        draft = await getPropertyDraftById(draftId, userId);

        if (!draft) {
            const property = await db.property.findFirst({
                where: { id: draftId },
                include: {
                    listedBy: true,
                    types: true,
                    purposes: true,
                    natures: true,
                    location: true,
                    pricing: true,
                    features: true,
                    images: true,
                },
            });

            const canSeedFromProperty = property && (
                property.listedById === userId ||
                user.type === 'admin' ||
                (user.type === 'agency' && (property?.listedBy as any)?.agency_id === userId)
            );

            if (canSeedFromProperty) {
                draft = await db.propertyDraft.create({
                    data: {
                        changes: createPropertyDraftChangesFromProperty(property, purpose),
                        doing: 'edit',
                        status: 'draft',
                        created_by: userId,
                        account_id: userId,
                    },
                });

                redirect(`/sell?id=${draft.id}`);
            }
        }
    }

    if (!draft) {
        draft = await getLatestPropertyDraftForUser(userId);

        if (draft) {
            redirect(`/sell?id=${draft.id}`);
        }

        draft = await db.propertyDraft.create({
            data: {
                changes: createBlankPropertyDraftChanges(purpose),
                doing: 'creation',
                status: 'draft',
                created_by: userId,
                account_id: userId,
            },
        });

        redirect(`/sell?id=${draft.id}`);
    }

    const initialDraft = {
        id: draft.id,
        doing: draft.doing,
        status: draft.status,
        changes: normalizePropertyDraftChanges(draft.changes as any, purpose),
        created_at: draft.created_at,
        updated_at: draft.updated_at,
    };

    return (
        <SellClient
            currentUser={user}
            initialPurpose={purpose}
            initialDraft={initialDraft}
        />
    );
}
