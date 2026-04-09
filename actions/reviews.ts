'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function submitReview(receiverId: number, rating: number, comment: string) {
    const session = await getSession();
    if (!session || !session.id) {
        throw new Error('You must be logged in to leave a review.');
    }

    const userId = Number(session.id);

    if (userId === receiverId) {
        throw new Error('You cannot review yourself.');
    }

    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5.');
    }

    try {
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { username: true }
        });

        if (!receiver) {
            throw new Error('User not found.');
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                author_id: userId,
                receiver_id: receiverId
            }
        });

        if (existingReview) {
            await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    comment,
                    updated_at: new Date()
                }
            });
        } else {
            await prisma.review.create({
                data: {
                    author_id: userId,
                    receiver_id: receiverId,
                    rating,
                    comment
                }
            });
        }

        revalidatePath(`/@${receiver.username}`);
        revalidatePath(`/@${receiver.username}/reviews`);
        return { success: true };
    } catch (error) {
        console.error('Failed to submit review:', error);
        throw new Error('Failed to submit review. Please try again.');
    }
}
