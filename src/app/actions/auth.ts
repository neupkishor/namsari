"use server";

import prisma from '@/lib/prisma';
import { clearSession, setSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const contact_number = formData.get('contact_number') as string;
    const account_type = formData.get('account_type') as string;
    const password = formData.get('password') as string;

    if (!username) throw new Error("Username is required");
    if (!password) throw new Error("Password is required");

    // Check if username already exists
    const existing = await prisma.user.findUnique({
        where: { username }
    });

    if (existing) {
        throw new Error("Username already taken.");
    }

    try {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                name: name || username,
                contact_number,
                account_type,
                password: hashedPassword
            }
        });

        await setSession(String(user.id));
    } catch (error) {
        console.error("Registration error:", error);
        throw new Error("Failed to create account.");
    }

    redirect('/');
}

export async function loginAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            // Using a generic error message for security is better, but following instructions directly implies simpler validation for now.
            throw new Error("Invalid username or password.");
        }

        // Validate password
        // Validate password using bcrypt
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            throw new Error("Invalid username or password.");
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
        // We need to pass the error back to the client. Since this is a server action called by a form, 
        // a simple redirect or throw usually results in a generic error page in Next.js unless handled.
        // For this specific codebase pattern, we might need a better way to show errors on the login page.
        // However, standard Next.js actions throw errors that can be caught by error boundaries or client components using useFormState.
        // Since the current implementation is a basic HTML form action, we'll redirect to login with an error param.
        return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/');
}

export async function logoutAction() {
    await clearSession();
    redirect('/');
}
