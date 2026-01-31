"use server";

import { initMapper } from '@/mapper';
import { redirect } from 'next/navigation';

export async function createListing(formData: FormData) {
    const mapper = initMapper();

    const title = formData.get('title');
    const price = formData.get('price');
    const location = formData.get('location');
    const main_category = formData.get('main_category');
    const commercial_sub_category = formData.get('commercial_sub_category');
    const specs = formData.get('specs');

    // Dummy data for now since we don't have auth yet
    const author = "Anonymous User";
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
            purposes: JSON.stringify(['Available for Sale']) // Default
        });
    } catch (error) {
        console.error("Failed to add property:", error);
        return { error: "Failed to create listing." };
    }

    redirect('/');
}
