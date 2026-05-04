import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface PropertyPostProps {
  property: any;
  user?: any;
  onRefresh?: () => void;
  onVisible?: () => void;
  className?: string;
  isFirstInSet?: boolean;
  isLastInSet?: boolean;
}

export function PropertyPost({ property, onVisible, className, isFirstInSet = false, isLastInSet = false }: PropertyPostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { onVisible(); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onVisible]);

  const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${property.id}`;

  const images = property.images || [];
  const [activeImage, setActiveImage] = React.useState(
    images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : null
  );

  useEffect(() => {
    const first = images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : null;
    setActiveImage(first);
  }, [property.id, images.length]);

  const price = property.pricing?.price || property.price;

  const formatNepaliPrice = (amt: number) => {
    if (!amt) return 'Price on Request';
    const crore = Math.floor(amt / 10000000);
    const lakh = Math.floor((amt % 10000000) / 100000);
    const parts: string[] = [];
    if (crore > 0) parts.push(`${crore} Crore`);
    if (lakh > 0) parts.push(`${lakh} Lakhs`);
    return parts.length > 0 ? parts.join(' ') : `Rs. ${amt.toLocaleString()}`;
  };

  const formattedPrice = typeof price === 'number' ? formatNepaliPrice(price) : (price || 'Price on Request');
  const pricingUnit = property.pricing?.unit ? `per ${property.pricing.unit}` : 'per aana';

  const locationParts = [
    property.location?.area,
    property.location?.cityVillage || property.location?.city,
    property.location?.district,
  ].filter(Boolean);
  const locationStr = typeof property.location === 'string'
    ? property.location
    : locationParts.slice(0, 2).join(', ') || 'Kathmandu';

  const agentName = property.listedBy?.name || 'Agent';
  const propCount = property.listedBy?._count?.listedProperties || property.listedBy?.propertiesCount || '';
  const contactNumber = property.listedBy?.contact_number || '';
  const waMsg = encodeURIComponent(`I'm interested in ${property.title} [#${property.id}]`);
  const waLink = `https://wa.me/${contactNumber.replace(/[^0-9]/g, '')}?text=${waMsg}`;

  const timeAgo = (() => {
    const created = property.created_on ? new Date(property.created_on) : null;
    if (!created) return '';
    const diff = Date.now() - created.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1d';
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  })();

  return (
    <div ref={containerRef} className={`group/card bg-white transition-all duration-200 relative hover:z-10 hover:ring-2 hover:ring-inset hover:ring-[color:var(--color-primary)] overflow-hidden ${isFirstInSet ? 'rounded-t-[28px]' : ''} ${isLastInSet ? 'rounded-b-[28px]' : ''} ${(!isFirstInSet && !isLastInSet) ? 'rounded-none' : ''} ${className || ''}`}>
      <div className="flex w-full gap-3 sm:gap-4 p-3 sm:p-4 items-stretch">

        {/* Left: Images */}
        <div className="w-[110px] sm:w-[160px] flex-shrink-0 flex flex-col gap-1.5">
          <Link
            href={propertyUrl}
            className="relative block overflow-hidden flex-grow"
            style={{
              borderRadius: isFirstInSet
                ? '20px 12px 12px 12px'
                : isLastInSet
                ? '12px 12px 12px 12px'
                : '4px',
            }}
          >
            {activeImage ? (
              <img src={activeImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs">No image</div>
            )}
          </Link>

          {images.length > 1 && (
            <div className="flex gap-1">
              {images.slice(0, 4).map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : img.url;
                const isActive = activeImage === url;
                // Last card in set: first thumbnail gets a larger bottom-left corner
                const thumbRadius = isLastInSet && idx === 0 ? '4px 4px 4px 16px' : '4px';
                return (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); setActiveImage(url); }}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative flex-1 overflow-hidden transition-all ${isActive ? 'ring-1 ring-[color:var(--color-primary)]' : 'opacity-60 hover:opacity-100'}`}
                    style={{ aspectRatio: '1/1', borderRadius: thumbRadius }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[8px] font-bold">+{images.length - 4}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Link href={propertyUrl} className="flex-1 flex flex-col no-underline min-w-0">

            {/* Title */}
            <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover/card:text-[color:var(--color-primary)] transition-colors mb-1">
              {property.title}
            </h3>

            {/* Description */}
            <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed line-clamp-1 sm:line-clamp-2 mb-2">
              {property.remarks || 'This property offers a perfect blend of luxury and comfort, situated in a prime location with easy access to all essential amenities.'}
            </p>

            {/* Price row + time */}
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[15px] sm:text-[16px] font-bold text-slate-900">{formattedPrice} {pricingUnit}.</span>
                {contactNumber && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[12px] font-semibold text-[color:var(--color-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    Make Offer
                  </a>
                )}
              </div>
              {timeAgo && <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo}</span>}
            </div>

            {/* Location */}
            <div className="text-[12px] text-slate-500 mb-0">{locationStr}</div>
          </Link>

          {/* Divider */}
          <div className="border-t border-slate-100 my-0" />

          {/* Footer: agent + actions + share */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[12px] text-slate-600 font-medium truncate">
                <a
                  href={`/@${property.listedBy?.username || ''}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-[color:var(--color-primary)] transition-colors"
                >
                  {agentName}
                </a>
                {propCount ? ` • ${propCount} Prop...` : ''}
              </span>
              {contactNumber && (
                <>
                  <a
                    href={`tel:${contactNumber}`}
                    onClick={(e) => e.stopPropagation()}
                    title="Call"
                    className="text-slate-500 hover:text-[color:var(--color-primary)] transition-colors flex-shrink-0"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.21 12 19.79 19.79 0 0 1 1.14 3.38 2 2 0 0 1 3.11 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </a>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="WhatsApp"
                    className="text-slate-500 hover:text-green-500 transition-colors flex-shrink-0"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </a>
                </>
              )}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.origin + propertyUrl });
                }
              }}
              title="Share"
              className="text-slate-400 hover:text-[color:var(--color-primary)] transition-colors flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
