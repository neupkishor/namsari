import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, readJsonObject } from '../../user/_lib';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const b = await readJsonObject(request); const current = typeof b?.current_password === 'string' ? b.current_password : ''; const password = typeof b?.password === 'string' ? b.password : '';
    if (!current || !password || password.length < 8) return jsonError('current_password and a password of at least 8 characters are required', 400);
    const account = await prisma.account.findUnique({ where: { id: id.toString() }, select: { password_hash: true } });
    if (!account?.password_hash || !(await bcrypt.compare(current, account.password_hash))) return jsonError('Current password is incorrect', 403);
    await prisma.account.update({ where: { id: id.toString() }, data: { password_hash: await bcrypt.hash(password, 10) } });
    return Response.json({ success: true });
}
