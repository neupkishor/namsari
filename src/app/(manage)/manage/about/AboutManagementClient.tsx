'use client';

import React, { useState } from 'react';
import { updateAboutContent } from './actions';
import { useRouter } from 'next/navigation';

export default function AboutManagementClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || 'About Namsari',
        content: initialData?.content || '',
        // Legacy fields for compatibility
        description: initialData?.description || '',
        mission: initialData?.mission || '',
        standard: initialData?.standard || '',
        group_info: initialData?.group_info || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateAboutContent({
                ...formData,
                description: formData.description || '',
                mission: formData.mission || '',
                standard: formData.standard || '',
                group_info: formData.group_info || '',
                content: formData.content || ''
            });
            alert('About content updated successfully!');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to update about content: ${err.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Edit About Content</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Customize the messaging on your public About Us page using HTML.</p>
            </header>

            <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-primary)' }}>Page Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. About Namsari"
                        style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '600' }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-primary)' }}>HTML Article Content</label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;b&gt;, &lt;i&gt;</span>
                    </div>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="<h2>Our Story</h2><p>Founded in 2026...</p>"
                        rows={20}
                        style={{
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            resize: 'vertical',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            background: '#f8fafc'
                        }}
                    />
                </div>

                <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Legacy Structured Content (Optional)</summary>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.8rem' }}>Introduction</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.8rem' }}>Mission</label>
                            <textarea name="mission" value={formData.mission} onChange={handleChange} rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.8rem' }}>Standard</label>
                            <textarea name="standard" value={formData.standard} onChange={handleChange} rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.8rem' }}>Group Info</label>
                            <textarea name="group_info" value={formData.group_info} onChange={handleChange} rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                    </div>
                </details>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px 32px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '1rem',
                            opacity: isSaving ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isSaving ? 'Saving Changes...' : 'Update Public About Page'}
                    </button>
                </div>
            </form>
        </div>
    );
}
