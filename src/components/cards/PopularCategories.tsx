import React from 'react';
import Link from 'next/link';
import { AutoScrollCarousel } from '@/components/ui';

interface Category {
    id: string;
    name: string;
    count: number;
    icon: string;
}

interface PopularCategoriesProps {
    categories?: Category[];
}

const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('house')) return '🏠';
    if (n.includes('land')) return '🗺️';
    if (n.includes('flat')) return '🏢';
    if (n.includes('office')) return '🏨';
    if (n.includes('shop')) return '🛍️';
    if (n.includes('apartment')) return '🏘️';
    return '🏙️';
};

const defaultCategories: Category[] = [
    { id: 'house', name: 'House', count: 3683, icon: '🏠' },
    { id: 'land', name: 'Land', count: 2009, icon: '🗺️' },
    { id: 'flats', name: 'Flats', count: 94, icon: '🏢' },
    { id: 'office', name: 'Office Space', count: 207, icon: '🏨' },
    { id: 'shop', name: 'Shop Space', count: 23, icon: '🛍️' },
    { id: 'apartment', name: 'Apartment', count: 235, icon: '🏘️' },
];

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ categories = defaultCategories }) => {
    const displayCategories = categories.map(cat => ({
        ...cat,
        icon: cat.icon || getIconForCategory(cat.name)
    }));

    return (
        <section className="w-full py-4">
            <div className="mb-6 px-2">
                <h2 className="text-2xl font-black text-text-main tracking-tight leading-none mb-2">
                    Popular Categories
                </h2>
                <p className="text-text-muted text-base font-medium m-0 opacity-70">
                    Explore the most sought-after property classifications.
                </p>
            </div>
            
            <AutoScrollCarousel 
                itemWidth="180px" 
                gap="16px" 
                desktopItemCount={4}
                tabletItemCount={3}
                mobileItemCount={2.2}
            >
                {displayCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/explore?q=${cat.name}`}
                        className="no-underline block h-full group"
                    >
                        <div
                            className="bg-white p-8 rounded-2xl text-center border border-border cursor-pointer transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 h-full flex flex-col items-center justify-center group"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-5 text-4xl transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/5 shadow-inner">
                                {cat.icon}
                            </div>
                            <h4 className="text-lg font-black text-text-main mb-1 tracking-tight group-hover:text-primary transition-colors">{cat.name}</h4>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                                <p className="text-xs text-primary font-black uppercase tracking-widest">{cat.count.toLocaleString()} listings</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </AutoScrollCarousel>
        </section>
    );
};
