import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface PropertyPostProps {
  property: any;
  onVisible?: () => void;
  className?: string;
  isFirstInSet?: boolean;
  isLastInSet?: boolean;
}

export function PropertyPost({
  property,
  onVisible,
  className,
  isFirstInSet = false,
  isLastInSet = false,
}: PropertyPostProps) {
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

  const slug =
    property.slug ||
    property.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const propertyUrl = `/properties/${slug}-${property.id}`;

  const images = property.images || [];

  const [activeImage, setActiveImage] = React.useState(
    images.length > 0
      ? typeof images[0] === 'string'
        ? images[0]
        : images[0].url
      : null
  );

  useEffect(() => {
    const first =
      images.length > 0
        ? typeof images[0] === 'string'
          ? images[0]
          : images[0].url
        : null;
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
    return parts.length > 0
      ? parts.join(' ')
      : `Rs. ${amt.toLocaleString()}`;
  };

  const formattedPrice =
    typeof price === 'number'
      ? formatNepaliPrice(price)
      : price || 'Price on Request';

  const pricingUnit = property.pricing?.unit
    ? `per ${property.pricing.unit}`
    : 'per aana';

  const locationParts = [
    property.location?.area,
    property.location?.cityVillage || property.location?.city,
  ].filter(Boolean);

  const locationStr =
    typeof property.location === 'string'
      ? property.location
      : locationParts.join(', ') || 'Kathmandu';

  const mainImageRadiusClass = isFirstInSet
    ? 'rounded-[20px_12px_12px_12px]'
    : isLastInSet
    ? 'rounded-[12px]'
    : 'rounded-[4px]';

  return (
    <div
      ref={containerRef}
      className={`group/card bg-white transition-all duration-200 relative hover:z-10 hover:ring-2 hover:ring-inset hover:ring-[color:var(--color-primary)] overflow-hidden
      ${isFirstInSet ? 'rounded-t-[28px]' : ''}
      ${isLastInSet ? 'rounded-b-[28px]' : ''}
      ${(!isFirstInSet && !isLastInSet) ? 'rounded-none' : ''}
      ${className || ''}`}
    >
      {/* 🔥 FIXED CARD HEIGHT (adjust as needed) */}
      <div className="flex w-full gap-3 sm:gap-4 p-3 sm:p-4 items-stretch h-[150px] sm:h-[170px]">

        {/* LEFT: IMAGE STACK */}
        <div className="w-[110px] sm:w-[160px] h-full flex flex-col gap-1.5">

          {/* MAIN IMAGE (dynamic height) */}
          <Link
            href={propertyUrl}
            className={`relative overflow-hidden flex-1 min-h-0 ${mainImageRadiusClass}`}
          >
            {activeImage ? (
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                No image
              </div>
            )}
          </Link>

          {/* THUMBNAILS (fixed height) */}
          {images.length > 1 && (
            <div className="flex gap-1 h-8 flex-shrink-0">
              {images.slice(0, 4).map((img: any, idx: number) => {
                const url =
                  typeof img === 'string' ? img : img.url;
                const isActive = activeImage === url;

                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveImage(url);
                    }}
                    className={`flex-1 h-full overflow-hidden rounded-[4px]
                      ${
                        isActive
                          ? 'ring-1 ring-[color:var(--color-primary)]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <Link
            href={propertyUrl}
            className="flex flex-col gap-1 min-w-0"
          >
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-slate-900 line-clamp-1 group-hover/card:text-[color:var(--color-primary)]">
              {property.title}
            </h3>

            <p className="text-[12px] text-slate-500 line-clamp-1">
              {property.remarks || 'Prime location property.'}
            </p>

            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-bold text-slate-900">
                {formattedPrice} {pricingUnit}
              </span>
            </div>

            <div className="text-[12px] text-slate-500">
              {locationStr}
            </div>
          </Link>

          <div className="border-t border-slate-100 my-1" />

          <div className="text-[12px] text-slate-600 truncate">
            {property.listedBy?.name || 'Agent'}
          </div>
        </div>
      </div>
    </div>
  );
}