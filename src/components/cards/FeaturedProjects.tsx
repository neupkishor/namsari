import React from 'react';
import Link from 'next/link';
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
            <AutoScrollCarousel 
                itemWidth="280px" 
                gap="12px"
                desktopItemCount={3}
                tabletItemCount={2}
                mobileItemCount={1.2}
            >
                {displayProjects.map((p) => {
                    const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const propertyUrl = `/properties/${slug}-${p.id}`;
                    const imageUrl = p.images?.[0] ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

                    return (
                        <Link key={p.id} href={propertyUrl} className="no-underline h-full block group">
                            <div className="relative rounded-xl overflow-hidden h-full min-h-[160px] bg-slate-50 border border-gray-100 cursor-pointer">
                                <img
                                    src={imageUrl}
                                    alt={p.title}
                                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500"
                                />
                                
                                {/* Overlay with Title */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end">
                                    <div className="color-white font-bold text-lg mb-1 text-white text-shadow-sm">
                                        {p.title}
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">
                                        {p.property_types?.[0] || 'Project'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </AutoScrollCarousel>
        </section>
    );
};
