'use client';

import { useState } from 'react';
import { updateSiteSettings } from '@/actions/settings';

const SECTIONS = [
    { key: 'show_featured_properties', label: 'Featured Properties', description: 'Showcase highlighted property listings.' },
    { key: 'show_sponsored_deals', label: 'Sponsored Deals', description: 'Display advertisement and sponsored content.' },
    { key: 'show_property_collection', label: 'Property Collection', description: 'Curated property collections on the homepage.' },
    { key: 'show_explore_categories', label: 'Explore by Categories', description: 'Browse properties by type/category.' },
] as const;

type SettingsKeys = typeof SECTIONS[number]['key'];

export default function SiteClient({ settings }: { settings: Record<string, any> }) {
    const [values, setValues] = useState<Record<SettingsKeys, boolean>>({
        show_featured_properties: settings.show_featured_properties,
        show_sponsored_deals: settings.show_sponsored_deals,
        show_property_collection: settings.show_property_collection,
        show_explore_categories: settings.show_explore_categories,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            await updateSiteSettings(values);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {SECTIONS.map((section, i) => (
                    <div
                        key={section.key}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 0',
                            borderBottom: i < SECTIONS.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{section.label}</div>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{section.description}</div>
                        </div>
                        <button
                            role="switch"
                            aria-checked={values[section.key]}
                            onClick={() => setValues(prev => ({ ...prev, [section.key]: !prev[section.key] }))}
                            style={{
                                width: '48px',
                                height: '26px',
                                borderRadius: '13px',
                                border: 'none',
                                cursor: 'pointer',
                                background: values[section.key] ? 'var(--color-primary)' : '#cbd5e1',
                                position: 'relative',
                                flexShrink: 0,
                                transition: 'background 0.2s',
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: values[section.key] ? '25px' : '3px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'white',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: '500' }}>✓ Saved</span>}
            </div>
        </div>
    );
}
