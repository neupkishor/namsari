'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { Input, TextArea } from '@/components/ui';
import { FormLabel } from '@/components/form';

interface UserProfile {
    id: number;
    name: string;
    username: string;
    bio?: string | null;
    contact_number?: string | null;
    profile_picture?: string | null;
}

export default function ProfileEditClient({ user }: { user: UserProfile }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        contact_number: user.contact_number || '',
        bio: user.bio || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                window.location.href = '/profile';
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <SiteHeader user={user} />

            <div className="layout-container" style={{ paddingTop: '60px', maxWidth: '600px' }}>
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Edit Profile</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>Update your personal information.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <FormLabel>Full Name</FormLabel>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <FormLabel>Contact Number</FormLabel>
                            <Input
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                placeholder="e.g. 9800000000"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <FormLabel>Bio</FormLabel>
                            <TextArea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                                rows={4}
                            />
                        </div>

                        <div style={{ paddingTop: '16px', display: 'flex', gap: '16px' }}>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/profile'}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    background: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                                    background: 'var(--color-primary)', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                                    opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
