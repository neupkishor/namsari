"use server";

import { initMapper } from '@/mapper';
import { setSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
    const mapper = initMapper();
    const username = formData.get('username');
    const name = formData.get('name');
    const contact_number = formData.get('contact_number');
    const account_type = formData.get('account_type');

    // Check if username already exists
    const existing = await mapper.use('users').where('username', username).getOne();
    if (existing) {
        throw new Error("Username already taken.");
    }

    try {
        const result = await mapper.use('users').add({
            username,
            name,
            contact_number,
            account_type
        });

        // In SQLite, result is the inserted ID (string)
        // So we can use it directly
        await setSession(String(result));
    } catch (error) {
        console.error("Registration error:", error);
        throw new Error("Failed to create account.");
    }

    redirect('/');
}

export async function loginAction(formData: FormData) {
    const mapper = initMapper();
    const username = formData.get('username');

    try {
        const user = await mapper.use('users').where('username', username).getOne();

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
