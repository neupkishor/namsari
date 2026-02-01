'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupportArticle, updateSupportArticle } from './actions';

export default function SupportFormClient({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category || 'General',
        content: initialData?.content || '',
        status: initialData?.status || 'published'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await updateSupportArticle(initialData.id, formData);
                alert('Article updated successfully!');
            } else {
                await createSupportArticle(formData);
                router.push('/manage/support');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Article Title</label>
                    <input
                        required
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. How to list your first property"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', background: 'white' }}
                    >
                        <option value="General">General</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Account">Account</option>
                        <option value="Partnership">Partnership</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Article Content</label>
                <textarea
                    required
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={15}
                    placeholder="Write your article content here..."
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', lineHeight: '1.6', resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Status:</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={handleChange} /> Published
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={handleChange} /> Draft
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" onClick={() => router.back()} style={{ background: 'none', border: '1px solid var(--color-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-corporate" style={{ padding: '12px 32px' }}>
                        {loading ? 'Saving...' : isEdit ? 'Update Article' : 'Publish Article'}
                    </button>
                </div>
            </div>
        </form>
    );
}
