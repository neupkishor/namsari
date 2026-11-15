import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';

// Holds the server side of the profile layout boundary.
export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

// Loads the profile and its sidebar statistics on the server.
export async function loadProfileLayout(params: Promise<{ '@username': string }>) {
  const resolvedParams = await params;
  const username = resolvedParams['@username'];
  const session = await getSession();

  let decoded = decodeURIComponent(username);
  if (!decoded.startsWith('@')) notFound();
  decoded = decoded.substring(1);

  const user = await prisma.user.findUnique({ where: { username: decoded } });
  if (!user) notFound();

  const isOwner = session?.id === user.id.toString();
  const [listingsCount, reviewsAggregate] = await Promise.all([
    prisma.property.count({ where: { listedById: user.id } }),
    prisma.review.aggregate({
      where: { receiver_id: user.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    user,
    isOwner,
    listingsCount,
    averageRating: reviewsAggregate._avg.rating || 0,
    reviewCount: reviewsAggregate._count.rating || 0,
  };
}
