import { initMapper } from '@/mapper';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const mapper = initMapper();
        // Fetch from SQLite via mapper
        const dbProperties = await mapper.use('properties').get();

        // Normalize data (parse JSON strings for images/tags if necessary, though mapper might handle simple mapping)
        const normalized = dbProperties.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
            property_types: typeof p.property_types === 'string' ? JSON.parse(p.property_types) : p.property_types,
            purposes: typeof p.purposes === 'string' ? JSON.parse(p.purposes) : p.purposes,
        }));

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }
}
