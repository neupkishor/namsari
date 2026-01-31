import { cookies } from 'next/headers';

export async function getSession() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('namsari_user_id')?.value;
    if (!userId) return null;
    return { id: userId };
}

export async function setSession(userId) {
    const cookieStore = await cookies();
    cookieStore.set('namsari_user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('namsari_user_id');
}
