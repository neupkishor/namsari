import prisma from '@/lib/prisma';
import { jsonError, parseUserId, propertyInclude, serializeProperty } from '../../_lib';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await context.params;
    const id = parseUserId(rawId);
    if (!id) return jsonError('Invalid user ID', 400);

    try {
        const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) return jsonError('User not found', 404);

        const listings = await prisma.property.findMany({
            where: { listedById: id, isPrivate: false },
            include: propertyInclude,
            orderBy: { created_on: 'desc' },
        });

        return Response.json({
            success: true,
            user_id: id,
            count: listings.length,
            listings: listings.map(serializeProperty),
        });
    } catch (error) {
        console.error('Listings API failed:', error);
        return jsonError('Unable to fetch listings', 500);
    }
}
