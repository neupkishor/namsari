'use client';

import React, { useState } from 'react';
import { addPropertyImage, removePropertyImage, updatePropertyStatus, updateSoldStatus } from './actions';
import { useRouter } from 'next/navigation';

import imageCompression from 'browser-image-compression';

interface PropertyManageClientProps {
    property: any;
}

export default function PropertyManageClient({ property }: PropertyManageClientProps) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);

    const stats = [
        { label: 'Total Views', value: property.views || 0, icon: '👁️', color: '#10b981' },
        { label: 'Total Likes', value: property.property_likes?.length || 0, icon: '❤️', color: '#ef4444' },
        { label: 'Comments', value: property.comments?.length || 0, icon: '💬', color: '#3b82f6' },
        { label: 'Shares', value: property.shares || 0, icon: '↗️', color: '#f59e0b' },
    ];

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        setCompressing(true);
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const res = await fetch('https://cdn.neupgroup.com/bridge/api/v1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                await addPropertyImage(property.id, data.url, type);
                router.refresh();
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setCompressing(false);
            setUploading(false);
        }
    };

    const handleDeleteImage = async (id: number) => {
        if (!confirm('Are you sure you want to remove this image?')) return;
        try {
            await removePropertyImage(id);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Failed to delete image');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Image Management */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Media Gallery</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{property.images.length} Images total</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                            {property.images.map((img: any) => (
                                <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <img src={img.url} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt={img.imageOf} />
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handleDeleteImage(img.id)}
                                            style={{ background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                        {img.imageOf}
                                    </div>
                                </div>
                            ))}

                            <label style={{
                                cursor: 'pointer',
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '150px',
                                background: uploading ? '#f8fafc' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpload(e, 'other')} disabled={uploading} />
                                <span style={{ fontSize: '1.5rem' }}>{(uploading || compressing) ? '⌛' : '➕'}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '8px' }}>{compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Add Image'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Administrative Control</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Listing Status</label>
                                <select
                                    defaultValue={property.status}
                                    onChange={(e) => updatePropertyStatus(property.id, e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: '600' }}
                                >
                                    <option value="pending">Pending Review</option>
                                    <option value="approved">Approved / Live</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="warned">Warned</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Market Status</label>
                                <select
                                    defaultValue={property.soldStatus}
                                    onChange={(e) => updateSoldStatus(property.id, e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: '600' }}
                                >
                                    <option value="unsold">Available</option>
                                    <option value="soldByUs">Sold by Namsari</option>
                                    <option value="soldByOther">Sold by Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px' }}>Information Overview</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Location Details</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '4px' }}>
                                            {property.location?.area}, {property.location?.cityVillage}, {property.location?.district}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Ward: {property.location?.ward || 'N/A'} • Landmark: {property.location?.landmark || 'None'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Road & Entrance</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '4px' }}>{property.roadType || 'Unspecified'} Road</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Width: {property.roadSize || 'N/A'} • Facing: {property.facingDirection || 'N/A'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Specifications</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '4px' }}>
                                            {property.features?.bedrooms || 0} Beds • {property.features?.bathrooms || 0} Baths
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Area: {property.features?.builtUpArea} {property.features?.builtUpAreaUnit}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Amenities</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                            {property.features?.parkingAvailable && <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem' }}>Parking</span>}
                                            {property.features?.waterSupply && <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem' }}>Water</span>}
                                            {property.features?.electricity && <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem' }}>Electricity</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Owner Info</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                                {property.listedBy?.profile_picture ? (
                                    <img src={property.listedBy.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={property.listedBy.name} />
                                ) : (
                                    (property.listedBy?.name || 'A')[0]
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{property.listedBy?.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{property.listedBy?.username}</div>
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                            Contact: {property.listedBy?.contact_number || 'No number listed'}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Quick Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>Price:</span>
                                <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                                    NRs. {Number(property.pricing?.price || 0).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>Location:</span>
                                <span style={{ fontWeight: '600' }}>{property.location?.area}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b' }}>Created:</span>
                                <span style={{ fontWeight: '600' }}>{new Date(property.created_on).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
