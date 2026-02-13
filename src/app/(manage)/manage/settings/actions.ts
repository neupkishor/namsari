'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
    if (!(prisma as any).systemSettings) {
        return {
            id: 1,
            view_mode: 'classic',
            show_like_button: true,
            show_share_button: true,
            show_comment_button: true,
            show_contact_agent: true,
            show_make_offer: true
        };
    }

    try {
        let settings = await (prisma as any).systemSettings.findFirst();
        if (!settings) {
            settings = await (prisma as any).systemSettings.create({
                data: {
                    id: 1,
                    view_mode: 'classic',
                    show_like_button: true,
                    show_share_button: true,
                    show_comment_button: true,
                    show_contact_agent: true,
                    show_make_offer: true
                }
            });
        }
        return settings;
    } catch (e) {
        console.error("getSystemSettings error:", e);
        return {
            id: 1,
            view_mode: 'classic',
            show_like_button: true,
            show_share_button: true,
            show_comment_button: true,
            show_contact_agent: true,
            show_make_offer: true
        };
    }
}

export async function updateSystemSettings(data: any) {
    if (!(prisma as any).systemSettings) {
        throw new Error("SystemSettings model not available in current Prisma client. Please restart server.");
    }

    const settings = await getSystemSettings();
    await (prisma as any).systemSettings.update({
        where: { id: settings.id },
        data
    });
    revalidatePath('/', 'layout');
    revalidatePath('/manage/settings');
}
