'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';
import { getSession } from '@/lib/auth';

import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';

const SENSITIVE_UPDATE_TTL_MS = 10 * 60 * 1000;

function getSensitiveUpdateSecret() {
    return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
}

function createSensitiveUpdateToken(userId: number, kind: string) {
    const secret = getSensitiveUpdateSecret();
    if (!secret) return null;

    const expiresAt = Date.now() + SENSITIVE_UPDATE_TTL_MS;
    const payload = `${userId}:${kind}:${expiresAt}`;
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

function verifySensitiveUpdateToken(token: string, userId: number, kind: string) {
    const secret = getSensitiveUpdateSecret();
    if (!secret) return false;

    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf8');
        const [tokenUserId, tokenKind, tokenExpiresAt, tokenSignature] = decoded.split(':');

        if (!tokenUserId || !tokenKind || !tokenExpiresAt || !tokenSignature) {
            return false;
        }

        if (Number(tokenUserId) !== userId || tokenKind !== kind) {
            return false;
        }

        if (Date.now() > Number(tokenExpiresAt)) {
            return false;
        }

        const payload = `${tokenUserId}:${tokenKind}:${tokenExpiresAt}`;
        const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

        return timingSafeEqual(Buffer.from(tokenSignature), Buffer.from(expectedSignature));
    } catch (error) {
        console.error('Failed to verify sensitive update token:', error);
        return false;
    }
}

async function ensureProfileOwner(userId: number) {
    const session = await getSession();
    if (!session?.id || Number(session.id) !== userId) {
        throw new Error('Unauthorized');
    }
}

export async function updateUserProfilePicture(userId: number, url: string) {
    await ensureProfileOwner(userId);

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

export async function updateUserCoverImage(userId: number, url: string) {
    await ensureProfileOwner(userId);

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { cover_image: true }
    });

    await prisma.user.update({
        where: { id: userId },
        data: { cover_image: url }
    });

    const previousUrl = currentUser?.cover_image || 'none';

    await logActivity({
        activity_type: 'update_profile',
        description: `Updated cover image from "${previousUrl}" to "${url}"`,
        account_id: userId,
    });

    revalidatePath('/[@username]', 'layout');
}

export async function updateProfile(userId: number, formData: FormData) {
    await ensureProfileOwner(userId);

    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;

    // Fetch current user data to compare changes
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            name: true, 
            bio: true
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
    }

    const data: any = { name, bio };

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

export async function beginSensitiveProfileUpdate(userId: number, kind: 'email' | 'phone' | 'password', currentPassword: string) {
    await ensureProfileOwner(userId);

    if (!currentPassword || !currentPassword.trim()) {
        return { success: false, message: 'Current password is required' };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { credentials: true }
    });

    if (!user?.credentials?.password) {
        return { success: false, message: 'Password verification is unavailable for this account' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.credentials.password);
    if (!isValid) {
        return { success: false, message: 'Current password is incorrect' };
    }

    const token = createSensitiveUpdateToken(userId, kind);
    if (!token) {
        return { success: false, message: 'Sensitive update verification is not configured' };
    }

    return { success: true, token };
}

export async function completeSensitiveProfileUpdate(
    userId: number,
    kind: 'email' | 'phone' | 'password',
    token: string,
    payload: { email?: string; phone?: string; password?: string; confirmPassword?: string; }
) {
    await ensureProfileOwner(userId);

    if (!token || !verifySensitiveUpdateToken(token, userId, kind)) {
        return { success: false, message: 'Verification expired. Please confirm your current password again.' };
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            contact_number: true
        }
    });

    if (!currentUser) {
        return { success: false, message: 'User not found' };
    }

    const changes: string[] = [];
    const data: any = {};

    if (kind === 'email') {
        const email = (payload.email || '').trim();
        if (!email) {
            return { success: false, message: 'Email address is required' };
        }
        data.email = email;
        if ((currentUser.email || '') !== email) {
            changes.push(`email from "${currentUser.email || ''}" to "${email}"`);
        }
    }

    if (kind === 'phone') {
        const phone = (payload.phone || '').trim();
        if (!phone) {
            return { success: false, message: 'Phone number is required' };
        }
        data.contact_number = phone;
        if ((currentUser.contact_number || '') !== phone) {
            changes.push(`phone from "${currentUser.contact_number || ''}" to "${phone}"`);
        }
    }

    if (kind === 'password') {
        const password = payload.password || '';
        const confirmPassword = payload.confirmPassword || '';

        if (!password) {
            return { success: false, message: 'New password is required' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

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
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            return { success: false, message: kind === 'email' ? 'Email already in use' : 'Update failed' };
        }
        return { success: false, message: 'Update failed' };
    }
}
