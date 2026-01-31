'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
    let settings = await (prisma as any).systemSettings.findFirst();
    if (!settings) {
        try {
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
        } catch (e) {
            // If another request created it in the meantime, just fetch it again
            settings = await (prisma as any).systemSettings.findFirst();
        }
    }
    return settings;
}

export async function updateSystemSettings(data: any) {
    const settings = await getSystemSettings();
    await (prisma as any).systemSettings.update({
        where: { id: settings.id },
        data
    });
    revalidatePath('/', 'layout');
    revalidatePath('/manage/settings');
}
