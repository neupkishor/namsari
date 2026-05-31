import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                parentId: true,
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({ locations });
    } catch (error) {
        console.error('Failed to load locations:', error);
        return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 });
    }
}