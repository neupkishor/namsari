'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPropertyTypeCounts() {
    return await prisma.propertyType.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function updatePropertyTypeCount(id: number, count: number) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.id) }
    });

    if (user?.type !== 'admin') {
        throw new Error("Unauthorized");
    }

    await prisma.propertyType.update({
        where: { id },
        data: { propertyCount: count }
    });

    revalidatePath('/manage/settings');
    revalidatePath('/'); // Update homepage
}

export async function syncPropertyTypeCounts() {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.id) }
    });

    if (user?.type !== 'admin') {
        throw new Error("Unauthorized");
    }

    const types = await prisma.propertyType.findMany();

    for (const type of types) {
        const count = await prisma.property.count({
            where: {
                types: {
                    some: {
                        id: type.id
                    }
                },
                status: 'approved' // Only count approved properties
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