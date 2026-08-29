import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, readJsonObject } from '../../user/_lib';
export const runtime = 'nodejs';
export async function POST(request: Request) {
    const id = authenticatedUserId(request); if (!id) return jsonError('Authentication required', 401);
    const b = await readJsonObject(request); const password = typeof b?.current_password === 'string' ? b.current_password : ''; const email = typeof b?.email === 'string' ? b.email.trim().toLowerCase() : '';
    if (!password || !/^\S+@\S+\.\S+$/.test(email)) return jsonError('A valid email and current_password are required', 400);
    const account = await prisma.account.findUnique({ where: { id: id.toString() }, select: { password_hash: true } });
    if (!account?.password_hash || !(await bcrypt.compare(password, account.password_hash))) return jsonError('Current password is incorrect', 403);
    try { const user = await prisma.user.update({ where: { id }, data: { email }, select: { id: true, email: true } }); return Response.json({ success: true, profile: user }); }
    catch (e: any) { return e?.code === 'P2002' ? jsonError('Email already in use', 409) : jsonError('Unable to update email', 500); }
}
