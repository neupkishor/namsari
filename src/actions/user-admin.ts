'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function updateUser(username: string, formData: FormData) {
    const session = await getSession();
    if (!session?.id) {
        return { success: false, message: 'Unauthorized' };
    }

    const currentUser = await prisma.account.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!currentUser) {
        return { success: false, message: 'Unauthorized' };
    }

    const targetUser = await prisma.account.findUnique({
        where: { username }
    });

    if (!targetUser) {
        return { success: false, message: 'User not found' };
    }

    // Permission Check
    const isAdmin = currentUser.type === 'admin' || currentUser.role?.name?.toLowerCase().includes('admin');
    const isSelf = currentUser.id === targetUser.id;
    const isAgencyOwner = currentUser.type === 'agency' && targetUser.agency_id === currentUser.id;

    if (!isAdmin && !isSelf && !isAgencyOwner) {
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
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.credentials = {
            upsert: {
                create: { password: hashedPassword },
                update: { password: hashedPassword }
            }
        };
    }

    try {
        await prisma.account.update({
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
