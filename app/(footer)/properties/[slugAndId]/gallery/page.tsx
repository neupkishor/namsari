import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function GalleryPage({ params }: { params: Promise<{ slugAndId: string }> }) {
    const resolvedParams = await params;
    const { slugAndId } = resolvedParams;

    // Extract numeric ID from slug-id format (robust against malformed slug text)
    const idMatch = slugAndId.match(/(\d+)(?!.*\d)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : NaN;

    if (isNaN(id)) return notFound();

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            propertyMedia: {
                where: { type: 'image' },
                orderBy: { index: 'asc' },
            },
        }
    });

    if (!property) return notFound();

    const images = property.propertyMedia.map((img) => img.resourceUrl);

    return (
        <div style={{ backgroundColor: 'black', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <Link href={`/properties/${slugAndId}`} style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem', fontWeight: '600' }}>
                    ✕ Close
                </Link>
                <div style={{ fontSize: '1rem' }}>{images.length} Photos</div>
            </div>

            <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '4px',
                padding: '4px',
                alignContent: 'start'
            }}>
                {images.map((img: string, idx: number) => (
                    <div key={idx} style={{ position: 'relative', aspectRatio: '1.5/1' }}>
                        <img
                            src={img}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            alt={`Gallery ${idx + 1}`}
                        />
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    No images available
                </div>
            )}
        </div>
    );
}
