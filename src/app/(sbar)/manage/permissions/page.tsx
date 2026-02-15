import React from 'react';

export default function PermissionsPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>Permissions & Roles</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Configure system access levels and role-based permissions.</p>
            </header>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Permission Management</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    This module is currently under development. You will be able to define granular permissions for different user roles here.
                </p>
            </div>
        </div>
    );
}
