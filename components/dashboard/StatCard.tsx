import React from 'react';

export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon, 
    color = 'var(--color-primary)' 
}: { 
    title: string, 
    value: string | number, 
    subtitle?: string, 
    trend?: string, 
    icon?: React.ReactNode, 
    color?: string 
}) {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginTop: '8px' }}>{value}</div>
                </div>
                {icon && (
                    <div style={{ padding: '12px', background: `${color}20`, borderRadius: '12px', color: color }}>
                        {icon}
                    </div>
                )}
            </div>
            {(subtitle || trend) && (
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {trend && (
                        <span style={{ 
                            color: trend.startsWith('+') ? '#10b981' : trend.startsWith('-') ? '#ef4444' : '#f59e0b',
                            fontWeight: '600',
                            background: trend.startsWith('+') ? '#d1fae5' : trend.startsWith('-') ? '#fee2e2' : '#fef3c7',
                            padding: '2px 8px',
                            borderRadius: '4px'
                        }}>
                            {trend}
                        </span>
                    )}
                    <span>{subtitle}</span>
                </div>
            )}
        </div>
    );
}
