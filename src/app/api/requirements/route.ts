import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const session = await getSession();

        // We allow posting as guest (userId might be null)
        // but if session exists, we use it.
        const userId = session?.id ? parseInt(session.id) : body.userId;

        // @ts-ignore - prisma client might not have updated in lint yet
        const requirement = await prisma.requirement.create({
            data: {
                ...body,
                userId: userId || null,
            }
        });

        return NextResponse.json(requirement);
    } catch (error) {
        console.error('Error creating requirement:', error);
        return NextResponse.json({ error: 'Failed to create requirement' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        const where = userId ? { userId: parseInt(userId) } : {};

        const requirements = await prisma.requirement.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            }
        });

        return NextResponse.json(requirements);
    } catch (error) {
        console.error('Error fetching requirements:', error);
        return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
    }
}
