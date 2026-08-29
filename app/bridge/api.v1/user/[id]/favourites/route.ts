import prisma from '@/lib/prisma';
import {
    authenticatedUserId,
    jsonError,
    parseUserId,
    propertyInclude,
    serializeProperty,
} from '../../_lib';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await context.params;
    const id = parseUserId(rawId);
    if (!id) return jsonError('Invalid user ID', 400);

    const authenticatedId = authenticatedUserId(request);
    if (!authenticatedId) return jsonError('Authentication required', 401);
    if (authenticatedId !== id) return jsonError('You cannot view another user’s favourites', 403);

    try {
        const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
        if (!user) return jsonError('User not found', 404);

        const favourites = await prisma.like.findMany({
            where: { user_id: id },
            include: { property: { include: propertyInclude } },
            orderBy: { created_at: 'desc' },
        });

        return Response.json({
            success: true,
            user_id: id,
            count: favourites.length,
            favourites: favourites.map(({ property }) => serializeProperty(property)),
        });
    } catch (error) {
        console.error('Favourites API failed:', error);
        return jsonError('Unable to fetch favourites', 500);
    }
}
