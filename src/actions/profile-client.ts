'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';

import bcrypt from 'bcryptjs';

export async function updateUserProfilePicture(userId: number, url: string) {
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile_picture: true }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { profile_picture: url }
    });

    const previousUrl = currentUser?.profile_picture || 'none';
    
    await logActivity({
        activity_type: 'update_profile_picture',
        description: `Updated profile picture from "${previousUrl}" to "${url}"`,
        account_id: userId,
    });

    revalidatePath('/[@username]', 'page');
}

export async function updateProfile(userId: number, formData: FormData) {
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    // Fetch current user data to compare changes
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            name: true, 
            bio: true, 
            email: true, 
            contact_number: true 
        }
    });

    const changes: string[] = [];

    if (currentUser) {
        if (currentUser.name !== name) {
            changes.push(`name from "${currentUser.name}" to "${name}"`);
        }
        // Handle null/undefined for bio
        const oldBio = currentUser.bio || '';
        const newBio = bio || '';
        if (oldBio !== newBio) {
            changes.push(`bio from "${oldBio}" to "${newBio}"`);
        }
        
        // Handle null/undefined for email (though email is likely required)
        const oldEmail = currentUser.email || '';
        if (oldEmail !== email) {
            changes.push(`email from "${oldEmail}" to "${email}"`);
        }

        // Handle null/undefined for phone
        const oldPhone = currentUser.contact_number || '';
        const newPhone = phone || '';
        if (oldPhone !== newPhone) {
            changes.push(`phone from "${oldPhone}" to "${newPhone}"`);
        }
    }

    const data: any = { name, bio, email, contact_number: phone };

    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.credentials = {
            upsert: {
                create: { password: hashedPassword },
                update: { password: hashedPassword }
            }
        };
        changes.push('password updated');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data
        });

        if (changes.length > 0) {
            await logActivity({
                activity_type: 'update_profile',
                description: `Updated ${changes.join(', ')}`,
                account_id: userId,
            });
        }

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
