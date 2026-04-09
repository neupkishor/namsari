import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const regex = /^[a-zA-Z0-9_.]+$/;

    if (!username || username.length < 3) {
        return NextResponse.json({ available: false, error: 'Username must be at least 3 characters' });
    }

    if (!regex.test(username)) {
        return NextResponse.json({ available: false, error: 'Username contains invalid characters' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        return NextResponse.json({ available: !user });
    } catch (error) {
        console.error('Check username error:', error);
        return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 });
    }
}
