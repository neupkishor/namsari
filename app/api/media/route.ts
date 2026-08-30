import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
    return NextResponse.json({ error: 'Media records must be created through /api/uploads' }, { status: 410 });
}
