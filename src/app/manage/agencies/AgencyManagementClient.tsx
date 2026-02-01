'use client';

import React, { useState } from 'react';
import { createAgency, deleteAgency, toggleAgencyVerification } from './actions';
import imageCompression from 'browser-image-compression';

import { PaginationControl } from '@/components/ui';

interface AgencyManagementClientProps {
    agencies: any[];
    totalPages: number;
}

export default function AgencyManagementClient({ agencies, totalPages }: AgencyManagementClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profilePic, setProfilePic] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... previous implementation ...
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
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
                setProfilePic(data.url);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="section-title">Agency Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    {showForm ? 'Cancel' : 'Add New Agency'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '800' }}>Create Agency Profile</h3>
                    <form action={async (formData) => {
                        if (profilePic) formData.append('profile_picture', profilePic);
                        await createAgency(formData);
                        setShowForm(false);
                        setProfilePic('');
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Agency Name</label>
                                <input name="name" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. Dream Homes Realty" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Username</label>
                                <input name="username" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="dream-homes" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Email (Optional)</label>
                                <input name="email" type="email" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="contact@dreamhomes.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Phone (Optional)</label>
                                <input name="phone" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="+977 123456789" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Website</label>
                                <input name="website" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="https://dreamhomes.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Profile Picture</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} id="agency-pic" />
                                    <label htmlFor="agency-pic" style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </label>
                                    {profilePic && <img src={profilePic} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Preview" />}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Bio / Description</label>
                            <textarea name="bio" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }} placeholder="Tell us about the agency..."></textarea>
                        </div>

                        <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>Social Media Links</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <input name="facebook" placeholder="Facebook URL" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                            <input name="instagram" placeholder="Instagram URL" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                            <input name="twitter" placeholder="Twitter URL" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                            <input name="linkedin" placeholder="LinkedIn URL" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }} />
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                            Save Agency Profile
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {agencies.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No agencies found. Add your first agency above.
                    </div>
                ) : (
                    agencies.map((agency) => (
                        <div key={agency.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                <button
                                    onClick={() => deleteAgency(agency.id)}
                                    style={{ background: 'white', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                    title="Delete Agency"
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                                    {agency.profile_picture ? (
                                        <img src={agency.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={agency.name} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', background: '#eff6ff' }}>{agency.name[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{agency.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>@{agency.username}</p>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#94a3b8' }}>📞</span> <span>{agency.phone || 'No phone'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#94a3b8' }}>✉️</span> <span>{agency.email || 'No email'}</span>
                                </div>
                                {agency.website && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#94a3b8' }}>🌐</span> <a href={agency.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>Website</a>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => toggleAgencyVerification(agency.id, agency.is_verified)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: agency.is_verified ? '#dcfce7' : '#f1f5f9',
                                        color: agency.is_verified ? '#166534' : '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {agency.is_verified ? '✓ Verified Agency' : 'Mark as Verified'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
