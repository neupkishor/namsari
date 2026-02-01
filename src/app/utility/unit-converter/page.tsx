'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const UNITS = [
    { id: 'ropani', label: 'Ropani', factor: 5476, group: 'Hill System' },
    { id: 'aana', label: 'Aana', factor: 342.25, group: 'Hill System' },
    { id: 'paisa', label: 'Paisa', factor: 85.5625, group: 'Hill System' },
    { id: 'daam', label: 'Daam', factor: 21.390625, group: 'Hill System' },
    { id: 'bigha', label: 'Bigha', factor: 72900, group: 'Terai System' },
    { id: 'kattha', label: 'Kattha', factor: 3645, group: 'Terai System' },
    { id: 'dhur', label: 'Dhur', factor: 182.25, group: 'Terai System' },
    { id: 'sq_feet', label: 'Square Feet', factor: 1, group: 'Standard' },
    { id: 'sq_meter', label: 'Square Meter', factor: 10.7639, group: 'Standard' },
];

export default function UnitConverterPage() {
    const [values, setValues] = useState<Record<string, string>>({});

    const [activeGroup, setActiveGroup] = useState<string | null>(null);

    const handleChange = (id: string, value: string) => {
        // Set active group on first input interaction if not set
        if (!activeGroup && value) {
            const unit = UNITS.find(u => u.id === id);
            if (unit) setActiveGroup(unit.group);
        }

        setValues(prev => ({ ...prev, [id]: value }));
    };

    const getBreakdown = (valSqFt: number, system: 'hill' | 'terai' | 'standard') => {
        let remaining = valSqFt;
        const parts: string[] = [];

        if (system === 'hill') {
            const ropani = Math.floor(remaining / 5476);
            if (ropani > 0) parts.push(`${ropani} Ropani`);
            remaining %= 5476;

            const aana = Math.floor(remaining / 342.25);
            if (aana > 0) parts.push(`${aana} Aana`);
            remaining %= 342.25;

            const paisa = Math.floor(remaining / 85.5625);
            if (paisa > 0) parts.push(`${paisa} Paisa`);
            remaining %= 85.5625;

            const daam = remaining / 21.390625;
            if (daam > 0.01) parts.push(`${daam.toFixed(2)} Daam`);
        }
        else if (system === 'terai') {
            const bigha = Math.floor(remaining / 72900);
            if (bigha > 0) parts.push(`${bigha} Bigha`);
            remaining %= 72900;

            const kattha = Math.floor(remaining / 3645);
            if (kattha > 0) parts.push(`${kattha} Kattha`);
            remaining %= 3645;

            const dhur = remaining / 182.25;
            if (dhur > 0.01) parts.push(`${dhur.toFixed(2)} Dhur`);
        }
        else if (system === 'standard') {
            // standard: sq meter + sq cm
            // 1 sq ft = 0.09290304 sq meter
            const totalSqMeter = remaining * 0.09290304;
            const sqMeter = Math.floor(totalSqMeter);
            if (sqMeter > 0) parts.push(`${sqMeter} Sq. Meter`);

            const remainingSqMeter = totalSqMeter - sqMeter;
            const sqCm = remainingSqMeter * 10000;
            if (sqCm > 0.1) parts.push(`${sqCm.toFixed(1)} Sq. cm`);
        }

        return parts.length > 0 ? parts.join(', ') : '-';
    };

    const results = React.useMemo(() => {
        let totalSqFeet = 0;
        let hasValid = false;

        Object.entries(values).forEach(([id, val]) => {
            const num = parseFloat(val);
            const unit = UNITS.find(u => u.id === id);
            if (!isNaN(num) && unit) {
                totalSqFeet += num * unit.factor;
                if (Math.abs(num) > 0) hasValid = true;
            }
        });

        if (!hasValid) return null;

        const getItems = (groupName: string) => {
            return UNITS.filter(u => u.group === groupName).map(u => {
                const val = totalSqFeet / u.factor;
                return {
                    label: u.label,
                    value: val % 1 === 0 ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '')
                };
            });
        };

        return {
            standard: {
                composite: getBreakdown(totalSqFeet, 'standard'),
                items: getItems('Standard')
            },
            hill: {
                composite: getBreakdown(totalSqFeet, 'hill'),
                items: getItems('Hill System')
            },
            terai: {
                composite: getBreakdown(totalSqFeet, 'terai'),
                items: getItems('Terai System')
            }
        };
    }, [values]);

    const resetAll = () => {
        setValues({});
        setActiveGroup(null);
    };

    const groupedUnits = UNITS.reduce((acc, unit) => {
        if (!acc[unit.group]) acc[unit.group] = [];
        acc[unit.group].push(unit);
        return acc;
    }, {} as Record<string, typeof UNITS>);

    const hasValues = values && Object.keys(values).length > 0;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/utility" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: '600', marginBottom: '24px' }}>
                ← Back to Tools
            </Link>

            <div className="card" style={{ padding: '40px', minHeight: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>Unit Converter</h1>

                    {/* Clear Button */}
                    {hasValues && (
                        <button
                            onClick={resetAll}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                background: '#fff1f2',
                                color: '#e11d48',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>↺</span> Clear
                        </button>
                    )}
                </div>

                <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>
                    Enter values below and press Calculate to convert between all unit systems.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {Object.entries(groupedUnits).map(([group, units]) => {
                        // If an active group is selected (user started typing), hide other groups
                        const isHidden = activeGroup !== null && activeGroup !== group;

                        return (
                            <div
                                key={group}
                                className={`group-section ${isHidden ? 'hidden' : ''}`}
                                style={{
                                    overflow: 'hidden',
                                    transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    maxHeight: isHidden ? '0px' : '500px',
                                    opacity: isHidden ? 0 : 1,
                                    marginBottom: isHidden ? '0px' : '40px'
                                }}
                            >
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                                    {group}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                                    {units.map(unit => (
                                        <div key={unit.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label htmlFor={unit.id} style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>
                                                {unit.label}
                                            </label>
                                            <input
                                                id={unit.id}
                                                type="number"
                                                value={values[unit.id] || ''}
                                                onChange={(e) => handleChange(unit.id, e.target.value)}

                                                placeholder="0"
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--color-border)',
                                                    fontSize: '1rem',
                                                    width: '100%',
                                                    transition: 'all 0.2s',
                                                    background: 'white'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}


                </div>

                {results && (
                    <div style={{ marginTop: '60px', borderTop: '2px solid #f1f5f9', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {/* Hill System */}
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '16px' }}>Hill System</h3>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite Conversion</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{results.hill.composite}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {results.hill.items.map((item) => (
                                    <div key={item.label} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>In {item.label}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Terai System */}
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '16px' }}>Terai System</h3>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite Conversion</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{results.terai.composite}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {results.terai.items.map((item) => (
                                    <div key={item.label} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>In {item.label}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Standard System */}
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '16px' }}>Standard System</h3>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite Conversion</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{results.standard.composite}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {results.standard.items.map((item) => (
                                    <div key={item.label} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>In {item.label}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
