'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createBlogPost, updateBlogPost } from './actions';
import imageCompression from 'browser-image-compression';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div style={{ height: '400px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading Editor...</div>
});

export default function BlogFormClient({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category || 'General',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        cover_image: initialData?.cover_image || '',
        author: initialData?.author || 'Namasari Team',
        status: initialData?.status || 'draft'
    });

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
    }), []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (value: string) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content || formData.content === '<p><br></p>') {
            alert('Please add some content to the post.');
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                await updateBlogPost(initialData.id, formData);
                alert('Blog post updated successfully!');
            } else {
                await createBlogPost(formData);
                router.push('/manage/blog');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save blog post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Post Title</label>
                    <input
                        required
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter an engaging title"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g. Market Trends"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Author</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Cover Image</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {formData.cover_image && (
                            <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                <img src={formData.cover_image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        const options = {
                                            maxSizeMB: 1,
                                            maxWidthOrHeight: 1200,
                                            useWebWorker: true,
                                        };
                                        const compressedFile = await imageCompression(file, options);

                                        const reader = new FileReader();
                                        reader.readAsDataURL(compressedFile);
                                        reader.onloadend = () => {
                                            setFormData(prev => ({ ...prev, cover_image: reader.result as string }));
                                        };
                                    } catch (error) {
                                        console.error("Image compression error:", error);
                                        alert("Failed to compress image");
                                    }
                                }
                            }}
                            style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Short Excerpt (for preview cards)</label>
                <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief summary of the post..."
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Content</label>
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
                        {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Short Excerpt (for preview cards)</label>
                <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief summary of the post..."
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>Content</label>
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
                        {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
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
        </form>
    );
}
