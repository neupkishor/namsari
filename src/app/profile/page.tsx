import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login?callbackUrl=/profile');
    }

    const userId = parseInt(session.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    listedProperties: true,
                    collections: true,
                    requirements: true
                }
            }
        }
    });

    if (!user) {
        // Session exists but user not found in DB? Clear session ideally, but for now redirect
        redirect('/login');
    }

    const serializedUser = {
        ...user,
        created_on: user.created_on.toISOString(),
        updated_at: user.updated_at.toISOString(),
    };

    // @ts-ignore - Prisma types might be slightly off with _count or strict null checks sometimes
    return <ProfileClient user={serializedUser} currentUser={serializedUser} />;
}
