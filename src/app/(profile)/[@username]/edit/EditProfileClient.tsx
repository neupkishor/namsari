'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import {
    beginSensitiveProfileUpdate,
    completeSensitiveProfileUpdate,
    updateProfile
} from '@/actions/profile-client';
import { useRouter } from 'next/navigation';

type SensitiveKind = 'email' | 'phone' | 'password';
type SensitiveStep = 'verify' | 'edit';

const sensitiveLabels: Record<SensitiveKind, string> = {
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password',
};

export default function EditProfileClient({ user }: { user: User }) {
    const [loadingBasic, setLoadingBasic] = useState(false);
    const [basicError, setBasicError] = useState('');
    const [basicSuccess, setBasicSuccess] = useState('');

    const [activeKind, setActiveKind] = useState<SensitiveKind | null>(null);
    const [sensitiveStep, setSensitiveStep] = useState<SensitiveStep>('verify');
    const [sensitiveToken, setSensitiveToken] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState(user.email || '');
    const [newPhone, setNewPhone] = useState(user.contact_number || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sensitiveLoading, setSensitiveLoading] = useState(false);
    const [sensitiveError, setSensitiveError] = useState('');
    const [sensitiveSuccess, setSensitiveSuccess] = useState('');

    const router = useRouter();

    function resetSensitiveState() {
        setActiveKind(null);
        setSensitiveStep('verify');
        setSensitiveToken('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSensitiveError('');
    }

    function openSensitiveSection(kind: SensitiveKind) {
        setActiveKind(kind);
        setSensitiveStep('verify');
        setSensitiveToken('');
        setCurrentPassword('');
        setNewEmail(user.email || '');
        setNewPhone(user.contact_number || '');
        setNewPassword('');
        setConfirmPassword('');
        setSensitiveError('');
        setSensitiveSuccess('');
    }

    async function handleBasicSubmit(formData: FormData) {
        setLoadingBasic(true);
        setBasicError('');
        setBasicSuccess('');

        const res = await updateProfile(user.id, formData);

        if (res.success) {
            setBasicSuccess('Profile updated successfully');
            router.refresh();
        } else {
            setBasicError(res.message || 'Update failed');
        }

        setLoadingBasic(false);
    }

    async function handleSensitiveVerify() {
        if (!activeKind) return;

        setSensitiveLoading(true);
        setSensitiveError('');
        setSensitiveSuccess('');

        const res = await beginSensitiveProfileUpdate(user.id, activeKind, currentPassword);

        if (res.success) {
            setSensitiveToken(res.token || '');
            setSensitiveStep('edit');
            setCurrentPassword('');
        } else {
            setSensitiveError(res.message || 'Verification failed');
        }

        setSensitiveLoading(false);
    }

    async function handleSensitiveSave() {
        if (!activeKind || !sensitiveToken) return;

        setSensitiveLoading(true);
        setSensitiveError('');
        setSensitiveSuccess('');

        const res = await completeSensitiveProfileUpdate(user.id, activeKind, sensitiveToken, {
            email: newEmail,
            phone: newPhone,
            password: newPassword,
            confirmPassword,
        });

        if (res.success) {
            setSensitiveSuccess(`${sensitiveLabels[activeKind]} updated successfully`);
            resetSensitiveState();
            router.refresh();
        } else {
            setSensitiveError(res.message || 'Update failed');
        }

        setSensitiveLoading(false);
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-edit-shell {
                    max-width: 880px;
                    margin: 0 auto;
                    display: grid;
                    gap: 24px;
                }

                .profile-edit-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 32px;
                }

                .profile-edit-hero {
                    padding: 32px;
                    display: grid;
                    gap: 8px;
                }

                .profile-edit-form {
                    display: grid;
                    gap: 24px;
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

                .profile-sensitive-list {
                    display: grid;
                    gap: 0;
                }

                .profile-sensitive-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 18px 0;
                    border-bottom: 1px solid #e2e8f0;
                }

                .profile-sensitive-meta {
                    display: grid;
                    gap: 4px;
                }

                .profile-sensitive-kicker {
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: #94a3b8;
                }

                .profile-sensitive-value {
                    color: #334155;
                    font-weight: 600;
                    word-break: break-word;
                }

                .profile-sensitive-trigger {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    border: none;
                    background: transparent;
                    color: var(--color-primary-light);
                    font-weight: 700;
                    text-decoration: none;
                    cursor: pointer;
                    font: inherit;
                }

                .profile-sensitive-panel {
                    display: grid;
                    gap: 18px;
                }

                .profile-sensitive-panel-header {
                    display: grid;
                    gap: 6px;
                    padding-bottom: 2px;
                }

                @media (max-width: 768px) {
                    .profile-edit-card,
                    .profile-edit-hero {
                        padding: 24px;
                    }

                    .profile-edit-grid {
                        grid-template-columns: 1fr;
                    }

                    .profile-edit-actions,
                    .profile-sensitive-row {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .profile-edit-button {
                        width: 100%;
                    }
                }
            `}} />

            <div className="profile-edit-shell">
                <div className="profile-edit-card profile-edit-hero">
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Edit Profile</h1>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                        Update your public profile details here. Sensitive changes require your current password before the edit fields appear.
                    </p>
                </div>

                <form action={handleBasicSubmit} className="profile-edit-card profile-edit-form">
                    <div className="profile-edit-section">
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

                        {basicError && <div className="profile-edit-alert" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{basicError}</div>}
                        {basicSuccess && <div className="profile-edit-alert" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{basicSuccess}</div>}

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
                                disabled={loadingBasic}
                                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', opacity: loadingBasic ? 0.7 : 1, cursor: loadingBasic ? 'not-allowed' : 'pointer' }}
                            >
                                {loadingBasic ? 'Saving...' : 'Save Basic Info'}
                            </button>
                        </div>
                    </div>
                </form>

                <section className="profile-edit-card profile-edit-section">
                    <div style={{ display: 'grid', gap: '6px' }}>
                        <h2 className="profile-edit-section-title">Sensitive Changes</h2>
                        <p className="profile-edit-section-copy">Email, phone number, and password updates require current-password verification first.</p>
                    </div>

                    <div className="profile-sensitive-list">
                        <div className="profile-sensitive-row">
                            <div className="profile-sensitive-meta">
                                <div className="profile-sensitive-kicker">Email Address</div>
                                <div className="profile-sensitive-value">{user.email || 'No email added'}</div>
                            </div>
                            <button
                                type="button"
                                className="profile-sensitive-trigger"
                                onClick={() => openSensitiveSection('email')}
                            >
                                Change Email
                            </button>
                        </div>

                        <div className="profile-sensitive-row">
                            <div className="profile-sensitive-meta">
                                <div className="profile-sensitive-kicker">Phone Number</div>
                                <div className="profile-sensitive-value">{user.contact_number || 'No phone number added'}</div>
                            </div>
                            <button
                                type="button"
                                className="profile-sensitive-trigger"
                                onClick={() => openSensitiveSection('phone')}
                            >
                                Change Phone
                            </button>
                        </div>

                        <div className="profile-sensitive-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <div className="profile-sensitive-meta">
                                <div className="profile-sensitive-kicker">Password</div>
                                <div className="profile-sensitive-value">Use your current password to unlock a password change.</div>
                            </div>
                            <button
                                type="button"
                                className="profile-sensitive-trigger"
                                onClick={() => openSensitiveSection('password')}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>

                    {!activeKind && sensitiveSuccess && (
                        <div className="profile-edit-alert" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                            {sensitiveSuccess}
                        </div>
                    )}
                </section>

                {activeKind && (
                    <section className="profile-edit-card profile-sensitive-panel">
                        <div className="profile-sensitive-panel-header">
                            <div className="profile-sensitive-kicker">Sensitive Change</div>
                            <h3 className="profile-edit-section-title" style={{ fontSize: '1rem' }}>
                                Change {sensitiveLabels[activeKind]}
                            </h3>
                            <p className="profile-edit-section-copy">
                                {sensitiveStep === 'verify'
                                    ? 'Enter your current password first. Once it is verified, the current-password field disappears and the update fields appear.'
                                    : 'Your current password has been verified. Complete the change below and save it.'}
                            </p>
                        </div>

                        {sensitiveStep === 'verify' ? (
                            <div className="profile-edit-field">
                                <label className="profile-edit-label">Current Password</label>
                                <input
                                    className="profile-edit-input"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                        ) : (
                            <>
                                {activeKind === 'email' && (
                                    <div className="profile-edit-field">
                                        <label className="profile-edit-label">New Email Address</label>
                                        <input
                                            className="profile-edit-input"
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                        />
                                    </div>
                                )}

                                {activeKind === 'phone' && (
                                    <div className="profile-edit-field">
                                        <label className="profile-edit-label">New Phone Number</label>
                                        <input
                                            className="profile-edit-input"
                                            type="tel"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                        />
                                    </div>
                                )}

                                {activeKind === 'password' && (
                                    <div className="profile-edit-grid">
                                        <div className="profile-edit-field">
                                            <label className="profile-edit-label">New Password</label>
                                            <input
                                                className="profile-edit-input"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="profile-edit-field">
                                            <label className="profile-edit-label">Confirm New Password</label>
                                            <input
                                                className="profile-edit-input"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {sensitiveError && <div className="profile-edit-alert" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{sensitiveError}</div>}

                        <div className="profile-edit-actions" style={{ paddingTop: 0 }}>
                            <button
                                type="button"
                                className="profile-edit-button"
                                onClick={resetSensitiveState}
                                style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#475569' }}
                            >
                                Cancel
                            </button>

                            {sensitiveStep === 'verify' ? (
                                <button
                                    type="button"
                                    className="profile-edit-button"
                                    onClick={handleSensitiveVerify}
                                    disabled={sensitiveLoading}
                                    style={{ background: 'var(--color-primary)', color: 'white', border: 'none', opacity: sensitiveLoading ? 0.7 : 1, cursor: sensitiveLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    {sensitiveLoading ? 'Verifying...' : 'Verify Password'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="profile-edit-button"
                                    onClick={handleSensitiveSave}
                                    disabled={sensitiveLoading}
                                    style={{ background: 'var(--color-primary)', color: 'white', border: 'none', opacity: sensitiveLoading ? 0.7 : 1, cursor: sensitiveLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    {sensitiveLoading ? 'Saving...' : `Save ${sensitiveLabels[activeKind]}`}
                                </button>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
