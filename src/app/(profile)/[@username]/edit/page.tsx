import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import EditProfileClient from '@/app/(profile)/[@username]/edit/EditProfileClient';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';

interface EditProfilePageProps {
    params: Promise<{
        '@username': string;
    }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
    const session = await getSession();
    if (!session) {
        return (
            <LoginPromptCard 
                title="Edit Profile" 
                description="Please login to edit your profile information." 
            />
        );
    }

    const resolvedParams = await params;
    const username = resolvedParams['@username'];

    let decoded = decodeURIComponent(username);
    if (!decoded.startsWith('@')) return notFound();
    decoded = decoded.substring(1);

    const user = await prisma.account.findUnique({
        where: { username: decoded }
    });

    if (!user) return notFound();

    // Authorization Check
    if (session.id !== user.id.toString()) {
        // Redirect to their own edit page or show 403
        // For simplicity redirect to home or show error
        redirect('/');
    }

    return (
        <div style={{ padding: '40px 0' }}>
            <EditProfileClient user={user} />
        </div>
    );
}
