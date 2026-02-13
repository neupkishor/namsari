'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createSupportArticle, updateSupportArticle } from './actions';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div style={{ height: '400px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading Editor...</div>
});

export default function SupportFormClient({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category || 'General',
        content: initialData?.content || '',
        emoji: initialData?.emoji || '',
        status: initialData?.status || 'published'
    });

    // Custom toolbar modules for Quill - specifically removing font
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
    }), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (value: string) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content || formData.content === '<p><br></p>') {
            alert('Please provide some content for the support article.');
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                await updateSupportArticle(initialData.id, formData);
                alert('Support article updated successfully!');
            } else {
                await createSupportArticle(formData);
                router.push('/manage/support');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save support article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Support Article Title</label>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Emoji Icon</label>
                    <input
                        type="text"
                        name="emoji"
                        value={formData.emoji}
                        onChange={handleChange}
                        placeholder="e.g. 📄, 🔧, 💳"
                        maxLength={2}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', width: '100px', textAlign: 'center' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Support Article Content</label>
                <div style={{ height: 'auto', minHeight: '400px' }} className="quill-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={modules}
                        style={{ height: '350px', marginBottom: '50px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Status:</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={handleChange as any} /> Published
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={handleChange as any} /> Draft
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" onClick={() => router.back()} style={{ background: 'none', border: '1px solid var(--color-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-corporate" style={{ padding: '12px 32px' }}>
                        {loading ? 'Saving...' : isEdit ? 'Update Support Article' : 'Publish Support Article'}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .quill-wrapper .ql-container {
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    font-family: inherit !important;
                    font-size: 1rem;
                }
                .quill-wrapper .ql-toolbar {
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    background: #f8fafc;
                }
                .quill-wrapper .ql-editor {
                    min-height: 300px;
                    font-family: inherit !important;
                }
                .quill-wrapper .ql-editor p {
                    margin-bottom: 1rem;
                }
            `}</style>
        </form >
    );
}
