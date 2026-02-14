import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toggleLike, addComment } from '@/actions/social';
import { Input } from '@/components/ui';

interface PropertyPostProps {
  property: any;
  user: any;
  onRefresh: () => void;
  onVisible?: () => void;
  isCommentsOpen?: boolean;
  onToggleComments?: () => void;
  className?: string;
}

import { formatPrice } from '@/lib/formatters';

export function PropertyPost({ property, user, onRefresh, onVisible, isCommentsOpen, onToggleComments, className }: PropertyPostProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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

  const [commentDraft, setCommentDraft] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [localLikeState, setLocalLikeState] = useState<{ isLiked: boolean, count: number } | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Derived social states
  const isLiked = localLikeState ? localLikeState.isLiked : (user && property.property_likes?.some((l: any) => l.user_id === user.id));
  const likeCount = localLikeState ? localLikeState.count : (property.property_likes?.length || 0);
  const comments = property.comments || [];

  // Reset local state when property prop changes (after onRefresh)
  useEffect(() => {
    setLocalLikeState(null);
  }, [property.property_likes]);

  const slug = property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const propertyUrl = `/properties/${slug}-${property.id}`;

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    // Optimistic Update
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLocalLikeState({ isLiked: nextIsLiked, count: nextCount });

    setIsLiking(true);
    try {
      await toggleLike(property.id);
      onRefresh(); // Sync with server
    } catch (err) {
      setLocalLikeState(null);
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${propertyUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed or failed', err);
      }
      return;
    }

    const copyToClipboardFallback = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
      } catch (err) {
        console.error('Failed to copy keys:', err);
        copyToClipboardFallback();
      }
    } else {
      copyToClipboardFallback();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    if (!commentDraft.trim()) return;

    try {
      await addComment(property.id, commentDraft);
      setCommentDraft('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const displayPrice = React.useMemo(() => {
    const rawPrice = property.pricing?.price || property.price; 
    return formatPrice(rawPrice, isMobile);
  }, [property.price, property.pricing, isMobile]);

  const images = property.images || [];
  const mainImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0].url)
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <div ref={containerRef} className={`card ${className || ''}`} style={{ padding: '16px', overflow: 'hidden' }}>
      <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          alignItems: 'stretch'
      }}>
        <div style={{
            width: '140px',
            height: '140px',
            flexShrink: 0,
            position: 'relative'
        }}>
          <Link href={propertyUrl} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={mainImage}
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Link>
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              +{images.length - 1}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <Link href={propertyUrl} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary-light)', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {property.title}
                </h3>
              </Link>
              <button style={{ background: 'none', border: 'none', padding: '0 0 0 8px', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>

            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-gold)', marginBottom: '4px' }}>
              {displayPrice}
            </div>

            {property.specs && (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {property.specs}
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span>📍 {property.location} • {property.timestamp}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <Link href={`/@${property.author_username || property.author}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {property.author_avatar ? (
                  <img src={property.author_avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(property.author_name || property.author || 'A')[0]}
                  </div>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>{property.author_name || property.author}</span>
              </div>
            </Link>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '12px'
            }}>
              <button onClick={handleLike} title="Like" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isLiked ? '#ef4444' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                {likeCount > 0 && <span style={{ fontWeight: '600' }}>{likeCount}</span>}
              </button>

              <button onClick={() => onToggleComments && onToggleComments()} title="Comment" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>

              <button onClick={handleShare} title="Share" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              </button>

              <div style={{ flex: 1 }}></div>

              <button
                onClick={() => {
                  const phone = property.author_phone || property.contact_phone;
                  if (phone) window.location.href = `tel:${phone}`;
                  else alert("No contact number available.");
                }}
                title="Call Agent"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-primary)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCommentsOpen && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          {comments.map((c: any) => (
            <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.6rem', flexShrink: 0 }}>
                {(c.user?.name || 'U')[0]}
              </div>
              <div>
                <span style={{ fontWeight: '700', marginRight: '6px' }}>{c.user?.name || 'User'}</span>
                <span>{c.content}</span>
              </div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment..."
                />
              </div>
              <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginTop: '1px' }}>
                Post
              </button>
            </form>
          )}
        </div>
      )}

      {showCopiedToast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
          color: 'white', padding: '14px 24px', borderRadius: '16px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.3)',
          fontWeight: '500', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span>✨</span>
          <span>Link copied to clipboard</span>
        </div>
      )}
    </div>
  );
}
