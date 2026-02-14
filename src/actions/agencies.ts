'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createAgency(formData: FormData) {
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const bio = formData.get('bio') as string;
    const website = formData.get('website') as string;
    const profile_picture = formData.get('profile_picture') as string;

    const facebook = formData.get('facebook') as string;
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;
    const linkedin = formData.get('linkedin') as string;

    await (prisma as any).agency.create({
        data: {
            name,
            username,
            email,
            phone,
            bio,
            website,
            profile_picture,
            facebook,
            instagram,
            twitter,
            linkedin
        }
    });

    revalidatePath('/manage/agencies');
}

export async function deleteAgency(id: number) {
    await (prisma as any).agency.delete({
        where: { id }
    });
    revalidatePath('/manage/agencies');
}

export async function toggleAgencyVerification(id: number, currentStatus: boolean) {
    await (prisma as any).agency.update({
        where: { id },
        data: { is_verified: !currentStatus }
    });
    revalidatePath('/manage/agencies');
}
