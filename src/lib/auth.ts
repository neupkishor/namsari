import { cookies } from 'next/headers';
import { cache } from 'react';
import prisma from '@/lib/prisma';

export const getSession = cache(async () => {
    const cookieStore = await cookies();
    const userId = cookieStore.get('namsari_user_id')?.value;
    if (!userId) return null;

    try {
        const user = await (prisma as any).account.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, type: true }
        });

        if (!user) return null;

        return {
            id: userId,
            type: user.type
        };
    } catch (error) {
        console.error("Error in getSession:", error);
        return null;
    }
});

export async function setSession(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set('namsari_user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    return { id: parseInt(session.id), type: session.type };
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('namsari_user_id');
}
