import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui';

export function FeaturedCollectionsSection({ collections }: { collections: any[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className="w-full">
            <div className="max-w-container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-primary-light">
                        Curated Collections
                    </h2>
                    <Link href="/manage/collections" className="text-primary font-semibold no-underline hover:underline">
                        Create Yours →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {collections.map(col => (
                        <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            className="no-underline color-inherit group"
                        >
                            <div className="bg-white rounded-xl overflow-hidden h-full border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                                <div className="h-40 bg-slate-50 relative">
                                    {col.properties[0]?.property?.images[0]?.url ? (
                                        <img
                                            src={col.properties[0].property.images[0].url}
                                            alt={col.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-3xl">
                                            📁
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                                        Collection
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold mb-1 truncate text-slate-800">{col.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 h-[2.4em]">
                                        {col.description || 'No description.'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FeaturedCollectionsFeedItem({ collections, className }: { collections: any[], className?: string }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className={`mb-0 ${className || ''}`}>
            <AutoScrollCarousel 
                itemWidth="280px" 
                gap="12px"
                desktopItemCount={3}
                tabletItemCount={2}
                mobileItemCount={1.2}
            >
                {collections.map(col => {
                    const imageUrl = col.properties?.[0]?.property?.images?.[0]?.url || col.properties?.[0]?.property?.images?.[0];
                    const hasImage = !!imageUrl;

                    return (
                        <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            className="no-underline h-full block group"
                        >
                            <div className="relative rounded-lg overflow-hidden h-full min-h-[160px] bg-slate-50 border border-gray-100 cursor-pointer">
                                {hasImage ? (
                                    <img
                                        src={imageUrl}
                                        alt={col.name}
                                        className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-3xl bg-[linear-gradient(45deg,#f1f5f9_25%,#e2e8f0_25%,#e2e8f0_50%,#f1f5f9_50%,#f1f5f9_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:20px_20px]">
                                        📁
                                    </div>
                                )}
                                
                                {/* Overlay with Title */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                                    <div className="text-white font-bold text-lg mb-1 drop-shadow-md">
                                        {col.name}
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">
                                        {col.properties?.length || 0} Properties
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </AutoScrollCarousel>
        </section>
    );
}
