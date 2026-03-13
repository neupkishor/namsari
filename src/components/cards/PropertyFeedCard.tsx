import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface PropertyPostProps {
  property: any;
  user?: any;
  onRefresh?: () => void;
  onVisible?: () => void;
  className?: string;
}

export function PropertyPost({ property, onVisible, className }: PropertyPostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onVisible]);

  const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${property.id}`;

  const images = property.images || [];
  const [activeImage, setActiveImage] = React.useState(
    images.length > 0
      ? (typeof images[0] === 'string' ? images[0] : images[0].url)
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  );

  useEffect(() => {
    const firstImg = images.length > 0
      ? (typeof images[0] === 'string' ? images[0] : images[0].url)
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    setActiveImage(firstImg);
  }, [property.id, images.length]);

  const price = property.pricing?.price || property.price;
  const formattedPrice = typeof price === 'number' ? `रु ${price.toLocaleString()}` : price;
  const location = property.location?.city || property.location?.district || property.location || 'Kathmandu';

  return (
    <div 
      ref={containerRef} 
      className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group/card ${className || ''}`}
    >
      <div className="flex flex-col sm:flex-row w-full no-underline">
        {/* Image Section */}
        <div className="flex flex-col w-full sm:w-[200px] md:w-[240px] flex-shrink-0">
          <Link href={propertyUrl} className="relative aspect-[2/1] sm:aspect-[4/3] overflow-hidden">
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
            />
            {/* Badge for Type */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm border border-slate-200/50">
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                {property.types?.[0]?.name || 'Property'}
              </span>
            </div>
          </Link>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-1 p-1.5 bg-slate-50 border-t border-slate-100 overflow-x-auto scrollbar-hide">
              {images.slice(0, 4).map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : img.url;
                const isActive = activeImage === url;
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveImage(url);
                    }}
                    className={`relative w-8 h-8 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                      isActive ? 'border-blue-500 scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[9px] font-bold">
                        +{images.length - 4}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Section */}
        <Link href={propertyUrl} className="flex-1 p-3 sm:p-4 flex flex-col justify-start min-w-0 relative no-underline">
          {/* Seller Name First */}
          <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px] mb-1">
            <img 
              src={property.listedBy?.image || `https://ui-avatars.com/api/?name=${property.listedBy?.name || 'User'}&background=random`} 
              alt="Seller" 
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              {property.listedBy?.name || 'Deepu Joshi'}
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 leading-tight tracking-tight group-hover/card:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  // Bookmark logic would go here
                }}
                className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
            </div>

            {/* Description Snippet - 1 line max */}
            <p className="text-slate-500 text-[12px] line-clamp-1 leading-relaxed">
              {property.description || 'Premium property listed in our exclusive marketplace. Contact for more details and viewing schedule.'}
            </p>

            {/* Price Row */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="text-lg sm:text-xl font-extrabold text-blue-600 tracking-tight">
                {formattedPrice}
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                {property.status || 'For Sale'}
              </span>
            </div>
          </div>

          {/* Footer Info - Location and Time on one line */}
          <div className="mt-2 flex items-center gap-3 text-slate-400 text-[11px] font-medium">
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span className="truncate max-w-[100px]">{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>6 mins ago</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
