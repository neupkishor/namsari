'use server';

import { getSession } from '@/lib/auth';

export async function getConversationHistory() {
    const session = await getSession();
    if (!session?.id) return [];

    // For now, return empty as there's no DB model for conversations yet
    return [];
}

export async function sendMessage(formData: FormData) {
    const session = await getSession();
    if (!session?.id) throw new Error("Unauthorized");

    const message = formData.get('message') as string;
    if (!message) throw new Error("Message is required");

    // For now, just simulate success as we have no DB storage yet
    return { success: true };
}
