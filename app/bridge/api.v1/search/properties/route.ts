import prisma from '@/lib/prisma';
import { jsonError, propertyInclude, serializeProperty } from '../../user/_lib';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() || '';
    const status = url.searchParams.get('status') || 'approved';
    const properties = await prisma.property.findMany({
        where: { status, ...(q ? { OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { propertyId: { contains: q, mode: 'insensitive' } },
            { location: { is: { OR: [
                { area: { contains: q, mode: 'insensitive' } },
                { cityVillage: { contains: q, mode: 'insensitive' } },
                { district: { contains: q, mode: 'insensitive' } },
            ] } } },
        ] } : {}) },
        include: propertyInclude, orderBy: { created_on: 'desc' },
        take: Math.min(Number(url.searchParams.get('limit')) || 20, 50),
    });
    return Response.json({ success: true, properties: properties.map(serializeProperty) });
}
