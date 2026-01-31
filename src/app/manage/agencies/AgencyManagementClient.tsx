'use client';

import React, { useState } from 'react';
import { createAgency, deleteAgency, toggleAgencyVerification } from './actions';
import imageCompression from 'browser-image-compression';

interface AgencyManagementClientProps {
    agencies: any[];
}

export default function AgencyManagementClient({ agencies }: AgencyManagementClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profilePic, setProfilePic] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Agency</th>
                            <th style={{ padding: '16px 24px', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Contact</th>
                            <th style={{ padding: '16px 24px', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontWeight: '700', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agencies.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No agencies found. Add your first agency above.</td>
                            </tr>
                        ) : (
                            agencies.map((agency) => (
                                <tr key={agency.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {agency.profile_picture ? (
                                                    <img src={agency.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={agency.name} />
                                                ) : (
                                                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{agency.name[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{agency.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>@{agency.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{agency.phone || 'No phone'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{agency.email || 'No email'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            onClick={() => toggleAgencyVerification(agency.id, agency.is_verified)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: agency.is_verified ? '#dcfce7' : '#fee2e2',
                                                color: agency.is_verified ? '#166534' : '#991b1b'
                                            }}
                                        >
                                            {agency.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => deleteAgency(agency.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
