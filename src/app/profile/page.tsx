import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login?callbackUrl=/profile');
    }

    const userId = parseInt(session.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
    });

    if (!user || !user.username) {
        // User invalid
        redirect('/login');
    }

    redirect(`/@${user.username}`);
}
