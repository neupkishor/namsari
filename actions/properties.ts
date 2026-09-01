'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { getAgencyConfigByAgencyId } from '@/actions/agency-config';

// Helper to verify property access
async function checkPropertyAccess(propertyId: number): Promise<boolean> {
    const session = await getSession();
    if (!session?.id) return false;

    const user = await prisma.user.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true }
    });

    if (!user) return false;

    // Admin can do anything
    if (user.type === 'admin' || user.role?.role?.toLowerCase().includes('admin')) {
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

    await prisma.propertyMedia.create({
        data: {
            propertyId,
            type: 'image',
            resourceUrl: url,
            index: (await prisma.propertyMedia.count({ where: { propertyId } }))
        }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function removePropertyImage(imageId: number) {
    // Need to find propertyId from imageId first
    const image = await prisma.propertyMedia.findUnique({
        where: { id: imageId },
        select: { propertyId: true }
    });

    if (!image) return; // Or throw error

    const hasAccess = await checkPropertyAccess(image.propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    await prisma.propertyMedia.delete({
        where: { id: imageId }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function reorderPropertyImages(propertyId: number, orderedImageIds: number[]) {
    const hasAccess = await checkPropertyAccess(propertyId);
    if (!hasAccess) {
        throw new Error("Unauthorized");
    }

    if (!Array.isArray(orderedImageIds) || orderedImageIds.length === 0) return;

    const images = await prisma.propertyMedia.findMany({
        where: { propertyId },
        orderBy: { index: 'asc' }
    });

    if (images.length !== orderedImageIds.length) {
        throw new Error("Invalid image ordering payload");
    }

    const imageById = new Map(images.map((img) => [img.id, img]));
    const reordered = orderedImageIds.map((id) => imageById.get(id)).filter(Boolean) as typeof images;

    if (reordered.length !== images.length) {
        throw new Error("Invalid image ordering payload");
    }

    await prisma.$transaction(
        reordered.map((img, index) => prisma.propertyMedia.update({
            where: { id: img.id },
            data: { index }
        }))
    );

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

    await prisma.propertySaleStatus.create({
        data: {
            propertyId,
            status: soldStatus,
        }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function deletePropertyListing(propertyId: number) {
    const session = await getSession();
    if (!session?.id) {
        throw new Error('Unauthorized');
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: parseInt(session.id) },
        include: { role: true },
    });

    if (!currentUser) {
        throw new Error('Unauthorized');
    }

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { listedBy: true },
    });

    if (!property) {
        throw new Error('Property not found');
    }

    const roleName = currentUser.role?.role?.toLowerCase() || '';
    const isAdmin = currentUser.type === 'admin' || roleName.includes('admin');
    const isAgencyOwner = currentUser.type === 'agency' && (property?.listedBy as any)?.agency_id === currentUser.id;
    const isOwnProperty = property.listedById === currentUser.id;
    const isAgent = currentUser.type === 'agent';

    if (!isAdmin && !isAgencyOwner && !isOwnProperty) {
        throw new Error('Unauthorized');
    }

    if (isAgent && currentUser.agency_id) {
        const agencyConfig = await getAgencyConfigByAgencyId(currentUser.agency_id);
        if (agencyConfig && agencyConfig.canAgentDelete === false) {
            throw new Error('This agency does not allow agents to delete listings.');
        }
    }

    await prisma.property.delete({
        where: { id: propertyId },
    });

    revalidatePath('/manage/properties');
    revalidatePath('/manage/properties/[slugAndId]', 'page');
    revalidatePath('/');
}
