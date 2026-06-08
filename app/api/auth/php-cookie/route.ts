import { NextResponse } from 'next/server';
import { syncPhpAuthCookieFromSession } from '@/lib/auth';

export async function POST() {
    const token = await syncPhpAuthCookieFromSession();
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, token });
}
