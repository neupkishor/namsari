"use server";

import prisma from '@/lib/prisma';
import { getSession, switchProfile, revokeSession as revokeSessionLib, signIn, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.id) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.id) },
            select: {
                id: true,
                name: true,
                username: true,
                profile_picture: true,
                type: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });
        
        if (!user) return null;
        
        return { ...user, operatingId: (session as any).operatingId };
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

export async function getUserSessions() {
    const session = await getSession();
    if (!session?.id) return [];

    try {
        const sessionId = (session as any).sessionId;

        const sessions = await prisma.session.findMany({
            where: { userId: parseInt(session.id) },
            orderBy: { lastActive: 'desc' }
        });
        
        return sessions.map((s: any) => ({
            id: s.id,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            lastActive: s.lastActive,
            isCurrent: s.sessionToken === sessionId
        }));
    } catch (error) {
        console.error("Error fetching user sessions:", error);
        return [];
    }
}

export async function switchProfileAction(targetId: number | null) {
    const session = await getSession();
    if (!session?.id) throw new Error("Unauthorized");
    
    const userId = parseInt(session.id);

    if (targetId) {
        // Verify permission
        if (targetId !== userId) {
            const permission = await prisma.userPermission.findUnique({
                where: {
                    ownerId_actorId: {
                        ownerId: targetId,
                        actorId: userId
                    }
                }
            });
            
            if (!permission) {
                 throw new Error("Unauthorized to access this profile");
            }
        }
    }

    const success = await switchProfile(targetId);
    if (success) {
        redirect('/manage');
    } else {
        throw new Error("Failed to switch profile");
    }
}

export async function revokeSessionAction(sessionId: string) {
    await revokeSessionLib(sessionId);
    revalidatePath('/manage/logins');
}

export async function registerAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const contact_number = formData.get('contact_number') as string;
    const type = formData.get('account_type') as string; 
    const password = formData.get('password') as string;

    if (!name || !email) {
        return redirect(`/auth/register?error=${encodeURIComponent("Name and email are required")}`);
    }
    
    if (type === 'user' && !password) {
        return redirect(`/auth/register?error=${encodeURIComponent("Password is required")}`);
    }

    if (!['user', 'agency', 'bank'].includes(type)) {
        return redirect(`/auth/register?error=${encodeURIComponent("Invalid account type")}`);
    }

    try {
        let username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (username.length < 3) username = username.padEnd(3, 'x');

        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            username = `${username}${randomSuffix}`;
        }

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return redirect(`/auth/register?error=${encodeURIComponent("Email already registered")}`);
        }

        const bcrypt = await import('bcryptjs');
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        await prisma.$transaction(async (tx: any) => {
            const newAccount = await tx.user.create({
                data: {
                    username,
                    name,
                    email,
                    contact_number,
                    type,
                }
            });

            if (type === 'user' && hashedPassword) {
                await (tx as any).userCredential.create({
                    data: {
                        userId: newAccount.id,
                        password: hashedPassword
                    }
                });
            }
        });

        // After successful registration, sign in
        if (type === 'user' && password) {
            await signIn("credentials", {
                identifier: email,
                password,
                redirectTo: "/",
            });
        } else {
            // For other types, maybe redirect to a "pending approval" or login page
            return redirect('/auth/login?message=' + encodeURIComponent("Account created successfully. Please login."));
        }
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error("Registration error:", error);
        return redirect(`/auth/register?error=${encodeURIComponent("Failed to create account")}`);
    }
}

export async function loginAction(formData: FormData) {
    const identifier = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return redirect(`/auth/login?error=${encodeURIComponent("Credentials are required")}`);
    }

    try {
        await signIn("credentials", {
            identifier,
            password,
            redirectTo: "/",
        });
    } catch (error: any) {
        // NextAuth throws a Redirect error on success when redirectTo is provided
        if (error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        
        let errorMessage = "Invalid credentials";
        if (error.type === "CredentialsSignin") {
            errorMessage = "Invalid credentials";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return redirect(`/auth/login?error=${encodeURIComponent(errorMessage)}`);
    }
}

export async function logoutAction() {
    const session = await getSession();
    const sessionId = (session as any)?.sessionId;
    if (sessionId) {
        try {
            await prisma.session.delete({
                where: { sessionToken: sessionId }
            });
        } catch (error) {
            console.error("Error deleting session on logout:", error);
        }
    }
    await signOut({ redirectTo: "/auth/login" });
}
