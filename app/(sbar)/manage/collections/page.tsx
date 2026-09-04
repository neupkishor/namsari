import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CollectionsClient } from "@/app/(sbar)/manage/collections/CollectionsClient";
import { LoginPromptCard } from "@/components/cards/LoginPromptCard";
import { redirect } from 'next/navigation';

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getSession();
    if (!session) {
        return (
            <LoginPromptCard 
                title="Manage Your Collections" 
                description="Please login to view and manage your saved property collections." 
            />
        );
    }

    if (session.type !== 'admin') {
         redirect('/manage');
    }

    const userId = parseInt(session.id); // Convert to number for DB and Client

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [rawCollections, totalCount, availableProperties, propertyTypes, propertyPurposes, propertyNatures] = await Promise.all([
        prisma.collection.findMany({
            where: { user_id: userId },
            include: {
                _count: {
                    select: { properties: true }
                },
                properties: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                propertyMedia: {
                                    take: 1,
                                    select: { resourceUrl: true }
                                }
                            }
                        }
                    },
                    take: 1,
                    orderBy: { added_at: 'desc' }
                }
            },
            orderBy: { updated_at: 'desc' },
            skip,
            take: limit
        }),
        prisma.collection.count({ where: { user_id: userId } }),
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
        price: { price: Number(String(property.propertyPrices[0]?.display || '').replace(/[^0-9.]/g, '')) || 0 },
        images: property.propertyMedia.map((media) => ({ url: media.resourceUrl })),
        types: property.types.map((name) => ({ name })),
        purposes: property.purposes.map((name) => ({ name }))
    }));

    const totalPages = Math.ceil(totalCount / limit);

    // Flatten for client consumption
    const collections = rawCollections.map((c: any) => ({
        ...c,
        propertyCount: c._count?.properties ?? 0,
        properties: c.properties.map((cp: any) => ({
            id: cp.property.id,
            images: cp.property.propertyMedia.map((media: { resourceUrl: string }) => ({ url: media.resourceUrl }))
        }))
    }));

    return (
        <CollectionsClient
            initialCollections={collections}
            userId={userId}
            totalPages={totalPages}
            availableProperties={normalizedProperties}
            filterOptions={{
                types: propertyTypes,
                purposes: propertyPurposes,
                natures: propertyNatures
            }}
        />
    );
}
