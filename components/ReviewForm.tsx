'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/actions/reviews';

interface ReviewFormProps {
    receiverId: number;
    receiverName: string;
}

export default function ReviewForm({ receiverId, receiverName }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredRating, setHoveredRating] = useState(0);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitReview(receiverId, rating, comment);
            setRating(0);
            setComment('');
            router.refresh();
        } catch (err) {
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-primary)' }}>
                Write a Review for {receiverName}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    color: (hoveredRating || rating) >= star ? '#fbbf24' : '#cbd5e1',
                                    padding: '0'
                                }}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                        </span>
                    )}
                </div>

                <textarea
                    className="form-control"
                    placeholder="Share your experience working with this agent..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ resize: 'vertical' }}
                />

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.9rem', padding: '8px', background: '#fee2e2', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={isSubmitting}
                        style={{ opacity: isSubmitting ? 0.7 : 1 }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
