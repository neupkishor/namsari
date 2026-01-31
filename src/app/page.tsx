import HomeClient from './HomeClient';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function HomePage() {
    const session = await getSession();
    let user = null;

    if (session?.id) {
        try {
            user = await prisma.user.findUnique({
                where: { id: Number(session.id) }
            });
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    }
    return <HomeClient user={user} />;
}
