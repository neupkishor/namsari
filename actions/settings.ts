'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const PROPERTY_TYPE_COUNT_TTL_MS = 24 * 60 * 60 * 1000;

async function requireAdmin() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({ where: { id: parseInt(session.id) } });
    if (user?.type !== 'admin') throw new Error('Unauthorized');
}

function isPropertyTypeCountStale(updatedAt: Date | null | undefined) {
    if (!updatedAt) return true;
    return Date.now() - updatedAt.getTime() > PROPERTY_TYPE_COUNT_TTL_MS;
}

async function refreshPropertyTypeCounts() {
    const types = await prisma.propertyType.findMany({
        orderBy: { name: 'asc' }
    });

    await Promise.all(
        types.map(async (type) => {
            const count = await prisma.property.count({
                where: {
                    status: 'approved',
                    types: {
                        some: { id: type.id }
                    }
                }
            });

            await prisma.propertyType.update({
                where: { id: type.id },
                data: { propertyCount: count }
            });
        })
    );
}

export async function getPropertyTypeCounts() {
    const propertyTypes = await prisma.propertyType.findMany({
        orderBy: { name: 'asc' }
    });

    if (propertyTypes.some((type) => isPropertyTypeCountStale(type.updated_at))) {
        await refreshPropertyTypeCounts();
        return await prisma.propertyType.findMany({
            orderBy: { name: 'asc' }
        });
    }

    return propertyTypes;
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

    await refreshPropertyTypeCounts();

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
    show_hero_carousel_ad: boolean;
    show_feed_ad: boolean;
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
