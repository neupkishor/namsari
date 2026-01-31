"use server";

import mapper from '@neupgroup/mapper';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export async function createListing(formData: FormData) {

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
    const imageUrl = formData.get('image_url') as string;
    const images = JSON.stringify([
        imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1080"
    ]);

    try {
        await mapper.use('properties').add({
            title: title as string,
            price: price as string,
            location: location as string,
            main_category: main_category as string,
            commercial_sub_category: commercial_sub_category ? commercial_sub_category as string : null,
            specs: specs as string,
            author,
            likes,
            timestamp,
            images,
            property_types: JSON.stringify(['Residential']), // Default
            purposes: JSON.stringify(['Available for Sale']), // Default
            listed_by: Number(listed_by), // Ensure integer for foreign key
            created_on: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Failed to add property:", error);
        throw new Error("Failed to create listing: " + (error.message || error));
    }

    redirect('/');
}
