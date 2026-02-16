import { cookies } from 'next/headers';
import { cache } from 'react';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'namsari_session';

export const getSession = cache(async () => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionCookie) return null;

    try {
        const { id, key } = JSON.parse(sessionCookie);
        
        const session = await prisma.session.findUnique({
            where: { sessionToken: id },
            include: { user: { select: { id: true, type: true } } }
        });

        if (!session) return null;
        
        // Verify key
        if (session.sessionKey !== key) return null;
        
        // Check expiration
        if (new Date() > session.expiresAt) {
             // Expired
             return null;
        }

        // Update last active async
        prisma.session.update({
            where: { id: session.id },
            data: { lastActive: new Date() }
        }).catch(err => console.error("Failed to update session lastActive", err));

        return {
            id: String(session.userId),
            type: session.user.type,
            sessionId: session.id,
            operatingId: session.operatingId
        };
    } catch (error) {
        console.error("Error in getSession:", error);
        return null;
    }
});

export async function createSession(userId: number) {
    const sessionToken = crypto.randomUUID();
    const sessionKey = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
        data: {
            sessionToken,
            sessionKey,
            userId,
            expiresAt
        }
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ id: sessionToken, key: sessionKey }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        path: '/',
    });
}

// Deprecated: kept for backward compatibility if needed, but should use createSession
export async function setSession(userId: string) {
    await createSession(parseInt(userId));
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    return { 
        id: parseInt(session.id), 
        type: session.type,
        operatingId: session.operatingId
    };
}

export async function clearSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (sessionCookie) {
        try {
            const { id } = JSON.parse(sessionCookie);
            await prisma.session.delete({ where: { sessionToken: id } }).catch(() => {});
        } catch (e) {}
    }
    
    cookieStore.delete(SESSION_COOKIE_NAME);
    // Also delete old cookie if exists
    cookieStore.delete('namsari_user_id');
}

export async function switchProfile(targetId: number | null) {
    const session = await getSession();
    if (!session?.sessionId) return false;

    await prisma.session.update({
        where: { id: session.sessionId },
        data: { operatingId: targetId }
    });
    
    return true;
}

export async function revokeSession(sessionId: string) {
    await prisma.session.delete({ where: { id: sessionId } });
}
