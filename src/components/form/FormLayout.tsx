import React from 'react';

/**
 * FormSection - Wrapper for multi-step form sections
 * Controls visibility based on active state
 */
export const FormSection = ({ active, children, gap = '24px' }: { active: boolean; children: React.ReactNode; gap?: string }) => (
    <div style={{ display: active ? 'flex' : 'none', flexDirection: 'column', gap }}>
        {children}
    </div>
);

/**
 * FormGrid - Responsive grid layout for form fields
 * Supports both fixed column count and auto-fill with minWidth
 */
export const FormGrid = ({ children, cols = 3, gap = '24px', minWidth, style }: { children: React.ReactNode; cols?: number | string; gap?: string; minWidth?: string; style?: React.CSSProperties }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: minWidth ? `repeat(auto-fill, minmax(${minWidth}, 1fr))` : (typeof cols === 'number' ? `repeat(${cols}, 1fr)` : cols),
        gap,
        ...style
    }}>
        {children}
    </div>
);

/**
 * FormLabel - Consistent label styling across the form
 */
export const FormLabel = ({ children, marginBottom = '12px' }: { children: React.ReactNode; marginBottom?: string }) => (
    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom }}>{children}</label>
);

/**
 * FormCard - Card container for grouping related form fields
 * Useful for visually separating sections with different backgrounds
 */
export const FormCard = ({ children, padding = '24px', background = 'white', border = '1px solid #e2e8f0', shadow = 'none', gap = '16px', style }: { children: React.ReactNode; padding?: string; background?: string; border?: string; shadow?: string; gap?: string; style?: React.CSSProperties }) => (
    <div style={{ padding, background, border, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap, boxShadow: shadow, ...style }}>
        {children}
    </div>
);

/**
 * SectionTitle - Styled heading for form sections
 */
export const SectionTitle = ({ children, color = 'var(--color-primary-light)' }: { children: React.ReactNode; color?: string }) => (
    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color }}>{children}</h3>
);
