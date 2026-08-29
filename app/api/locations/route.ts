import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        });

        const provinces = locations
            .filter((location) => location.type.toLowerCase() === 'province')
            .map((province) => ({
                id: province.id,
                name: province.name,
                districts: locations
                    .filter((district) => district.parentId === province.id && district.type.toLowerCase() === 'district')
                    .map((district) => ({
                        id: district.id,
                        name: district.name,
                        cities: locations
                            .filter((city) => city.parentId === district.id && ['city', 'village', 'city/village'].includes(city.type.toLowerCase()))
                            .map(({ id, name }) => ({ id, name })),
                    })),
            }));

        return NextResponse.json({ provinces, locations });
    } catch (error) {
        console.error('Failed to load locations:', error);
        return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 });
    }
}
