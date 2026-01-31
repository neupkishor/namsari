'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addPropertyImage(propertyId: number, url: string, imageOf: string) {
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
    await prisma.propertyImage.delete({
        where: { id: imageId }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function updatePropertyStatus(propertyId: number, status: string) {
    await prisma.property.update({
        where: { id: propertyId },
        data: { status }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}

export async function updateSoldStatus(propertyId: number, soldStatus: string) {
    await prisma.property.update({
        where: { id: propertyId },
        data: { soldStatus }
    });
    revalidatePath(`/manage/properties/[slugAndId]`, 'page');
}
