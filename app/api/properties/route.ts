import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { legacyPricingFromPrice } from '@/lib/pricing';

import { Property, User } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { createPropertyListing } from '@/lib/services/property';

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
            listedBy: {
                include: {
                    _count: { select: { listedProperties: true } }
                }
            },
                location: true,
                propertyPrices: {
                    where: { isDefault: true },
                    take: 1,
                },
                propertyMedia: {
                    orderBy: { index: 'asc' }
                },
                natures: true,
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
            const storedPrice = p.propertyPrices?.[0];
            const displayPrice = typeof storedPrice?.display === 'string'
                ? storedPrice.display.trim()
                : '';
            const priceValue = Number(displayPrice.replace(/[^0-9.]/g, ''));
            const hasNumericPrice = displayPrice.length > 0 && Number.isFinite(priceValue);
            const displayRate = String(storedPrice?.base || '').includes('PerMonth')
                ? 'perMonth'
                : 'total';
            const formattedPrice = new Intl.NumberFormat('en-NP', {
                style: 'currency',
                currency: 'NPR',
                maximumFractionDigits: 0
            }).format(hasNumericPrice ? priceValue : 0).replace('NPR', 'NRs.');

            // Format location
            const locationStr = p.location
                ? `${p.location.area}, ${p.location.district}`
                : 'Unspecified';

            const specs = p.features
                ? `${p.features.bedrooms || 0}BHK • ${p.features.bathrooms || 0} Bath • ${p.features.builtUpArea || 0} ${p.features.builtUpAreaUnit || ''}`
                : 'Details unspecified';

            return {
                ...p,
                pricing: hasNumericPrice
                    ? legacyPricingFromPrice({ price: priceValue, rate: displayRate })
                    : null,
                price: hasNumericPrice ? formattedPrice : (displayPrice || ''),
                location: locationStr,
                latitude: p.location?.latitude,
                longitude: p.location?.longitude,
                images: (p.propertyMedia || [])
                    .filter((media: any) => media.type === 'image')
                    .map((media: any) => media.resourceUrl),
                property_types: p.types.map((t: any) => t.name),
                specs: specs,
                // Enrich with author details
                author_username: authorUser ? authorUser.username : null,
                author_name: authorUser ? authorUser.name : 'Unknown',
                author_avatar: (authorUser as any)?.profile_picture || ((authorUser as any)?.name || 'U')[0],
                author_phone: (authorUser as any)?.contact_number || null,
                timestamp,
                // Ensure listedBy has phone so feed cards can build WhatsApp/tel links
                listedBy: authorUser ? {
                    ...authorUser,
                    phone: (authorUser as any).contact_number || null,
                    whatsapp: (authorUser as any).contact_number || null,
                } : null,
            };
        });

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        const body = await request.json();
        const required = ['title', 'types', 'purposes', 'natures', 'location'];
        if (required.some((key) => !body[key] || (Array.isArray(body[key]) && body[key].length === 0))) {
            return NextResponse.json({ error: 'Missing required listing fields' }, { status: 400 });
        }
        const property = await createPropertyListing({
            ...body,
            listedById: Number(session.id),
            images: Array.isArray(body.images) ? body.images : [],
        });
        return NextResponse.json({ success: true, property: { id: property.id } }, { status: 201 });
    } catch (error) {
        console.error('Property creation API error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create property' }, { status: 500 });
    }
}
