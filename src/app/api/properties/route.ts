import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { Property, User } from '@prisma/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    try {
        const dbProperties = await prisma.property.findMany({
            include: {
                listedBy: true,
                location: true,
                pricing: true,
                images: true,
                types: true,
                features: true,
                comments: {
                    include: { user: true },
                    orderBy: { created_at: 'asc' }
                },
                property_likes: true
            },
            orderBy: { created_on: 'desc' },
            skip,
            take
        });

        // Normalize data
        const normalized = dbProperties.map((p) => {
            const authorUser = p.listedBy;

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

            // Format price
            const priceValue = p.pricing?.price || 0;
            const formattedPrice = new Intl.NumberFormat('en-NP', {
                style: 'currency',
                currency: 'NPR',
                maximumFractionDigits: 0
            }).format(Number(priceValue)).replace('NPR', 'NRs.');

            // Format location
            const locationStr = p.location
                ? `${p.location.area}, ${p.location.district}`
                : 'Unspecified';

            const specs = p.features
                ? `${p.features.bedrooms || 0}BHK • ${p.features.bathrooms || 0} Bath • ${p.features.builtUpArea || 0} ${p.features.builtUpAreaUnit || ''}`
                : 'Details unspecified';

            return {
                ...p,
                price: formattedPrice,
                location: locationStr,
                images: p.images.map(img => img.url),
                property_types: p.types.map(t => t.name),
                specs: specs,
                // Enrich with author details
                author_username: authorUser ? authorUser.username : null,
                author_name: authorUser ? authorUser.name : 'Unknown',
                author_avatar: authorUser ? (authorUser.profile_picture || (authorUser.name || 'U')[0]) : 'U',
                timestamp
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
