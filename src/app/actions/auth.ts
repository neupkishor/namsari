"use server";

import prisma from '@/lib/prisma';
import { clearSession, setSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const contact_number = formData.get('contact_number') as string;
    const account_type = formData.get('account_type') as string;

    if (!username) throw new Error("Username is required");

    // Check if username already exists
    const existing = await prisma.user.findUnique({
        where: { username }
    });

    if (existing) {
        throw new Error("Username already taken.");
    }

    try {
        const user = await prisma.user.create({
            data: {
                username,
                name: name || username,
                contact_number,
                account_type
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

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw new Error("User not found.");
        }

        await setSession(String(user.id));
    } catch (error) {
        console.error("Login error:", error);
        throw new Error("Failed to login.");
    }

    redirect('/');
}

export async function logoutAction() {
    await clearSession();
    redirect('/');
}
