'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function recordSearch(term: string) {
    if (!term || term.trim().length === 0) return;

    const searchTerm = term.trim().toLowerCase();

    try {
        await prisma.searchTerm.upsert({
            where: { term: searchTerm },
            update: {
                count: { increment: 1 },
                last_searched: new Date()
            },
            create: {
                term: searchTerm,
                count: 1
            }
        });

        // Optionally revalidate relevant paths if they display search data
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to record search:', error);
    }
}

export async function getTrendingSearches() {
    try {
        // Fetch all search terms ordered by count desc
        const allTerms = await prisma.searchTerm.findMany({
            orderBy: { count: 'desc' }
        });

        if (allTerms.length === 0) return [];

        // "30% searches that have the most searches"
        // Let's take the top 30% of the list.
        const top30PercentIndex = Math.ceil(allTerms.length * 0.3);
        const topPool = allTerms.slice(0, Math.max(top30PercentIndex, 5)); // Ensure at least top 5 if less exist

        // Select random subset from this top pool to display
        // Let's say we want to show up to 10 tags
        const shuffled = topPool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10).map(t => t.term);
    } catch (error) {
        console.error('Failed to get trending searches:', error);
        return [];
    }
}
