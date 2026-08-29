import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
    createAvailableUsername,
    jsonError,
    publicUserSelect,
    readJsonObject,
    successResponse,
} from '../_lib';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const body = await readJsonObject(request);
    if (!body) return jsonError('A valid JSON body is required', 400);

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const contactNumber = typeof body.contact_number === 'string'
        ? body.contact_number.trim()
        : typeof body.contactNumber === 'string'
            ? body.contactNumber.trim()
            : '';

    if (!name || !email || !password) {
        return jsonError('Name, email, and password are required', 400);
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return jsonError('A valid email is required', 400);
    if (password.length < 8) return jsonError('Password must be at least 8 characters', 400);

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    if (existingUser) return jsonError('Email is already registered', 409);

    const username = await createAvailableUsername(name);
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    username,
                    contact_number: contactNumber || null,
                    type: 'user',
                },
                select: publicUserSelect,
            });

            await tx.account.create({
                data: {
                    id: newUser.id.toString(),
                    type: 'user',
                    provider_account_id: `user:${newUser.id}`,
                    password_hash: passwordHash,
                },
            });

            return newUser;
        });

        await signIn('credentials', {
            identifier: email,
            password,
            redirect: false,
        });

        return successResponse('signup', user, 201);
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
            return jsonError('Email or username is already registered', 409);
        }

        console.error('API sign-up failed:', error);
        return jsonError('Unable to create account', 500);
    }
}
