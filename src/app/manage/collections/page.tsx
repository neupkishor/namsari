import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./CollectionsClient";

export default async function CollectionsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const rawCollections = await prisma.collection.findMany({
        where: { user_id: session.id },
        include: {
            properties: {
                include: {
                    property: {
                        select: {
                            id: true,
                            images: {
                                take: 1,
                                select: { url: true } // Be specific to avoid over-fetching
                            }
                        }
                    }
                },
                take: 1, // We only show 1 cover image in the UI list anyway
                orderBy: { added_at: 'desc' }
            }
        },
        orderBy: { updated_at: 'desc' }
    });

    // Flatten for client consumption to match previous structure approx
    const collections = rawCollections.map(c => ({
        ...c,
        properties: c.properties.map(cp => ({
            id: cp.property.id,
            images: cp.property.images
        }))
    }));

    return <CollectionsClient initialCollections={collections} userId={session.id} />;
}
