"use server";

import { initMapper } from '@/mapper';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export async function createListing(formData: FormData) {
    const mapper = initMapper();

    const title = formData.get('title');
    const price = formData.get('price');
    const location = formData.get('location');
    const main_category = formData.get('main_category');
    const commercial_sub_category = formData.get('commercial_sub_category');
    const specs = formData.get('specs');

    // Dummy data for now since we don't have auth yet
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login');
    }

    const user = await mapper.use('users').where('id', session.id).getOne();
    const author = user ? user.name : "Unknown Agent";
    const listed_by = session.id;
    const likes = "0";
    const timestamp = "Just now";
    const images = JSON.stringify([
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1080"
    ]);

    try {
        await mapper.use('properties').add({
            title,
            price,
            location,
            main_category,
            commercial_sub_category: commercial_sub_category || null,
            specs,
            author,
            likes,
            timestamp,
            images,
            property_types: JSON.stringify(['Residential']), // Default
            purposes: JSON.stringify(['Available for Sale']), // Default
            listed_by,
            created_on: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to add property:", error);
        throw new Error("Failed to create listing.");
    }

    redirect('/');
}
