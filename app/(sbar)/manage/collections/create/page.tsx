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
            where: {},
            select: {
                id: true,
                propertyId: true,
                title: true,
                status: true,
                propertyPrices: { orderBy: { isDefault: 'desc' }, take: 1 },
                location: {
                    select: {
                        area: true,
                        cityVillage: true,
                        district: true
                    }
                },
                propertyMedia: {
                    take: 1,
                    orderBy: { index: 'asc' },
                    select: { resourceUrl: true }
                },
                types: true,
                purposes: true,
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
        Promise.resolve(['apartment', 'bungalow', 'commercial_space', 'house', 'land', 'penthouse', 'villa'].map((name, id) => ({ id: id + 1, name }))),
        Promise.resolve(['sale', 'rent'].map((name, id) => ({ id: id + 1, name }))),
        prisma.propertyNature.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
    ]);

    const normalizedProperties = availableProperties.map((property) => ({
        ...property,
        price: {
            price: Number(String(property.propertyPrices[0]?.display || '').replace(/[^0-9.]/g, '')) || 0
        },
        images: property.propertyMedia.map((media) => ({ url: media.resourceUrl })),
        types: property.types.map((name) => ({ name })),
        purposes: property.purposes.map((name) => ({ name }))
    }));

    return (
        <CollectionCreateClient
            availableProperties={normalizedProperties}
            filterOptions={{
                types: propertyTypes,
                purposes: propertyPurposes,
                natures: propertyNatures
            }}
        />
    );
}
