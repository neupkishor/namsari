"use server";

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { PropertyDraftChanges, normalizePropertyDraftChanges } from '../draft-utils';

async function getCurrentUserId() {
    const session = await getSession();
    if (!session?.id) {
        throw new Error('Unauthorized');
    }

    return Number(session.id);
}

function getDraftClient() {
    return prisma as any;
}

export async function savePropertyDraft(draftId: number, changes: PropertyDraftChanges, doing?: string) {
    const userId = await getCurrentUserId();
    const client = getDraftClient();

    const normalizedChanges = normalizePropertyDraftChanges(changes);

    const existingDraft = await client.propertyDraft.findFirst({
        where: { id: draftId, account_id: userId },
    });

    if (!existingDraft) {
        throw new Error('Unauthorized');
    }

    const draft = await client.propertyDraft.update({
        where: { id: draftId },
        data: {
            changes: normalizedChanges,
            doing: doing || normalizedChanges.doing || 'creation',
            status: 'draft',
            account_id: userId,
            created_by: userId,
        },
    });

    revalidatePath('/sell');
    return {
        id: draft.id,
        status: draft.status,
        updated_at: draft.updated_at,
    };
}

export async function discardPropertyDraft(draftId: number) {
    const userId = await getCurrentUserId();
    const client = getDraftClient();

    const existingDraft = await client.propertyDraft.findFirst({
        where: { id: draftId, account_id: userId },
    });

    if (!existingDraft) {
        throw new Error('Unauthorized');
    }

    await client.propertyDraft.update({
        where: { id: draftId },
        data: { status: 'discarded' },
    });

    revalidatePath('/sell');
}

export async function publishPropertyDraft(draftId: number, changes?: PropertyDraftChanges) {
    const userId = await getCurrentUserId();
    const client = getDraftClient();

    const existingDraft = await client.propertyDraft.findFirst({
        where: { id: draftId, account_id: userId },
    });

    if (!existingDraft) {
        throw new Error('Unauthorized');
    }

    await client.propertyDraft.update({
        where: { id: draftId },
        data: {
            status: 'published',
            ...(changes ? { changes: normalizePropertyDraftChanges(changes) } : {}),
        },
    });

    revalidatePath('/sell');
}

export async function getLatestPropertyDraftForUser(userId: number) {
    const client = getDraftClient();
    return client.propertyDraft.findFirst({
        where: {
            account_id: userId,
            status: { in: ['draft', 'discarded'] },
        },
        orderBy: { updated_at: 'desc' },
    });
}

export async function getPropertyDraftById(draftId: number, userId: number) {
    const client = getDraftClient();
    return client.propertyDraft.findFirst({
        where: {
            id: draftId,
            account_id: userId,
        },
    });
}