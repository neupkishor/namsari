'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createAgency, deleteAgency, toggleAgencyVerification } from '@/actions/agencies';
import imageCompression from 'browser-image-compression';

import { PaginationControl } from '@/components/ui';
import { resolveUploadedFileUrl, uploadFileWithIntent } from '@/lib/uploader';
import { logUploadError } from '@/lib/client-error-logger';

interface AgencyManagementClientProps {
    yourAgencies: any[];
    allAgencies: any[];
    showAllAgencies: boolean;
    canCreateAgency: boolean;
    totalPages: number;
}

export default function AgencyManagementClient({ yourAgencies, allAgencies, showAllAgencies, canCreateAgency, totalPages }: AgencyManagementClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [profilePic, setProfilePic] = useState('');

    const normalizeAgencies = (list: any[]) => {
        return list.map(agency => {
            let moreInfo: any = {};
            try {
                moreInfo = typeof agency.moreInfo === 'string' ? JSON.parse(agency.moreInfo) : (agency.moreInfo || {});
            } catch (e) {
                // ignore error
            }
            
            return {
                ...agency,
                phone: agency.contact_number || agency.phone,
                website: moreInfo.website || agency.website,
                is_verified: moreInfo.is_verified || agency.is_verified,
            };
        });
    };

    const normalizedYourAgencies = normalizeAgencies(yourAgencies);
    const normalizedAllAgencies = normalizeAgencies(allAgencies);

    const renderAgencyCard = (agency: any, canVerify: boolean) => (
        <Link 
            key={agency.id} 
            href={`/manage/accounts/${agency.username}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', cursor: 'pointer', transition: 'box-shadow 0.2s', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                        {agency.profile_picture ? (
                            <img src={agency.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={agency.name} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', background: '#eff6ff' }}>{agency.name[0]}</div>
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-light)', marginBottom: '4px' }}>{agency.name}</h3>
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
                            <span style={{ color: '#94a3b8' }}>🌐</span> <span style={{ color: '#3b82f6' }}>Website</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... previous implementation ...
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        try {
            setUploadStatus('Compressing image...');
            setUploadProgress(0);
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedBlob = await imageCompression(originalFile, options);
            const file = new File([compressedBlob], originalFile.name, { type: compressedBlob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('platform', 'namsari');

            setUploading(true);
            const data = await uploadFileWithIntent({
                type: 'agencies',
                file,
                formData,
                onStatusChange: status => setUploadStatus(status === 'preparing' ? 'Preparing secure upload...' : 'Uploading image...'),
                onProgress: setUploadProgress,
            });

            if (data.success) {
                setProfilePic(resolveUploadedFileUrl(data.path || data.file, data.url));
            } else {
                logUploadError(new Error(data.message || 'Upload failed'), {
                    fileName: originalFile.name,
                    uploadType: 'agencies',
                    response: data
                });
                alert('Upload failed: ' + (data.message || 'unknown'));
            }
        } catch (err) {
            console.error(err);
            logUploadError(err, {
                fileName: originalFile.name,
                uploadType: 'agencies'
            });
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            setUploadStatus('');
            setUploadProgress(0);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="section-title">Agency Management</h1>
                {canCreateAgency && (
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
                )}
            </div>

            {canCreateAgency && showForm && (
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
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Password</label>
                                <input name="password" type="password" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Set login password" />
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
                                        {uploading ? `${uploadStatus || 'Uploading image...'} ${uploadProgress ? `${uploadProgress}%` : ''}` : 'Upload Image'}
                                    </label>
                                    {profilePic && <img src={profilePic} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="Preview" />}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#64748b' }}>Bio / Description</label>
                            <textarea name="bio" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }} placeholder="Tell us about the agency..."></textarea>
                        </div>

                        <h4 style={{ marginBottom: '16px', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>Social Media Links</h4>
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

            {/* Your Agencies */}
            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-primary)' }}>Your Agencies</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {normalizedYourAgencies.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            You do not have any agencies yet. Create one above.
                        </div>
                    ) : (
                        normalizedYourAgencies.map((agency) => renderAgencyCard(agency, showAllAgencies))
                    )}
                </div>
            </section>

            {/* All Agencies */}
            {showAllAgencies && (
                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', marginTop: '32px', color: 'var(--color-primary)' }}>All Agencies</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {normalizedAllAgencies.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                No agencies found.
                            </div>
                        ) : (
                            normalizedAllAgencies.map((agency) => renderAgencyCard(agency, true))
                        )}
                    </div>
                </section>
            )}

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
