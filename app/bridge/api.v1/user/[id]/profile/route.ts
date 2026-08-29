import prisma from '@/lib/prisma';
import { jsonError, parseUserId } from '../../_lib';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await context.params;
    const id = parseUserId(rawId);
    if (!id) return jsonError('Invalid user ID', 400);

    try {
        const profile = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                name: true,
                type: true,
                bio: true,
                image: true,
                profile_picture: true,
                cover_image: true,
                contact_number: true,
                created_on: true,
                agency_id: true,
                _count: {
                    select: {
                        listedProperties: true,
                        reviews_received: true,
                        agents: true,
                    },
                },
            },
        });

        if (!profile) return jsonError('User not found', 404);
        return Response.json({ success: true, profile });
    } catch (error) {
        console.error('Profile API failed:', error);
        return jsonError('Unable to fetch profile', 500);
    }
}
