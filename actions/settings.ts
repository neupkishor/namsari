'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({ where: { id: parseInt(session.id) } });
    if (user?.type !== 'admin') throw new Error('Unauthorized');
}

export async function getPropertyTypeCounts() {
    return await prisma.propertyType.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function updatePropertyTypeCount(id: number, count: number) {
    await requireAdmin();

    await prisma.propertyType.update({
        where: { id },
        data: { propertyCount: count }
    });

    revalidatePath('/manage/settings');
    revalidatePath('/');
}

export async function syncPropertyTypeCounts() {
    await requireAdmin();

    const types = await prisma.propertyType.findMany();

    for (const type of types) {
        const count = await prisma.property.count({
            where: {
                types: { some: { id: type.id } },
                status: 'approved'
            }
        });
        await prisma.propertyType.update({
            where: { id: type.id },
            data: { propertyCount: count }
        });
    }

    revalidatePath('/manage/settings');
    revalidatePath('/');
}

export async function getSiteSettings() {
    return await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1 }
    });
}

export async function updateSiteSettings(data: {
    show_featured_properties: boolean;
    show_sponsored_deals: boolean;
    show_property_collection: boolean;
    show_explore_categories: boolean;
}) {
    await requireAdmin();
    await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data }
    });
    revalidatePath('/manage/site');
    revalidatePath('/');
}