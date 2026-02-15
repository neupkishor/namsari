'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import bcrypt from 'bcryptjs';

export async function updateUserProfilePicture(userId: number, url: string) {
    await prisma.account.update({
        where: { id: userId },
        data: { profile_picture: url }
    });
    revalidatePath('/[@username]', 'page');
}

export async function updateProfile(userId: number, formData: FormData) {
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    const data: any = { name, bio, email, contact_number: phone };

    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.credentials = {
            upsert: {
                create: { password: hashedPassword },
                update: { password: hashedPassword }
            }
        };
    }

    try {
        await prisma.account.update({
            where: { id: userId },
            data
        });
        revalidatePath('/[@username]', 'layout');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        if (e.code === 'P2002') {
            return { success: false, message: 'Email already in use' };
        }
        return { success: false, message: 'Update failed' };
    }
}
