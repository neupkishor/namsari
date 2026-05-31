'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function updateUser(username: string, formData: FormData) {
    const session = await getSession();
    if (!session?.id) {
        return { success: false, message: 'Unauthorized' };
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!currentUser) {
        return { success: false, message: 'Unauthorized' };
    }

    const targetUser = await prisma.user.findUnique({
        where: { username },
        include: { role: true }
    });

    if (!targetUser) {
        return { success: false, message: 'User not found' };
    }

    // Permission Check
    const roleName = currentUser.role?.role?.toLowerCase() || '';
    const isOwner = currentUser.type === 'owner' || roleName.includes('owner');
    const isAdmin = currentUser.type === 'admin' || roleName.includes('admin');
    const isSelf = currentUser.id === targetUser.id;
    const isAgencyOwner = currentUser.type === 'agency' && targetUser.agency_id === currentUser.id;

    if (isSelf && targetUser.type === 'agent' && targetUser.agency_id) {
        const agencyConfig = await prisma.agencyConfig.findUnique({
            where: { agencyId: targetUser.agency_id },
            select: { canAgentChangeInfo: true },
        });

        if (agencyConfig?.canAgentChangeInfo === false) {
            return { success: false, message: 'This agency does not allow agents to update profile details.' };
        }
    }

    if (!isOwner && !isAdmin && !isSelf && !isAgencyOwner) {
        return { success: false, message: 'Forbidden' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const contact_number = formData.get('contact_number') as string;
    const status = formData.get('status') as string;
    const password = formData.get('password') as string;
    const profile_picture = formData.get('profile_picture') as string;
    const cover_image = formData.get('cover_image') as string;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contact_number) updateData.contact_number = contact_number;
    
    // Only Admin or Agency (for their agents) can change status
    if (status && (isAdmin || isAgencyOwner)) {
        updateData.status = status;
    }
    
    if (profile_picture) updateData.profile_picture = profile_picture;
    if (cover_image) updateData.cover_image = cover_image;

    if (password && password.trim() !== '') {
        const targetRoleName = (targetUser as any)?.role?.role?.toLowerCase?.() || '';
        const targetIsAdmin = targetUser.type === 'admin' || targetRoleName.includes('admin');
        const targetIsOwner = targetUser.type === 'owner' || targetRoleName.includes('owner');

        // Password change policy:
        // - Admin: can change everyone EXCEPT admins and owners
        // - Owner: can change everyone, including admins and owners
        // - Agency: can change only their own agents (covered by isAgencyOwner)
        // - Self: allowed
        if (isOwner) {
            // allowed
        } else if (isAdmin) {
            if (targetIsAdmin || targetIsOwner) {
                return { success: false, message: 'Admins cannot change password of admins or owners.' };
            }
        } else if (isAgencyOwner) {
            if (targetUser.type !== 'agent' && targetUser.type !== 'agency_agent') {
                return { success: false, message: 'Agency can only change password of their agents.' };
            }
        } else if (!isSelf) {
            return { success: false, message: 'Forbidden' };
        }

        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.account.upsert({
            where: { id: targetUser.id.toString() },
            update: {
                password_hash: hashedPassword,
                provider_account_id: `user:${targetUser.id}`,
            },
            create: {
                id: targetUser.id.toString(),
                type: (targetUser.type as any) || 'user',
                provider_account_id: `user:${targetUser.id}`,
                password_hash: hashedPassword,
            },
        });
    }

    try {
        await prisma.user.update({
            where: { username },
            data: updateData
        });
        revalidatePath(`/manage/accounts/${username}`);
        revalidatePath(`/manage/accounts/${username}/edit`);
        return { success: true, message: 'User updated successfully' };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, message: 'Failed to update user' };
    }
}
