import { initMapper } from '@/mapper';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const mapper = initMapper();
        // Fetch from SQLite via mapper
        const dbProperties = await mapper.use('properties').get();

        // Fetch all users to join manually (since mapper might not support joins yet or for simplicity)
        const users = await mapper.use('users').get();
        const userMap = new Map(users.map((u: any) => [u.id, u]));

        // Normalize data
        const normalized = dbProperties.map((p: any) => {
            const authorUser = userMap.get(p.listed_by);
            return {
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
                property_types: typeof p.property_types === 'string' ? JSON.parse(p.property_types) : p.property_types,
                purposes: typeof p.purposes === 'string' ? JSON.parse(p.purposes) : p.purposes,
                // Enrich with author details
                author_username: authorUser ? authorUser.username : null,
                author_name: authorUser ? authorUser.name : (p.author || 'Unknown'),
                author_avatar: authorUser ? (authorUser.name || 'U')[0] : 'U'
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
