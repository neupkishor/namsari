import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        // Ideally check for admin role here

        const subscribers = await prisma.subscriber.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const subscriber = await prisma.subscriber.upsert({
            where: { email },
            update: { isActive: true },
            create: { email }
        });

        return NextResponse.json(subscriber);
    } catch (error) {
        console.error('Error subscribing:', error);
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }
}
