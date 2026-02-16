"use server";

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleLike(propertyId: number) {
    const session = await getSession();
    if (!session || !session.id) {
        throw new Error("Authentication required");
    }

    const userId = Number(session.id);

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                property_id_user_id: {
                    property_id: propertyId,
                    user_id: userId
                }
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
        } else {
            await prisma.like.create({
                data: {
                    property_id: propertyId,
                    user_id: userId
                }
            });
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Like error:", error);
        throw new Error("Failed to process like");
    }
}

export async function addComment(propertyId: number, content: string) {
    const session = await getSession();
    if (!session || !session.id) {
        throw new Error("Authentication required");
    }

    if (!content.trim()) {
        throw new Error("Comment cannot be empty");
    }

    const userId = Number(session.id);

    try {
        await prisma.comment.create({
            data: {
                content,
                property_id: propertyId,
                user_id: userId
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Comment error:", error);
        throw new Error("Failed to add comment");
    }
}
