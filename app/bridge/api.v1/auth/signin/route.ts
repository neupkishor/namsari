import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonError, publicUserSelect, readJsonObject, successResponse } from '../_lib';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const body = await readJsonObject(request);
    if (!body) return jsonError('A valid JSON body is required', 400);

    const identifier = typeof body.identifier === 'string'
        ? body.identifier.trim()
        : typeof body.email === 'string'
            ? body.email.trim()
            : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifier || !password) {
        return jsonError('Identifier and password are required', 400);
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier.toLowerCase() },
                { username: identifier },
                { contact_number: identifier },
            ],
        },
        select: {
            ...publicUserSelect,
            status: true,
        },
    });

    if (!user || user.status === 'banned' || user.status === 'suspended') {
        return jsonError('Invalid credentials', 401);
    }

    const account = await prisma.account.findUnique({
        where: { id: user.id.toString() },
        select: { password_hash: true },
    });
    const validPassword = account?.password_hash
        ? await bcrypt.compare(password, account.password_hash)
        : false;

    if (!validPassword) return jsonError('Invalid credentials', 401);

    // Use Auth.js to issue the same session cookie as the browser login flow.
    await signIn('credentials', { identifier, password, redirect: false });

    return successResponse('signin', user);
}
