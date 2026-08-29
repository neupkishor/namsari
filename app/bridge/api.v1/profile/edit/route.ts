import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, readJsonObject } from '../../user/_lib';

export const runtime = 'nodejs';
export async function PATCH(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const body = await readJsonObject(request); if (!body) return jsonError('A valid JSON body is required', 400);
    const data: Record<string, string | null> = {};
    for (const key of ['name', 'username', 'bio'] as const) if (key in body) data[key] = typeof body[key] === 'string' ? body[key] as string : null;
    if (!Object.keys(data).length) return jsonError('No editable profile fields supplied', 400);
    const user = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, bio: true, username: true, email: true, contact_number: true, image: true, profile_picture: true } });
    return Response.json({ success: true, profile: user });
}
export const POST = PATCH;
