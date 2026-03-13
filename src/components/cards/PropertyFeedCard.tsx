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
  
  const formatNepaliPrice = (amt: number) => {
    if (!amt) return 'रु Price on Request';
    
    const crore = Math.floor(amt / 10000000);
    const restCrore = amt % 10000000;
    const lakh = Math.floor(restCrore / 100000);
    const restLakh = restCrore % 100000;
    const thousand = Math.floor(restLakh / 1000);
    
    let result = 'रु ';
    if (crore > 0) {
      result += `${crore} crore `;
    }
    if (lakh > 0) {
      result += `${lakh} lakh `;
    }
    if (thousand > 0 && crore === 0 && lakh === 0) {
      result += `${thousand} thousand`;
    }
    
    return result.trim() || `रु ${amt.toLocaleString()}`;
  };

  const formattedPrice = typeof price === 'number' ? formatNepaliPrice(price) : price;
  const location = property.location?.city || property.location?.district || property.location || 'Kathmandu';

  return (
    <div 
      ref={containerRef} 
      className={`bg-white border-b border-slate-100 last:border-0 py-4 group/card ${className || ''}`}
    >
      <div className="flex gap-4 w-full">
        {/* Left: Image Section */}
        <div className="flex flex-col w-[120px] sm:w-[160px] flex-shrink-0">
          <Link href={propertyUrl} className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
            {/* Type Badge Overlay */}
            <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
              {property.types?.[0]?.name || 'Property'}
            </div>
          </Link>

          {/* Thumbnails Row below the square image */}
          {images.length > 1 && (
            <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide pb-1">
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
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-md overflow-hidden border transition-all flex-shrink-0 ${
                      isActive ? 'border-blue-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[8px] font-bold">
                        +{images.length - 4}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Content Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <Link href={propertyUrl} className="flex flex-col no-underline">
            {/* Seller Name and Count at Top */}
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] sm:text-[12px] mb-1 font-medium">
              <span className="hover:text-blue-600 cursor-pointer transition-colors truncate">
                {property.listedBy?.name || 'Rental Ramro GharJagga Group'}
              </span>
              <span className="text-slate-300">•</span>
              <span>{property.listedBy?.propertiesCount || property.listedBy?._count?.properties || '4067'} Properties</span>
            </div>

            {/* Title and Menu */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] sm:text-lg font-bold text-slate-900 line-clamp-1 leading-tight tracking-tight group-hover/card:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>

            {/* Description - Compact but readable */}
            <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mt-1 mb-2">
              {property.description || 'Premium property listed in our exclusive marketplace. Contact for more details and viewing schedule.'}
            </p>

            {/* Price Row */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[16px] sm:text-xl font-bold text-slate-900">
                {formattedPrice}
              </div>
            </div>

            {/* Location and Time */}
            <div className="flex items-center justify-between text-slate-400 text-[12px] sm:text-[13px] mb-3">
              <span className="truncate max-w-[70%]">{location}</span>
              <span className="flex-shrink-0">2 mins ago</span>
            </div>
          </Link>

          {/* Divider removed as per request to remove repeated bottom info */}

          {/* Footer: Interaction Icons */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 hover:text-red-500 transition-colors flex items-center gap-1"
                title="Like"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                title="Comment"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button 
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 hover:text-green-600 transition-colors flex items-center gap-1"
                title="Contact"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                // Share logic
              }}
              className="text-slate-600 hover:text-blue-600 transition-colors"
              title="Share"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
