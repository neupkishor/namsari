'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

// Helper to verify property access
async function checkPropertyAccess(propertyId: number): Promise<boolean> {
    const session = await getSession();
    if (!session?.id) return false;

    const user = await prisma.account.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!user) return false;

    // Admin can do anything
    if (user.type === 'admin' || user.role?.name?.toLowerCase().includes('admin')) {
        return true;
    }

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { listedBy: true }
    });

    if (!property) return false;

    // Owner can edit
    if (property.listedById === user.id) return true;

    // Agency can edit their agents' properties
    if (user.type === 'agency' && (property?.listedBy as any)?.agency_id === user.id) {
        return true;
    }

    return false;
}

export async function addPropertyImage(propertyId: number, url: string, imageOf: string) {
    const hasAccess = await checkPropertyAccess(propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    await prisma.propertyImage.create({
        data: {
            propertyId,
            url,
            imageOf,
            filename: `prop_${propertyId}_${Date.now()}`
        }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function removePropertyImage(imageId: number) {
    // Need to find propertyId from imageId first
    const image = await prisma.propertyImage.findUnique({
        where: { id: imageId },
        select: { propertyId: true }
    });

    if (!image) return; // Or throw error

    const hasAccess = await checkPropertyAccess(image.propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    await prisma.propertyImage.delete({
        where: { id: imageId }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function updatePropertyStatus(propertyId: number, status: string) {
    const hasAccess = await checkPropertyAccess(propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    await prisma.property.update({
        where: { id: propertyId },
        data: { status }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function updateSoldStatus(propertyId: number, soldStatus: string) {
    const hasAccess = await checkPropertyAccess(propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    await prisma.property.update({
        where: { id: propertyId },
        data: { soldStatus }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}
