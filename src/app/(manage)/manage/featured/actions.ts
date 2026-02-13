'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleFeatured(propertyId: number) {
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (!property) throw new Error('Property not found');

    const newStatus = !property.isFeatured;

    // Use a transaction to ensure database consistency
    await prisma.$transaction(async (tx) => {
        // 1. Update the property status
        await tx.property.update({
            where: { id: propertyId },
            data: { isFeatured: newStatus }
        });

        if (newStatus) {
            // 2. If becoming featured, create a new history record
            await tx.featuredInformation.create({
                data: {
                    property_id: propertyId,
                    is_active: true,
                    featured_on: new Date()
                }
            });
        } else {
            // 3. If being removed from featured, close the active history record
            const activeFeatured = await tx.featuredInformation.findFirst({
                where: {
                    property_id: propertyId,
                    is_active: true
                }
            });

            if (activeFeatured) {
                await tx.featuredInformation.update({
                    where: { id: activeFeatured.id },
                    data: {
                        is_active: false,
                        featured_till: new Date()
                    }
                });
            }
        }
    });

    revalidatePath('/manage/featured');
    revalidatePath('/');
}
