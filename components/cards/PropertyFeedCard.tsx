import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface PropertyPostProps {
  property: any;
  onVisible?: () => void;
  className?: string;
  isFirstInSet?: boolean;
  isLastInSet?: boolean;
}

// Phone icon (outline)
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// WhatsApp icon (brand green)
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

// Share icon
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;
  return `${Math.floor(diffMonths / 12)}y`;
}

function MakeOfferLink({ propertyUrl, title, price, phone }: {
  propertyUrl: string;
  title: string;
  price: string;
  phone: string | null | undefined;
}) {
  const [href, setHref] = React.useState<string>('#');

  useEffect(() => {
    const fullUrl = window.location.origin + propertyUrl;
    const msg = `${fullUrl}\nI'm interested in ${title}. I am offering this property ${price}.`;
    const cleaned = phone ? phone.replace(/\D/g, '') : '';
    setHref(
      cleaned
        ? `https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`
    );
  }, [propertyUrl, title, price, phone]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[12px] sm:text-[13px] font-semibold text-[color:var(--color-primary)] hover:underline"
    >
      <span className="sm:hidden">Offer</span>
      <span className="hidden sm:inline">Make Offer</span>
    </a>
  );
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

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [thumbStartIndex, setThumbStartIndex] = React.useState(0);

  const imageUrls = React.useMemo(
    () => images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean),
    [images]
  );
  const hasAnyImage = imageUrls.length > 0;
  const hasSingleImage = imageUrls.length === 1;
  const activeImage = imageUrls[activeImageIndex] || null;
  const thumbWindowSize = 3;

  useEffect(() => {
    setActiveImageIndex(0);
    setThumbStartIndex(0);
  }, [property.id, images.length]);

  const getThumbWindowStart = (selectedIndex: number, total: number) => {
    if (total <= thumbWindowSize) return 0;
    const preferredStart = selectedIndex - 1; // keep selection in middle when possible
    return Math.max(0, Math.min(preferredStart, total - thumbWindowSize));
  };

  const price = property.pricing?.price || property.price;

  const formatNepaliPrice = (amt: number) => {
    if (!amt) return 'Price on Request';
    const crore = 10000000;
    const lakh = 100000;
    const thousand = 1000;
    if (amt >= crore) {
      const cr = Math.floor(amt / crore);
      const l = Math.floor((amt % crore) / lakh);
      return l > 0 ? `${cr}Cr ${l}L` : `${cr}Cr`;
    }
    if (amt >= lakh) {
      const l = Math.floor(amt / lakh);
      const k = Math.floor((amt % lakh) / thousand);
      return k > 0 ? `${l}L ${k}K` : `${l}L`;
    }
    if (amt >= thousand) {
      return `${Math.floor(amt / thousand)}K`;
    }
    return `Rs. ${amt.toLocaleString()}`;
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

  const agentName = property.listedBy?.name || 'Agent';
  const agentUsername = property.listedBy?.username || null;
  const agentProfileUrl = agentUsername ? `/@${agentUsername}` : null;
  const agentPropertyCount = property.listedBy?._count?.listedProperties;
  const agentPhone = property.listedBy?.phone;
  const agentWhatsapp = property.listedBy?.whatsapp || property.listedBy?.phone;
  const timeAgo = formatTimeAgo(property.created_on || property.createdAt);

  // Image corner radius: top-left of first card gets large rounding
  const mainImageRadiusClass = isFirstInSet
    ? 'rounded-[16px_8px_8px_8px]'
    : isLastInSet
    ? 'rounded-[8px]'
    : 'rounded-[6px]';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.origin + propertyUrl });
    } else {
      navigator.clipboard?.writeText(window.location.origin + propertyUrl);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group/card bg-white relative hover:z-10 overflow-hidden flex justify-center
        transition-[box-shadow,border-color] duration-300
        hover:ring-2 hover:ring-inset hover:ring-[color:var(--color-primary)]
      border-b border-b-slate-200 hover:border-b-transparent
      ${isFirstInSet ? 'rounded-t-[28px]' : ''}
      ${isLastInSet ? 'rounded-b-[28px]' : ''}
      ${(!isFirstInSet && !isLastInSet) ? 'rounded-none' : ''}
      ${className || ''}`}
    >
      <div className="flex w-full max-w-[1040px] gap-2.5 sm:gap-4 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-4 items-stretch">

        {/* LEFT: IMAGE STACK */}
        {hasAnyImage && (
        <div className={`w-[108px] sm:w-[132px] flex-shrink-0 self-stretch h-full ${hasSingleImage ? 'flex flex-col pb-0' : 'grid grid-rows-[auto_1fr] gap-1.5 pb-1 sm:pb-2'}`}>

          {/* MAIN IMAGE */}
          <Link
            href={propertyUrl}
            className={`relative overflow-hidden block ${hasSingleImage ? 'h-full min-h-[140px]' : 'aspect-square'} ${mainImageRadiusClass}`}
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

          {/* THUMBNAILS */}
          {imageUrls.length > 1 && (
            <div className="flex gap-1 min-h-0">
              {imageUrls
                .slice(thumbStartIndex, thumbStartIndex + thumbWindowSize)
                .map((url: string, idx: number) => {
                const actualIndex = thumbStartIndex + idx;
                const isActive = activeImageIndex === actualIndex;
                const isFirstThumb = idx === 0;
                const thumbRadiusClass = isLastInSet && isFirstThumb
                  ? 'rounded-[4px_4px_4px_16px]'
                  : 'rounded-[4px]';
                return (
                  <button
                    key={`${url}-${actualIndex}`}
                    type="button"
                    aria-label={`View image ${actualIndex + 1}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveImageIndex(actualIndex);
                      setThumbStartIndex(getThumbWindowStart(actualIndex, imageUrls.length));
                    }}
                    className={`flex-1 h-full overflow-hidden ${thumbRadiusClass}
                      ${isActive
                        ? 'ring-1 ring-[color:var(--color-primary)]'
                        : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* RIGHT: CONTENT */}
        <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between pb-0">

          {/* TOP SECTION: title, description, price+offer, location */}
          <div className="flex flex-col gap-0.5 min-w-0 pt-0.5 pb-1 flex-none">
            {/* Title + description — clickable */}
            <Link href={propertyUrl} className="flex flex-col gap-0.5 min-w-0">
              <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover/card:text-[color:var(--color-primary)] transition-colors">
                {property.title}
              </h3>
              <p className="text-[11px] sm:text-[12px] text-slate-400 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                {property.remarks || 'This property offers a perfect blend of luxury and comfort, situated in a prime location with easy access to all essential amenities.'}
              </p>
            </Link>

            {/* Price + Make Offer — NOT inside Link */}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 whitespace-nowrap">
                {formattedPrice} {pricingUnit}.
              </span>
              <MakeOfferLink
                propertyUrl={propertyUrl}
                title={property.title}
                price={`${formattedPrice} ${pricingUnit}`}
                phone={agentWhatsapp || agentPhone}
              />
            </div>

            {/* Location — clickable */}
            <Link href={propertyUrl} className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">
              {locationStr}
            </Link>
          </div>

          {/* SEPARATOR */}
          <div className="border-t border-slate-100 h-px my-1" />

          {/* BOTTOM ROW: agent info + call/whatsapp | timestamp + share */}
          <div className="flex items-center justify-between py-0.5 sm:py-1 gap-2">
            <div className="flex items-center min-w-0 flex-1">
              {agentProfileUrl ? (
                <a
                  href={agentProfileUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[12px] text-slate-500 font-medium truncate max-w-[160px] hover:text-[color:var(--color-primary)] hover:underline transition-colors"
                >
                  {agentName}
                </a>
              ) : (
                <span className="text-[12px] text-slate-500 font-medium truncate max-w-[160px]">
                  {agentName}
                </span>
              )}

              {agentPropertyCount != null && (
                <>
                  <span className="hidden sm:inline text-slate-400 text-[12px] font-medium ml-2">•</span>
                  {agentUsername ? (
                    <a
                      href={`/@${agentUsername}/properties`}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden sm:inline text-[12px] text-slate-500 font-medium shrink-0 ml-2 hover:text-[color:var(--color-primary)] hover:underline transition-colors"
                    >
                      {agentPropertyCount} {agentPropertyCount === 1 ? 'property' : 'properties'}
                    </a>
                  ) : (
                    <span className="hidden sm:inline text-[12px] text-slate-500 font-medium shrink-0 ml-2">
                      {agentPropertyCount} {agentPropertyCount === 1 ? 'property' : 'properties'}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {agentWhatsapp ? (
                <a
                  href={`https://wa.me/${agentWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`${propertyUrl}\nI'm interested in this "${property.title}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp agent"
                  className="flex sm:hidden items-center justify-center p-2 rounded-lg text-[#25D366] hover:text-[#1aab52] hover:bg-[color:var(--color-primary)]/10 transition-colors"
                >
                  <WhatsAppIcon />
                </a>
              ) : (
                <span className="flex sm:hidden items-center justify-center p-2 rounded-lg text-[#25D366]">
                  <WhatsAppIcon />
                </span>
              )}

              {timeAgo && (
                <span className="text-[11px] text-slate-400 font-medium">{timeAgo}</span>
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share property"
                className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10 transition-colors"
              >
                <ShareIcon />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
