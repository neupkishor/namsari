import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { InternalPropertyLink } from '@/components/navigation/InternalPropertyLink';

interface GridListingCardProps {
  properties: any[];
  title: string;
  className?: string;
}

export function GridListingCard({ properties, title, className }: GridListingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance logic
  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % properties.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  useEffect(() => {
    if (properties.length <= 1) return;
    timeoutRef.current = setInterval(nextSlide, 4000); // 4 seconds per slide
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [properties.length]);

  const handleManualNav = (action: () => void) => {
    if (timeoutRef.current) clearInterval(timeoutRef.current);
    action();
    if (properties.length > 1) {
      timeoutRef.current = setInterval(nextSlide, 4000);
    }
  };

  if (properties.length === 0) return null;

  const currentProperty = properties[activeIndex];
  const slug = currentProperty.slug || currentProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${currentProperty.id}`;
  const mainImage = currentProperty.images?.[0] ? (typeof currentProperty.images[0] === 'string' ? currentProperty.images[0] : currentProperty.images[0].url) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${className || ''}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-slate-50">
        <h4 className="m-0 text-base font-extrabold text-primary">{title}</h4>
        <Link href="/explore" className="text-xs font-bold text-gold hover:text-gold/80 transition-colors no-underline">Explore More</Link>
      </div>

      <div className="relative w-full pt-[75%]">
        <div className="absolute inset-0">
            <InternalPropertyLink href={propertyUrl} className="block w-full h-full relative group">
                <img 
                    src={mainImage} 
                    alt={currentProperty.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Overlay Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                    <div className="text-xl font-bold mb-1 text-gold">
                        {currentProperty.price}
                    </div>
                    <h3 className="text-base font-semibold mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {currentProperty.title}
                    </h3>
                    <div className="text-[0.85rem] opacity-90 flex items-center gap-1">
                        📍 {currentProperty.location}
                    </div>
                </div>
            </InternalPropertyLink>

            {/* Navigation Controls */}
            {properties.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNav(prevSlide);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 border border-white/30 text-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-sm z-10 hover:bg-black/70 transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNav(nextSlide);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 border border-white/30 text-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-sm z-10 hover:bg-black/70 transition-colors"
                    >
                        →
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute top-3 right-3 flex gap-1.5 z-10 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                        {properties.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleManualNav(() => setActiveIndex(idx));
                                }}
                                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-200 ${idx === activeIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
