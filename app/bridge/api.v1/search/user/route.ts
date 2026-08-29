import prisma from '@/lib/prisma';
import { jsonError } from '../../user/_lib';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim() || '';
    if (q.length < 2) return jsonError('q must contain at least 2 characters', 400);
    const users = await prisma.user.findMany({
        where: { status: 'active', OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
        ] },
        select: { id: true, username: true, name: true, type: true, image: true, profile_picture: true },
        take: Math.min(Number(url.searchParams.get('limit')) || 20, 50),
    });
    return Response.json({ success: true, users });
}
