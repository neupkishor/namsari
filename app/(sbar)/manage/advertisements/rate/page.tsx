'use client';

import { useState, useEffect } from 'react';
import { getAdRates, createAdRate } from '@/actions/ads';

export default function AdRatesPage() {
    const [loading, setLoading] = useState(true);
    
    // Feed Rate State
    const [feedRate, setFeedRate] = useState('');
    const [bannerRate, setBannerRate] = useState('');

    useEffect(() => {
        loadRates();
    }, []);

    async function loadRates() {
        setLoading(true);
        try {
            const data = await getAdRates();
            const feed = data.find((r: any) => r.position === 'feed');
            const banner = data.find((r: any) => r.position === 'banner_top');
            
            if (feed) setFeedRate(feed.price.toString());
            if (banner) setBannerRate(banner.price.toString());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(position: string, price: string) {
        if (!price) return;
        try {
            await createAdRate({
                name: position === 'feed' ? 'Standard Feed Rate' : 'Top Banner Rate',
                description: `Cost per 1000 views for ${position === 'feed' ? 'Feed' : 'Top Banner'} ads`,
                price: parseFloat(price),
                duration: 0, // N/A for CPM
                position: position
            });
            alert('Rate updated successfully');
        } catch (error) {
            alert('Failed to update rate');
        }
    }

    return (
        <div className="layout-container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
            <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Advertisement Rates</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                Set the Cost Per 1000 Views (CPM) for different ad placements.
            </p>

            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', color: 'var(--color-primary)' }}>
                    Views Based Rates (CPM)
                </h3>

                <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Feed Rate */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Feed Ad Rate (Per 1000 Views)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>NPR</span>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ paddingLeft: '48px' }}
                                    value={feedRate}
                                    onChange={e => setFeedRate(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSave('feed', feedRate)}
                            className="btn-primary"
                            style={{ marginBottom: '2px' }}
                        >
                            Update
                        </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                    {/* Banner Rate */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Top Banner Ad Rate (Per 1000 Views)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}>NPR</span>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ paddingLeft: '48px' }}
                                    value={bannerRate}
                                    onChange={e => setBannerRate(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleSave('banner_top', bannerRate)}
                            className="btn-primary"
                            style={{ marginBottom: '2px' }}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
