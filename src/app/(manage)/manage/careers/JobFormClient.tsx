'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobListing, updateJobListing } from './actions';

export default function JobFormClient({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'steps'>('general');

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        department: initialData?.department || '',
        location: initialData?.location || 'Kathmandu, Nepal',
        type: initialData?.type || 'Full-time',
        salary_range: initialData?.salary_range || '',
        status: initialData?.status || 'open',
        description: initialData?.description || '',
        requirements: initialData?.requirements || ''
    });

    const [steps, setSteps] = useState<any[]>(() => {
        try {
            return JSON.parse(initialData?.application_steps || '[]');
        } catch {
            return [];
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addStep = () => {
        const newStep = {
            id: Math.random().toString(36).substring(2, 9),
            title: 'New Step',
            description: '',
            items: []
        };
        setSteps([...steps, newStep]);
    };

    const updateStep = (id: string, updates: any) => {
        setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const addItem = (stepId: string, type: string) => {
        setSteps(steps.map(s => {
            if (s.id === stepId) {
                const newItem = {
                    id: Math.random().toString(36).substring(2, 9),
                    type,
                    label: type === 'text_block' || type === 'warning_block' ? 'Content' : 'Question',
                    content: '',
                    options: type === 'mcq' ? ['Option 1'] : [],
                    required: true,
                    maxLength: type === 'short_answer' ? 180 : (type === 'long_answer' ? 1800 : null)
                };
                return { ...s, items: [...s.items, newItem] };
            }
            return s;
        }));
    };

    const updateItem = (stepId: string, itemId: string, updates: any) => {
        setSteps(steps.map(s => {
            if (s.id === stepId) {
                return {
                    ...s,
                    items: s.items.map((item: any) => item.id === itemId ? { ...item, ...updates } : item)
                };
            }
            return s;
        }));
    };

    const removeItem = (stepId: string, itemId: string) => {
        setSteps(steps.map(s => {
            if (s.id === stepId) {
                return { ...s, items: s.items.filter((item: any) => item.id !== itemId) };
            }
            return s;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                application_steps: JSON.stringify(steps)
            };
            if (isEdit) {
                await updateJobListing(initialData.id, payload);
            } else {
                await createJobListing(payload);
            }
            router.push('/manage/careers');
            router.refresh();
        } catch (err) {
            console.error(err);
            alert('Failed to save job listing');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--color-border)' }}>
                <button
                    onClick={() => setActiveTab('general')}
                    style={{
                        padding: '12px 16px', background: 'none', border: 'none',
                        borderBottom: activeTab === 'general' ? '2px solid var(--color-gold)' : '2px solid transparent',
                        fontWeight: '700', cursor: 'pointer', color: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}
                >
                    General Info
                </button>
                <button
                    onClick={() => setActiveTab('steps')}
                    style={{
                        padding: '12px 16px', background: 'none', border: 'none',
                        borderBottom: activeTab === 'steps' ? '2px solid var(--color-gold)' : '2px solid transparent',
                        fontWeight: '700', cursor: 'pointer', color: activeTab === 'steps' ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}
                >
                    Application Steps Builder ({steps.length})
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activeTab === 'general' && (
                    <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Job Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. Senior Software Engineer" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Department</label>
                                <input name="department" value={formData.department} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. Engineering" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Location</label>
                                <input name="location" value={formData.location} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Job Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Salary Range</label>
                                <input name="salary_range" value={formData.salary_range} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. Rs. 80k - 120k" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Status</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {['open', 'closed', 'draft'].map(s => (
                                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleChange} /> {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Job Description (HTML supported)</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Requirements (HTML supported)</label>
                            <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={4} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>
                    </div>
                )}

                {activeTab === 'steps' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {steps.map((step, sIdx) => (
                            <div key={step.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-gold)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            value={step.title}
                                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                                            placeholder="Step Title"
                                            style={{ fontSize: '1.25rem', fontWeight: '800', border: 'none', borderBottom: '1px solid #e2e8f0', padding: '4px 0', width: '100%' }}
                                        />
                                        <input
                                            value={step.description}
                                            onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                            placeholder="Brief description of this step"
                                            style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', border: 'none', borderBottom: '1px solid #e2e8f0', padding: '4px 0' }}
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeStep(step.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove Step</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                                    {step.items.map((item: any, iIdx: number) => (
                                        <div key={item.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-gold)' }}>{item.type.replace('_', ' ')}</span>
                                                <button type="button" onClick={() => removeItem(step.id, item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>Remove</button>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <input
                                                    value={item.content}
                                                    onChange={(e) => updateItem(step.id, item.id, { content: e.target.value })}
                                                    placeholder={item.type.includes('block') ? "Content..." : "Question / Label..."}
                                                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                                                />

                                                {item.type === 'mcq' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Options (one per line)</label>
                                                        <textarea
                                                            value={item.options.join('\n')}
                                                            onChange={(e) => updateItem(step.id, item.id, { options: e.target.value.split('\n') })}
                                                            rows={3}
                                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                                                        />
                                                    </div>
                                                )}

                                                {item.type.includes('answer') && (
                                                    <div style={{ display: 'flex', gap: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input type="checkbox" checked={item.required} onChange={(e) => updateItem(step.id, item.id, { required: e.target.checked })} />
                                                            <span style={{ fontSize: '0.8rem' }}>Required</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '0.8rem' }}>Max Chars:</span>
                                                            <input type="number" value={item.maxLength} onChange={(e) => updateItem(step.id, item.id, { maxLength: parseInt(e.target.value) })} style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['mcq', 'short_answer', 'long_answer', 'text_block', 'warning_block'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => addItem(step.id, type)}
                                            style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px dashed var(--color-gold)', background: 'white', color: 'var(--color-primary)', cursor: 'pointer' }}
                                        >
                                            + {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addStep}
                            style={{ padding: '16px', borderRadius: '12px', border: '2px dashed var(--color-gold)', background: '#fffbeb', color: 'var(--color-gold)', fontWeight: '800', cursor: 'pointer' }}
                        >
                            + Add Another Step
                        </button>
                    </div>
                )}

                <div style={{ position: 'sticky', bottom: '24px', zIndex: 10 }}>
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
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? 'Finalizing...' : (isEdit ? 'Save Changes' : 'Confirm & Publish Job')}
                    </button>
                </div>
            </form>
        </div>
    );
}
