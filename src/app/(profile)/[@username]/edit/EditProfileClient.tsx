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
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-edit-shell {
                    max-width: 880px;
                    margin: 0 auto;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    overflow: hidden;
                }

                .profile-edit-hero {
                    padding: 32px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    flex-wrap: wrap;
                }

                .profile-edit-avatar-row {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    flex-wrap: wrap;
                }

                .profile-edit-form {
                    display: grid;
                    gap: 28px;
                    padding: 32px;
                }

                .profile-edit-section {
                    display: grid;
                    gap: 18px;
                }

                .profile-edit-section-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }

                .profile-edit-section-copy {
                    font-size: 0.92rem;
                    color: #64748b;
                    margin: 0;
                }

                .profile-edit-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .profile-edit-field {
                    display: grid;
                    gap: 8px;
                }

                .profile-edit-label {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 0.95rem;
                }

                .profile-edit-input {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    color: #0f172a;
                    font: inherit;
                }

                .profile-edit-input:focus {
                    outline: none;
                    border-color: #cbd5e1;
                    box-shadow: 0 0 0 3px rgba(130, 0, 0, 0.08);
                }

                .profile-edit-note {
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .profile-edit-alert {
                    padding: 14px 16px;
                    border-radius: 14px;
                    font-weight: 600;
                }

                .profile-edit-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding-top: 8px;
                }

                .profile-edit-button {
                    padding: 12px 24px;
                    border-radius: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    font: inherit;
                }

                @media (max-width: 768px) {
                    .profile-edit-hero,
                    .profile-edit-form {
                        padding: 24px;
                    }

                    .profile-edit-grid {
                        grid-template-columns: 1fr;
                    }

                    .profile-edit-actions {
                        flex-direction: column-reverse;
                    }

                    .profile-edit-button {
                        width: 100%;
                    }
                }
            `}} />

            <div className="profile-edit-shell">
                <div className="profile-edit-hero">
                    <div className="profile-edit-avatar-row">
                        <div style={{ width: '128px', height: '128px', padding: '6px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0' }}>
                            <ProfileImageUpload
                                userId={user.id}
                                currentImage={user.profile_picture}
                                userName={user.name || ''}
                                isOwner={true}
                            />
                        </div>

                        <div style={{ display: 'grid', gap: '8px' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Edit Profile</h1>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                                Update your public profile details and account contact information.
                            </p>
                            <p className="profile-edit-note" style={{ margin: 0 }}>
                                Click the camera icon on your photo to upload a new profile image.
                            </p>
                        </div>
                    </div>
                </div>

                <form action={handleSubmit} className="profile-edit-form">
                    <section className="profile-edit-section">
                        <div style={{ display: 'grid', gap: '6px' }}>
                            <h2 className="profile-edit-section-title">Basic Information</h2>
                            <p className="profile-edit-section-copy">These details appear on your public profile.</p>
                        </div>

                        <div className="profile-edit-field">
                            <label className="profile-edit-label">Display Name</label>
                            <input
                                className="profile-edit-input"
                                name="name"
                                defaultValue={user.name || ''}
                                required
                            />
                        </div>

                        <div className="profile-edit-field">
                            <label className="profile-edit-label">Bio / Description</label>
                            <textarea
                                className="profile-edit-input"
                                name="bio"
                                defaultValue={user.bio || ''}
                                rows={5}
                                style={{ resize: 'vertical', minHeight: '132px' }}
                            />
                        </div>

                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Email Address</label>
                                <input
                                    className="profile-edit-input"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email || ''}
                                    required
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Phone Number</label>
                                <input
                                    className="profile-edit-input"
                                    name="phone"
                                    type="tel"
                                    defaultValue={user.contact_number || ''}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="profile-edit-section" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '28px' }}>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            <h2 className="profile-edit-section-title">Security</h2>
                            <p className="profile-edit-section-copy">Leave these blank if you do not want to change your password.</p>
                        </div>

                        <div className="profile-edit-grid">
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">New Password</label>
                                <input
                                    className="profile-edit-input"
                                    name="password"
                                    type="password"
                                />
                            </div>
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Confirm New Password</label>
                                <input
                                    className="profile-edit-input"
                                    name="confirmPassword"
                                    type="password"
                                />
                            </div>
                        </div>
                    </section>

                    {error && <div className="profile-edit-alert" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
                    {success && <div className="profile-edit-alert" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{success}</div>}

                    <div className="profile-edit-actions">
                        <button
                            type="button"
                            className="profile-edit-button"
                            onClick={() => router.back()}
                            style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#475569' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="profile-edit-button"
                            disabled={loading}
                            style={{ background: 'var(--color-primary)', color: 'white', border: 'none', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
