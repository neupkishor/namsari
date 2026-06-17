import React from 'react';
import Link from 'next/link';
import { InternalPropertyLink } from '@/components/navigation/InternalPropertyLink';
import { AutoScrollCarousel } from '@/components/ui';

interface FeaturedProjectsProps {
    properties?: any[];
    className?: string;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ properties = [], className }) => {
    const displayProjects = properties.filter(p => p.isFeatured);

    if (displayProjects.length === 0) {
        return (
            <section className={className}>
                <div className="p-10 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-white">
                    <p>No featured projects have been assigned yet.</p>
                    <Link href="/manage/featured" className="text-primary text-sm mt-2 inline-block hover:underline">
                        Manage Featured List
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className={className}>
            <div style={{
                marginBottom: '24px',
                paddingLeft: '16px'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    margin: '0',
                    letterSpacing: '-0.5px'
                }}>
                    ⭐ Featured Projects
                </h2>
            </div>
            <AutoScrollCarousel 
                itemWidth="320px" 
                gap="16px"
                desktopItemCount={3}
                tabletItemCount={2}
                mobileItemCount={1}
            >
                {displayProjects.map((p) => {
                    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const propertyUrl = `/properties/${slug}-${p.id}`;
                    const imageUrl = p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                    const price = p.pricing?.price ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(p.pricing.price).replace('NPR', 'Rs.') : 'N/A';

                    return (
                        <InternalPropertyLink key={p.id} href={propertyUrl} className="no-underline h-full block group">
                            <div className="relative rounded-2xl overflow-hidden h-full min-h-[240px] bg-slate-50 border border-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                                <img
                                    src={imageUrl}
                                    alt={p.title}
                                    className="w-full h-full object-cover block group-hover:scale-110 transition-transform duration-700 absolute inset-0"
                                />
                                
                                {/* Featured Badge */}
                                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                    ⭐ Featured
                                </div>

                                {/* Overlay with Title */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 group-hover:from-black/95 transition-all duration-300">
                                    <div className="text-white font-black text-lg mb-2 line-clamp-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                                        {p.title}
                                    </div>
                                    <div className="text-white/80 text-sm font-semibold mb-3">
                                        {p.property_types?.[0] || 'Project'}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-white font-black text-lg">
                                            {price}
                                        </div>
                                        <div className="bg-primary/90 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            View →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </InternalPropertyLink>
                    );
                })}
            </AutoScrollCarousel>
        </section>
    );
};
