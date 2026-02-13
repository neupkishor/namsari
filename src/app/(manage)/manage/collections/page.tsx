import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./CollectionsClient";

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const userId = parseInt(session.id); // Convert to number for DB and Client

    const { page: pageParam } = await searchParams;
    const page = Number(pageParam) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [rawCollections, totalCount] = await Promise.all([
        prisma.collection.findMany({
            where: { user_id: userId },
            include: {
                properties: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                images: {
                                    take: 1,
                                    select: { url: true }
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
        prisma.collection.count({ where: { user_id: userId } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Flatten for client consumption
    const collections = rawCollections.map(c => ({
        ...c,
        properties: c.properties.map(cp => ({
            id: cp.property.id,
            images: cp.property.images
        }))
    }));

    return <CollectionsClient initialCollections={collections} userId={userId} totalPages={totalPages} />;
}
