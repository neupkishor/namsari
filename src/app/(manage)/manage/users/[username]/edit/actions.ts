'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateUser(username: string, formData: FormData) {
    'use server';

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
    if (status) updateData.status = status;
    if (profile_picture) updateData.profile_picture = profile_picture;
    if (cover_image) updateData.cover_image = cover_image;

    if (password && password.trim() !== '') {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    try {
        await prisma.user.update({
            where: { username },
            data: updateData
        });
        revalidatePath(`/manage/users/${username}`);
        revalidatePath(`/manage/users/${username}/edit`);
        return { success: true, message: 'User updated successfully' };
    } catch (error) {
        console.error('Update user error:', error);
        return { success: false, message: 'Failed to update user' };
    }
}
