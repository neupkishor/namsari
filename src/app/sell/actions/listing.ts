"use server";

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export async function createListing(formData: FormData) {

    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const location = formData.get('location') as string;
    const main_category = formData.get('main_category') as string;
    const commercial_sub_category = formData.get('commercial_sub_category') as string;
    const specs = formData.get('specs') as string;

    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login');
    }

    const userId = Number(session.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const author = user ? user.name : "Unknown Agent";

    const imageUrl = formData.get('image_url') as string;
    const images = JSON.stringify([
        imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1080"
    ]);

    try {
        await prisma.property.create({
            data: {
                title,
                price,
                location,
                main_category,
                commercial_sub_category: commercial_sub_category || null,
                specs,
                author,
                likes: 0,
                images,
                property_types: JSON.stringify(['Residential']), // Default
                purposes: JSON.stringify(['Available for Sale']), // Default
                listed_by: userId
            }
        });
    } catch (error: any) {
        console.error("Failed to add property:", error);
        throw new Error("Failed to create listing: " + (error.message || error));
    }

    redirect('/');
}
