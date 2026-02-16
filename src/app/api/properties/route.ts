import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { Property, Account as User } from '@prisma/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');

    const where: any = {};

    if (north && south && east && west) {
        where.location = {
            latitude: {
                gte: parseFloat(south),
                lte: parseFloat(north)
            },
            longitude: {
                gte: parseFloat(west),
                lte: parseFloat(east)
            }
        };
    }

    try {
        const dbProperties = await prisma.property.findMany({
            where,
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
        const normalized = dbProperties.map((p: any) => {
            const authorUser = p.listedBy;

            // Basic relative time calculation
            const now = new Date();
            const diff = now.getTime() - new Date(p.created_on).getTime();
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
                latitude: p.location?.latitude,
                longitude: p.location?.longitude,
                images: p.images.map((img: any) => img.url),
                property_types: p.types.map((t: any) => t.name),
                specs: specs,
                // Enrich with author details
                author_username: authorUser ? authorUser.username : null,
                author_name: authorUser ? authorUser.name : 'Unknown',
                author_avatar: (authorUser as any)?.profile_picture || ((authorUser as any)?.name || 'U')[0],
                author_phone: (authorUser as any)?.contact_number || null,
                timestamp
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
