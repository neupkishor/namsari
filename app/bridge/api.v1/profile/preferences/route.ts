import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, readJsonObject } from '../../user/_lib';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const user = await prisma.user.findUnique({ where: { id }, select: { moreInfo: true } });
    let info: Record<string, any> = {};
    try { info = user?.moreInfo ? JSON.parse(user.moreInfo) : {}; } catch { info = {}; }
    return Response.json({ success: true, preferences: info.preferences || {} });
}
export async function PATCH(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const body = await readJsonObject(request); if (!body) return jsonError('A valid JSON body is required', 400);
    const user = await prisma.user.findUnique({ where: { id }, select: { moreInfo: true } });
    let info: Record<string, any> = {}; try { info = user?.moreInfo ? JSON.parse(user.moreInfo) : {}; } catch { info = {}; }
    info.preferences = { ...(info.preferences || {}), ...body };
    await prisma.user.update({ where: { id }, data: { moreInfo: JSON.stringify(info) } });
    return Response.json({ success: true, preferences: info.preferences });
}
export const POST = PATCH;
