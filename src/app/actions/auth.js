"use server";

import { initMapper } from '@/mapper';
import { setSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function registerAction(formData) {
    const mapper = initMapper();
    const username = formData.get('username');
    const name = formData.get('name');
    const contact_number = formData.get('contact_number');
    const account_type = formData.get('account_type');

    // Check if username already exists
    const existing = await mapper.use('users').where('username', username).getOne();
    if (existing) {
        return { error: "Username already taken." };
    }

    try {
        const result = await mapper.use('users').add({
            username,
            name,
            contact_number,
            account_type
        });

        // In some adapters, result is the inserted ID. 
        // If not, we fetch it back by username.
        const newUser = await mapper.use('users').where('username', username).getOne();

        await setSession(String(newUser.id));
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Failed to create account." };
    }

    redirect('/');
}

export async function loginAction(formData) {
    const mapper = initMapper();
    const username = formData.get('username');

    try {
        const user = await mapper.use('users').where('username', username).getOne();

        if (!user) {
            return { error: "User not found." };
        }

        await setSession(String(user.id));
    } catch (error) {
        console.error("Login error:", error);
        return { error: "Failed to login." };
    }

    redirect('/');
}

export async function logoutAction() {
    await clearSession();
    redirect('/');
}
