'use client';

import React, { useMemo, useState } from 'react';
import { createCollection, deleteCollection } from '@/actions/collections';
import Link from 'next/link';

import { PaginationControl } from '@/components/ui';

type PropertyOption = {
    id: number;
    propertyId?: string | null;
    title: string;
    status: string;
    price?: unknown;
    location?: {
        area?: string | null;
        cityVillage?: string | null;
        district?: string | null;
    } | null;
    images: Array<{ url: string }>;
    types: Array<{ name: string }>;
    purposes: Array<{ name: string }>;
    natures: Array<{ name: string }>;
    features?: {
        bedrooms?: number | null;
        bathrooms?: number | null;
    } | null;
};

type FilterOption = {
    id: number;
    name: string;
};

type CriteriaState = {
    selectedTypes: string[];
    selectedPurposes: string[];
    selectedNatures: string[];
    district: string;
    city: string;
    area: string;
    status: string;
    minPrice: string;
    maxPrice: string;
    minBedrooms: string;
    minBathrooms: string;
    featured: boolean;
    exclusive: boolean;
    verified: boolean;
};

type CollectionsClientProps = {
    initialCollections: any[];
    userId: number;
    totalPages: number;
    availableProperties: PropertyOption[];
    filterOptions: {
        types: FilterOption[];
        purposes: FilterOption[];
        natures: FilterOption[];
    };
};

const defaultCriteria: CriteriaState = {
    selectedTypes: [],
    selectedPurposes: [],
    selectedNatures: [],
    district: '',
    city: '',
    area: '',
    status: 'approved',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    featured: false,
    exclusive: false,
    verified: false,
};

function getPropertyPriceValue(price: unknown) {
    if (!price || typeof price !== 'object') return null;

    const data = price as { price?: unknown; totalPrice?: unknown };
    const primary = Number(data.price);
    if (Number.isFinite(primary)) return primary;

    const total = Number(data.totalPrice);
    return Number.isFinite(total) ? total : null;
}

function formatPrice(price: unknown) {
    const value = getPropertyPriceValue(price);
    if (value == null || value === 0) return 'Price on request';

    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0
    }).format(value).replace('NPR', 'NRs.');
}

function includesText(value: string | null | undefined, query: string) {
    if (!query.trim()) return true;
    return String(value || '').toLowerCase().includes(query.trim().toLowerCase());
}

function includesAny(options: Array<{ name: string }>, selected: string[]) {
    if (selected.length === 0) return true;
    const names = options.map((option) => option.name.toLowerCase());
    return selected.some((item) => names.includes(item.toLowerCase()));
}

function matchesPreviewCriteria(property: PropertyOption, criteria: CriteriaState) {
    const price = getPropertyPriceValue(property.price);
    const minPrice = criteria.minPrice ? Number(criteria.minPrice) : null;
    const maxPrice = criteria.maxPrice ? Number(criteria.maxPrice) : null;
    const minBedrooms = criteria.minBedrooms ? Number(criteria.minBedrooms) : null;
    const minBathrooms = criteria.minBathrooms ? Number(criteria.minBathrooms) : null;

    if (criteria.status && property.status !== criteria.status) return false;
    if (!includesAny(property.types, criteria.selectedTypes)) return false;
    if (!includesAny(property.purposes, criteria.selectedPurposes)) return false;
    if (!includesAny(property.natures, criteria.selectedNatures)) return false;
    if (!includesText(property.location?.district, criteria.district)) return false;
    if (!includesText(property.location?.cityVillage, criteria.city)) return false;
    if (!includesText(property.location?.area, criteria.area)) return false;
    if (minPrice != null && (price == null || price < minPrice)) return false;
    if (maxPrice != null && (price == null || price > maxPrice)) return false;
    if (minBedrooms != null && ((property.features?.bedrooms ?? 0) < minBedrooms)) return false;
    if (minBathrooms != null && ((property.features?.bathrooms ?? 0) < minBathrooms)) return false;

    return true;
}

function toggleValue(values: string[], nextValue: string) {
    return values.includes(nextValue)
        ? values.filter((value) => value !== nextValue)
        : [...values, nextValue];
}

export function CollectionsClient({ initialCollections, userId, totalPages, availableProperties, filterOptions }: CollectionsClientProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [creationMode, setCreationMode] = useState<'manual' | 'criteria'>('manual');
    const [propertySearch, setPropertySearch] = useState('');
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
    const [criteria, setCriteria] = useState<CriteriaState>(defaultCriteria);

    const filteredProperties = useMemo(() => {
        const query = propertySearch.trim().toLowerCase();
        if (!query) return availableProperties;

        return availableProperties.filter((property) => {
            const location = [property.location?.area, property.location?.cityVillage, property.location?.district].filter(Boolean).join(' ');
            return `${property.title} ${property.propertyId || ''} ${location}`.toLowerCase().includes(query);
        });
    }, [availableProperties, propertySearch]);

    const criteriaMatches = useMemo(() => {
        return availableProperties.filter((property) => matchesPreviewCriteria(property, criteria));
    }, [availableProperties, criteria]);

    const resetCreateState = () => {
        setIsCreating(false);
        setCreationMode('manual');
        setPropertySearch('');
        setSelectedPropertyIds([]);
        setCriteria(defaultCriteria);
    };

    return (
        <div className="layout-container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Collections</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Create manual property sets or auto-fill collections from matching criteria.</p>
                </div>
                <Link
                    href="/manage/collections/create"
                    style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 18px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
                >
                    + Create Collection
                </Link>
            </div>

            {isCreating && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px', overflowY: 'auto' }}>
                    <div style={{ width: 'min(980px, 100%)', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)' }}>
                        <form action={createCollection} onSubmit={() => setTimeout(resetCreateState, 250)}>
                            <input type="hidden" name="user_id" value={userId} />
                            <input type="hidden" name="creation_mode" value={creationMode} />

                            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-light)', marginBottom: '6px' }}>Create collection</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Add selected properties now, or let criteria pick matching properties automatically.</p>
                                </div>
                                <button type="button" onClick={resetCreateState} style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>x</button>
                            </div>

                            <div style={{ padding: '24px', display: 'grid', gap: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                    <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                                        Collection name
                                        <input name="name" required placeholder="Featured land in Lalitpur" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </label>
                                    <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                                        View mode
                                        <select name="view_mode" defaultValue="classic" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="classic">Classic</option>
                                            <option value="social">Social feed</option>
                                        </select>
                                    </label>
                                </div>

                                <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                                    Description
                                    <textarea name="description" rows={3} placeholder="Short visitor-facing note for this collection" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                                </label>

                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 700 }}>
                                    <input name="is_public" type="checkbox" defaultChecked />
                                    Public collection
                                </label>

                                <div style={{ display: 'inline-flex', width: 'fit-content', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                                    <button type="button" onClick={() => setCreationMode('manual')} style={{ padding: '9px 14px', border: 'none', background: creationMode === 'manual' ? 'var(--color-primary)' : 'white', color: creationMode === 'manual' ? 'white' : '#475569', fontWeight: 700, cursor: 'pointer' }}>
                                        Custom properties
                                    </button>
                                    <button type="button" onClick={() => setCreationMode('criteria')} style={{ padding: '9px 14px', border: 'none', borderLeft: '1px solid #cbd5e1', background: creationMode === 'criteria' ? 'var(--color-primary)' : 'white', color: creationMode === 'criteria' ? 'white' : '#475569', fontWeight: 700, cursor: 'pointer' }}>
                                        Criteria auto-select
                                    </button>
                                </div>

                                {creationMode === 'manual' ? (
                                    <div style={{ display: 'grid', gap: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                                            <input value={propertySearch} onChange={(event) => setPropertySearch(event.target.value)} placeholder="Search by title, ID, or location" style={{ width: '100%', maxWidth: '420px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            <span style={{ color: '#64748b', fontWeight: 700 }}>{selectedPropertyIds.length} selected</span>
                                        </div>

                                        <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                            {filteredProperties.map((property) => {
                                                const checked = selectedPropertyIds.includes(property.id);
                                                const location = [property.location?.area, property.location?.cityVillage, property.location?.district].filter(Boolean).join(', ') || 'Location unspecified';

                                                return (
                                                    <label key={property.id} style={{ display: 'grid', gridTemplateColumns: '24px 64px 1fr auto', gap: '12px', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="property_ids"
                                                            value={property.id}
                                                            checked={checked}
                                                            onChange={() => setSelectedPropertyIds((current) => current.includes(property.id) ? current.filter((id) => id !== property.id) : [...current, property.id])}
                                                        />
                                                        <div style={{ width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                                                            {property.images[0]?.url ? <img src={property.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{property.title}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{property.propertyId || `#${property.id}`} · {location}</div>
                                                        </div>
                                                        <div style={{ color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(property.price)}</div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '18px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                            <MultiCheckbox title="Property types" name="criteria_types" options={filterOptions.types} selected={criteria.selectedTypes} onToggle={(value) => setCriteria((current) => ({ ...current, selectedTypes: toggleValue(current.selectedTypes, value) }))} />
                                            <MultiCheckbox title="Purposes" name="criteria_purposes" options={filterOptions.purposes} selected={criteria.selectedPurposes} onToggle={(value) => setCriteria((current) => ({ ...current, selectedPurposes: toggleValue(current.selectedPurposes, value) }))} />
                                            <MultiCheckbox title="Natures" name="criteria_natures" options={filterOptions.natures} selected={criteria.selectedNatures} onToggle={(value) => setCriteria((current) => ({ ...current, selectedNatures: toggleValue(current.selectedNatures, value) }))} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                                            <CriteriaInput label="District" name="criteria_district" value={criteria.district} onChange={(district) => setCriteria((current) => ({ ...current, district }))} />
                                            <CriteriaInput label="City/Village" name="criteria_city" value={criteria.city} onChange={(city) => setCriteria((current) => ({ ...current, city }))} />
                                            <CriteriaInput label="Area" name="criteria_area" value={criteria.area} onChange={(area) => setCriteria((current) => ({ ...current, area }))} />
                                            <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                                                Status
                                                <select name="criteria_status" value={criteria.status} onChange={(event) => setCriteria((current) => ({ ...current, status: event.target.value }))} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                    <option value="">Any</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="warned">Warned</option>
                                                </select>
                                            </label>
                                            <CriteriaInput label="Min price" name="criteria_min_price" type="number" value={criteria.minPrice} onChange={(minPrice) => setCriteria((current) => ({ ...current, minPrice }))} />
                                            <CriteriaInput label="Max price" name="criteria_max_price" type="number" value={criteria.maxPrice} onChange={(maxPrice) => setCriteria((current) => ({ ...current, maxPrice }))} />
                                            <CriteriaInput label="Min bedrooms" name="criteria_min_bedrooms" type="number" value={criteria.minBedrooms} onChange={(minBedrooms) => setCriteria((current) => ({ ...current, minBedrooms }))} />
                                            <CriteriaInput label="Min bathrooms" name="criteria_min_bathrooms" type="number" value={criteria.minBathrooms} onChange={(minBathrooms) => setCriteria((current) => ({ ...current, minBathrooms }))} />
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                                            <BooleanFilter name="criteria_featured" label="Featured only" checked={criteria.featured} onChange={(featured) => setCriteria((current) => ({ ...current, featured }))} />
                                            <BooleanFilter name="criteria_exclusive" label="Exclusive only" checked={criteria.exclusive} onChange={(exclusive) => setCriteria((current) => ({ ...current, exclusive }))} />
                                            <BooleanFilter name="criteria_verified" label="Verified only" checked={criteria.verified} onChange={(verified) => setCriteria((current) => ({ ...current, verified }))} />
                                        </div>

                                        <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                                            {criteriaMatches.length} properties currently match these criteria.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '18px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={resetCreateState} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-primary)', background: 'var(--color-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                                    Create collection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {initialCollections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                    <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No collections yet.</p>
                    <p>Create a collection from selected properties or matching criteria.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {initialCollections.map(col => (
                            <div key={col.id} className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '200px', background: '#f1f5f9', display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center', justifyContent: 'center' }}>
                                    {col.properties.length > 0 ? (
                                        <img src={col.properties[0].images[0]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem', textAlign: 'center', color: '#cbd5e1' }}>🏠</span>
                                    )}
                                </div>

                                <div style={{ padding: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', gap: '12px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>{col.name}</h3>
                                        <span style={{ fontSize: '0.75rem', background: col.is_public ? '#dcfce7' : '#f1f5f9', color: col.is_public ? '#166534' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                            {col.is_public ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                                        {col.description || 'No description provided.'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                                        <span>{col.propertyCount ?? col.properties.length} Properties</span>
                                        <span>·</span>
                                        <span>{col.type === 'system_generated' ? 'Criteria-based' : 'Custom'}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Link
                                        href={`/manage/collections/${col.slug}`}
                                        style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        View Items
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this collection?')) {
                                                await deleteCollection(col.id);
                                            }
                                        }}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <PaginationControl totalPages={totalPages} />
                </>
            )}
        </div>
    );
}

function MultiCheckbox({ title, name, options, selected, onToggle }: { title: string; name: string; options: FilterOption[]; selected: string[]; onToggle: (value: string) => void }) {
    return (
        <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', minWidth: 0 }}>
            <legend style={{ padding: '0 6px', fontWeight: 800, color: '#334155' }}>{title}</legend>
            <div style={{ display: 'grid', gap: '8px', marginTop: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                {options.map((option) => (
                    <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }}>
                        <input type="checkbox" name={name} value={option.name} checked={selected.includes(option.name)} onChange={() => onToggle(option.name)} />
                        {option.name}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function CriteriaInput({ label, name, type = 'text', value, onChange }: { label: string; name: string; type?: string; value: string; onChange: (value: string) => void }) {
    return (
        <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
            {label}
            <input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: 0 }} />
        </label>
    );
}

function BooleanFilter({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 700 }}>
            <input name={name} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
            {label}
        </label>
    );
}
