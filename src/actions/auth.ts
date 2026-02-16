"use server";

import prisma from '@/lib/prisma';
import { clearSession, setSession, getSession, createSession, switchProfile, revokeSession as revokeSessionLib } from '@/lib/auth';
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

        // If operating as someone else, we might want to return that user?
        // But getCurrentUser is usually for the "main" identity.
        // Or maybe we return the operating user?
        // For the header profile, we usually want the real user.
        // For the dashboard context, we check operatingId.
        // Let's return the main user here, and let specific pages handle operating context.
        // However, if we want the UI to reflect the "Acting As", we should probably return it.
        // But the prompt asked for "operating_id" to be saved.
        
        return { ...user, operatingId: session.operatingId };
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

export async function getUserSessions() {
    const session = await getSession();
    if (!session?.id) return [];
    
    const sessions = await prisma.session.findMany({
        where: { userId: parseInt(session.id) },
        orderBy: { lastActive: 'desc' }
    });
    
    return sessions.map(s => ({
        ...s,
        isCurrent: s.id === session.sessionId
    }));
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
    const type = formData.get('account_type') as string; // Form likely still sends account_type
    const password = formData.get('password') as string;

    if (!name) throw new Error("Name is required");
    if (!email) throw new Error("Email is required");
    if (type === 'user' && !password) throw new Error("Password is required");

    // Validate Account Type
    if (!['user', 'agency', 'bank'].includes(type)) {
        throw new Error("Invalid account type.");
    }

    // Generate username: name without space and special chars
    let username = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Ensure username is at least 3 chars
    if (username.length < 3) {
        username = username.padEnd(3, 'x');
    }

    // Check if username already exists
    let existingUser = await prisma.user.findUnique({
        where: { username }
    });

    if (existingUser) {
        // Append random 4 digits
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        username = `${username}${randomSuffix}`;
        
        // Check again (unlikely to collide, but good practice)
        existingUser = await prisma.user.findUnique({
            where: { username }
        });
        
        if (existingUser) {
            throw new Error("Could not generate a unique username. Please try again.");
        }
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
        where: { email }
    });

    if (existingEmail) {
        throw new Error("Email already registered.");
    }

    try {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.$transaction(async (tx) => {
            const newAccount = await (tx as any).user.create({
                data: {
                    username,
                    name,
                    email,
                    contact_number,
                    type,
                }
            });

            // Only create credentials for "user" type
            if (type === 'user') {
                await (tx as any).userCredential.create({
                    data: {
                        userId: newAccount.id,
                        password: hashedPassword
                    }
                });
            }
            
            return newAccount;
        });

        await setSession(String(user.id)); // Use deprecated setSession for now, which calls createSession inside lib/auth.ts if updated
        // Wait, I updated setSession in lib/auth.ts to call createSession(parseInt(userId)).
        // So this is fine.
    } catch (error) {
        console.error("Registration error:", error);
        throw new Error("Failed to create account.");
    }

    redirect('/');
}

export async function loginAction(formData: FormData) {
    const identifier = formData.get('username') as string; // This can be username, email, or phone
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        // This will be caught by the catch block and redirected
        // throwing here is fine as it propagates to the catch block below
         // But we can just throw directly
    }

    try {
        if (!identifier) throw new Error("Username/Email/Phone is required");
        if (!password) throw new Error("Password is required");

        // Find user by username OR email OR contact_number
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier },
                    { contact_number: identifier }
                ]
            },
            include: {
                credentials: true
            }
        });

        if (!user) {
            throw new Error("Invalid credentials.");
        }

        // Validate password
        const bcrypt = await import('bcryptjs');
        // Check if credentials exist
        if (!user.credentials) {
             throw new Error("Invalid credentials."); // No password set for this account
        }

        const isMatch = await bcrypt.compare(password, user.credentials.password);
        if (!isMatch) {
            throw new Error("Invalid credentials.");
        }

        // Validate Status
        if (user.status === 'banned') {
            throw new Error("Your account has been permanently banned.");
        }

        if (user.status === 'suspended') {
            let message = "Your account is temporarily suspended.";
            if (user.moreInfo) {
                try {
                    const info = JSON.parse(user.moreInfo);
                    if (info.suspendedUntil) {
                        message += ` You can login after ${new Date(info.suspendedUntil).toLocaleString()}.`;
                    }
                } catch (e) {
                    // ignore parsing error
                }
            }
            throw new Error(message);
        }

        // Active or Warned users can login
        await setSession(String(user.id));
    } catch (error: any) {
        console.error("Login error:", error);
        return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/');
}

export async function logoutAction() {
    await clearSession();
    redirect('/');
}
