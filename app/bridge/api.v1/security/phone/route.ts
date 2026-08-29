import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, readJsonObject } from '../../user/_lib';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const b = await readJsonObject(request); const password = typeof b?.current_password === 'string' ? b.current_password : ''; const phone = typeof b?.phone === 'string' ? b.phone.trim() : '';
    if (!password || !phone) return jsonError('phone and current_password are required', 400);
    const account = await prisma.account.findUnique({ where: { id: id.toString() }, select: { password_hash: true } });
    if (!account?.password_hash || !(await bcrypt.compare(password, account.password_hash))) return jsonError('Current password is incorrect', 403);
    const user = await prisma.user.update({ where: { id }, data: { contact_number: phone }, select: { id: true, contact_number: true } });
    return Response.json({ success: true, profile: { id: user.id, phone: user.contact_number } });
}
