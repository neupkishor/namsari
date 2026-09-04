'use client';
import { useEffect, useRef, useState } from 'react';

export default function PropertyGalleryLightbox({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    if (index === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setIndex(null); }
      if (event.key === 'ArrowLeft') setIndex(current => current === null ? current : (current - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setIndex(current => current === null ? current : (current + 1) % images.length);
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [index, images.length]);
  return <div className="gallery-grid" style={{ gridTemplateColumns: images.length <= 1 ? '1fr' : images.length === 2 ? '1fr 1fr' : '2fr 1fr' }}>
    {images.length > 0 ? <button type="button" className="gallery-main" onClick={() => setIndex(0)} style={{ border: 0, padding: 0, cursor: 'zoom-in' }}><img src={images[0]} className="gallery-item" alt="Main View" /></button> : <div className="gallery-main" style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>}
    {images.length > 1 && <div className="gallery-side" style={{ gridTemplateRows: images.length === 2 ? '1fr' : 'repeat(2, minmax(0, 1fr))' }}>
      <button type="button" onClick={() => setIndex(1)} style={{ border: 0, padding: 0, cursor: 'zoom-in', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0 }}><img src={images[1]} className="gallery-item" alt="View 2" /></button>
      {images.length > 2 && <button type="button" onClick={() => setIndex(2)} style={{ border: 0, padding: 0, cursor: 'zoom-in', position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0 }}><img src={images[2]} className="gallery-item" alt="View 3" />{images.length > 3 && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'white', background: 'rgba(0,0,0,.4)', fontWeight: 700, fontSize: '1.25rem' }}>+{images.length - 3} more</span>}</button>}
    </div>}
    {index !== null && <div className="property-lightbox" role="dialog" aria-modal="true" onClick={() => setIndex(null)} onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touchStartX.current === null) return; const distance = e.changedTouches[0].clientX - touchStartX.current; touchStartX.current = null; if (Math.abs(distance) > 50) { e.stopPropagation(); setIndex((index + (distance < 0 ? 1 : -1) + images.length) % images.length); } }}><button type="button" className="property-lightbox-close" onClick={() => setIndex(null)}>×</button><img key={images[index]} className="property-lightbox-image" src={images[index]} alt="Property enlarged" onClick={e => e.stopPropagation()} /><div className="property-lightbox-thumbnails" onClick={e => e.stopPropagation()}>{images.map((src, i) => <button type="button" key={`${src}-${i}`} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}><img src={src} alt={`Thumbnail ${i + 1}`} /></button>)}</div><button type="button" className="property-lightbox-nav property-lightbox-prev" onClick={e => { e.stopPropagation(); setIndex((index - 1 + images.length) % images.length); }}>‹</button><button type="button" className="property-lightbox-nav property-lightbox-next" onClick={e => { e.stopPropagation(); setIndex((index + 1) % images.length); }}>›</button></div>}
  </div>;
}
