import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileEditClient from './ProfileEditClient';

export default async function ProfileEditPage() {
    const session = await getSession();
    if (!session || !session.id) {
        redirect('/login?callbackUrl=/profile/edit');
    }

    const userId = parseInt(session.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            contact_number: true,
            profile_picture: true
        }
    });

    if (!user) {
        redirect('/login');
    }

    return <ProfileEditClient user={user} />;
}
