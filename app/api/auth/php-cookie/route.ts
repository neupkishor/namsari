import { NextResponse } from 'next/server';
import { syncPhpAuthCookieFromSession } from '@/lib/auth';

export async function POST() {
    const synced = await syncPhpAuthCookieFromSession();
    if (!synced) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
}
