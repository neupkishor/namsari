'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function createAgencyAgent(data: FormData) {
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const phone = data.get('phone') as string;
    const password = data.get('password') as string;
    const agencyId = parseInt(data.get('agencyId') as string);
    const isExclusive = data.get('exclusive') === 'on';

    if (!name || !email || !password || !agencyId) {
        throw new Error("Missing required fields");
    }

    // Generate username
    let username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (username.length < 3) username = username.padEnd(3, 'x');
    
    // Uniqueness check for username
    let existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Email check
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    name,
                    username,
                    email,
                    contact_number: phone,
                    type: 'agent',
                    agency_id: agencyId, // Link directly
                    status: 'active'
                }
            });

            await tx.account.upsert({
                where: { id: user.id.toString() },
                update: {
                    type: 'agent',
                    provider_account_id: `user:${user.id}`,
                    password_hash: hashedPassword,
                },
                create: {
                    id: user.id.toString(),
                    type: 'agent',
                    provider_account_id: `user:${user.id}`,
                    password_hash: hashedPassword,
                },
            });
        });

        revalidatePath('/manage/accounts/agents');
    } catch (error) {
        console.error("Failed to create agent:", error);
        throw new Error("Failed to create agent account");
    }
}

export async function addExistingAgent(data: FormData) {
    const username = data.get('username') as string;
    const agencyId = parseInt(data.get('agencyId') as string);

    if (!username || !agencyId) throw new Error("Missing required fields");

    const agent = await prisma.user.findUnique({ where: { username } });

    if (!agent) throw new Error("Agent not found");
    
    // Check if already linked to this agency
    if (agent.agency_id === agencyId) {
        throw new Error("Agent is already a member of this agency.");
    }

    await prisma.user.update({
        where: { id: agent.id },
        data: { agency_id: agencyId },
    });

    revalidatePath('/manage/accounts/agents');
}

export async function toggleExclusive(memberId: number, isExclusive: boolean) {
    // Membership table is removed; no-op for compatibility.
    revalidatePath('/manage/accounts/agents');
}

export async function resetAgentPassword(agentId: number, newPassword: string) {
    const session = await getSession();
    if (!session?.id) {
        return { success: false, message: 'Unauthorized' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const actorId = parseInt(session.id, 10);
    const actor = await prisma.user.findUnique({
        where: { id: actorId },
        include: { role: true }
    });
    if (!actor) {
        return { success: false, message: 'Unauthorized' };
    }

    const target = await prisma.user.findUnique({ where: { id: agentId } });
    if (!target) {
        return { success: false, message: 'Agent not found.' };
    }

    const roleName = actor.role?.role?.toLowerCase() || '';
    const isOwner = actor.type === 'owner' || roleName.includes('owner');
    const isAdmin = actor.type === 'admin' || roleName.includes('admin');
    const isAgencyOwner = actor.type === 'agency' && target.agency_id === actor.id;

    if (!isOwner && !isAdmin && !isAgencyOwner) {
        return { success: false, message: 'Forbidden' };
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await prisma.account.upsert({
        where: { id: target.id.toString() },
        update: {
            password_hash: hashedPassword,
            provider_account_id: `user:${target.id}`,
        },
        create: {
            id: target.id.toString(),
            type: (target.type as any) || 'agent',
            provider_account_id: `user:${target.id}`,
            password_hash: hashedPassword,
        },
    });

    revalidatePath('/manage/accounts/agents');
    revalidatePath(`/manage/accounts/${target.username}`);
    return { success: true, message: 'Agent password updated.' };
}
