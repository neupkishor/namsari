import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { Property, User } from '@/generated/prisma';

export async function GET() {
    try {
        const dbProperties = await prisma.property.findMany({
            include: { user: true },
            orderBy: { created_on: 'desc' }
        });

        // Normalize data
        const normalized = dbProperties.map((p: Property & { user: User }) => {
            const authorUser = p.user;

            // Basic relative time calculation
            const now = new Date();
            const diff = now.getTime() - p.created_on.getTime();
            let timestamp = "Just now";
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) timestamp = `${days}d ago`;
            else if (hours > 0) timestamp = `${hours}h ago`;
            else if (minutes > 0) timestamp = `${minutes}m ago`;

            return {
                ...p,
                images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
                property_types: typeof p.property_types === 'string' ? JSON.parse(p.property_types) : p.property_types,
                purposes: typeof p.purposes === 'string' ? JSON.parse(p.purposes) : p.purposes,
                // Enrich with author details
                author_username: authorUser ? authorUser.username : null,
                author_name: authorUser ? authorUser.name : (p.author || 'Unknown'),
                author_avatar: authorUser ? (authorUser.name || 'U')[0] : 'U',
                timestamp
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
