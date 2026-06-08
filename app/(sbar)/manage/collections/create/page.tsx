import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LoginPromptCard } from '@/components/cards/LoginPromptCard';
import { redirect } from 'next/navigation';
import { CollectionCreateClient } from './CollectionCreateClient';

export default async function CreateCollectionPage() {
    const session = await getSession();
    if (!session) {
        return (
            <LoginPromptCard
                title="Create Collection"
                description="Please login to create a property collection."
            />
        );
    }

    if (session.type !== 'admin') {
        redirect('/manage');
    }

    const [availableProperties, propertyTypes, propertyPurposes, propertyNatures] = await Promise.all([
        prisma.property.findMany({
            where: { isPrivate: false },
            select: {
                id: true,
                propertyId: true,
                title: true,
                status: true,
                price: true,
                location: {
                    select: {
                        area: true,
                        cityVillage: true,
                        district: true
                    }
                },
                images: {
                    take: 1,
                    orderBy: { id: 'asc' },
                    select: { url: true }
                },
                types: { select: { name: true } },
                purposes: { select: { name: true } },
                natures: { select: { name: true } },
                features: {
                    select: {
                        bedrooms: true,
                        bathrooms: true
                    }
                }
            },
            orderBy: { created_on: 'desc' },
            take: 200
        }),
        prisma.propertyType.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
        prisma.propertyPurpose.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
        prisma.propertyNature.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
    ]);

    return (
        <CollectionCreateClient
            availableProperties={availableProperties}
            filterOptions={{
                types: propertyTypes,
                purposes: propertyPurposes,
                natures: propertyNatures
            }}
        />
    );
}
