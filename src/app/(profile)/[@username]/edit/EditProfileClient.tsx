'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { updateProfile } from '@/actions/profile-client';
import ProfileImageUpload from '@/app/(profile)/[@username]/ProfileImageUploadClient';
import { useRouter } from 'next/navigation';

export default function EditProfileClient({ user }: { user: User }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');
        setSuccess('');

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password && password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const res = await updateProfile(user.id, formData);

        if (res.success) {
            setSuccess('Profile updated successfully');
            router.refresh();
        } else {
            setError(res.message || 'Update failed');
        }
        setLoading(false);
    }

    return (
        <div className="card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '32px', color: 'var(--color-primary)' }}>Edit Profile</h1>

            <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ProfileImageUpload
                    userId={user.id}
                    currentImage={user.profile_picture}
                    userName={user.name}
                    isOwner={true}
                />
                <p style={{ marginTop: '16px', color: '#64748b', fontSize: '0.9rem' }}>Click the camera icon to update your photo</p>
            </div>

            <form action={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#1e293b' }}>Display Name</label>
                    <input
                        name="name"
                        defaultValue={user.name}
                        required
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                    />
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#1e293b' }}>Bio / Description</label>
                    <textarea
                        name="bio"
                        defaultValue={user.bio || ''}
                        rows={4}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <label style={{ fontWeight: '600', color: '#1e293b' }}>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={user.email || ''}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <label style={{ fontWeight: '600', color: '#1e293b' }}>Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={user.contact_number || ''}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>Change Password</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>Leave blank if you do not want to change your password.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            <label style={{ fontWeight: '600', color: '#1e293b' }}>New Password</label>
                            <input
                                name="password"
                                type="password"
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            <label style={{ fontWeight: '600', color: '#1e293b' }}>Confirm New Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px' }}>{error}</div>}
                {success && <div style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px' }}>{success}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '12px 32px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
