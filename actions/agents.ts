'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

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
        await prisma.$transaction(async (tx) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    name,
                    username,
                    email,
                    contact_number: phone,
                    type: 'agency_agent',
                    agency_id: agencyId, // Link directly
                    status: 'active'
                }
            });

            // Create Credentials
            await tx.userCredential.create({
                data: {
                    userId: user.id,
                    password: hashedPassword
                }
            });

            // Create Membership
            await (tx as any).member.create({
                data: {
                    accountId: user.id,
                    partOf: agencyId,
                    exclusive: isExclusive,
                    status: 'active'
                }
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

    const agent = await prisma.user.findUnique({
        where: { username },
        include: { memberships: true } as any
    });

    if (!agent) throw new Error("Agent not found");
    
    // Check if agent is exclusive to another agency
    const memberships = (agent as any).memberships || [];
    const exclusiveMembership = memberships.find((m: any) => m.exclusive);
    if (exclusiveMembership) {
        throw new Error("This agent is exclusively bound to another agency.");
    }

    // Check if already a member of this agency
    const existingMembership = memberships.find((m: any) => m.partOf === agencyId);
    if (existingMembership) {
        throw new Error("Agent is already a member of this agency.");
    }

    // Create Membership
    await (prisma as any).member.create({
        data: {
            accountId: agent.id,
            partOf: agencyId,
            exclusive: false,
            status: 'invited'
        }
    });

    revalidatePath('/manage/accounts/agents');
}

export async function toggleExclusive(memberId: number, isExclusive: boolean) {
    // This action should ideally have authorization checks
    await (prisma as any).member.update({
        where: { id: memberId },
        data: { exclusive: isExclusive }
    });
    revalidatePath('/manage/accounts/agents');
}
