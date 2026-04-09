'use client';

import React, { useState } from 'react';
import { createRole, deleteRole } from '@/actions/permissions';
import { useRouter } from 'next/navigation';

const RESOURCES = [
    'User',
    'Property',
    'Blog',
    'Agency',
    'Bank',
    'Career',
    'Support',
    'Collection',
    'Advertisement',
    'Featured'
];

const PERMISSION_LEVELS = [
    { value: 'view', label: 'View (1)' },
    { value: 'create', label: 'Create (2)' },
    { value: 'view&create', label: 'View & Create (3)' },
    { value: 'view&update', label: 'View & Update (4)' },
    { value: 'view&delete', label: 'View & Delete' },
    { value: 'view&create&update', label: 'View, Create & Update (5)' },
    { value: 'view&create&delete', label: 'View, Create & Delete (6)' },
    { value: 'view&update&delete', label: 'View, Update & Delete (7)' },
    { value: 'view&create&update&delete', label: 'View, Create, Update & Delete (8)' }
];

export default function RolesClient({ roles }: { roles: any[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // New Role Form State
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState<{resource: string, action: string}[]>([]);

    const handleAddPermission = () => {
        setNewRolePermissions([...newRolePermissions, { resource: RESOURCES[0], action: PERMISSION_LEVELS[0].value }]);
    };

    const handleRemovePermission = (index: number) => {
        const updated = [...newRolePermissions];
        updated.splice(index, 1);
        setNewRolePermissions(updated);
    };

    const handlePermissionChange = (index: number, field: 'resource' | 'action', value: string) => {
        const updated = [...newRolePermissions];
        updated[index] = { ...updated[index], [field]: value };
        setNewRolePermissions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createRole(newRoleName, newRoleDesc, newRolePermissions);
        setLoading(false);
        if (res.success) {
            setIsCreating(false);
            setNewRoleName('');
            setNewRoleDesc('');
            setNewRolePermissions([]);
            router.refresh();
        } else {
            alert('Failed to create role');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        const res = await deleteRole(id);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to delete role');
        }
    };

    return (
        <div>
            {/* List Roles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {roles.map((role) => (
                    <div key={role.id} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{role.name}</h3>
                            <button 
                                onClick={() => handleDelete(role.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Delete Role"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', minHeight: '40px' }}>{role.description || 'No description provided.'}</p>
                        
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Permissions</div>
                            {role.permissions.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {role.permissions.map((p: any) => (
                                    <span key={p.id} style={{ fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', color: '#475569' }}>
                                        <strong>{p.resource}</strong>: {
                                            p.action === 'readOnly' ? 'View (1)' :
                                            p.action === 'read&write' ? 'View & Create (3)' :
                                            p.action === 'read&write&delete' ? 'View, Create & Delete (6)' :
                                            p.action === 'read&delete' ? 'View & Delete' :
                                            PERMISSION_LEVELS.find(l => l.value === p.action)?.label || p.action
                                        }
                                    </span>
                                ))}
                            </div>
                        ) : (
                                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>No permissions set</div>
                            )}
                        </div>
                    </div>
                ))}

                <div 
                    onClick={() => setIsCreating(true)}
                    style={{ 
                        background: '#f8fafc', 
                        borderRadius: '12px', 
                        border: '2px dashed #cbd5e1', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        minHeight: '200px',
                        transition: 'all 0.2s'
                    }}
                    className="hover:bg-slate-100 hover:border-slate-400"
                >
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>+</div>
                        <div style={{ fontWeight: '600' }}>Create New Role</div>
                    </div>
                </div>
            </div>

            {/* Create Role Modal */}
            {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create New Role</h2>
                            <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Role Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g. Blog Editor"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Description</label>
                                <textarea 
                                    value={newRoleDesc}
                                    onChange={(e) => setNewRoleDesc(e.target.value)}
                                    placeholder="Brief description of this role's capabilities..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', minHeight: '80px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Permissions</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddPermission}
                                        style={{ fontSize: '0.85rem', color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        + Add Permission
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {newRolePermissions.map((perm, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                            <select 
                                                value={perm.resource}
                                                onChange={(e) => handlePermissionChange(idx, 'resource', e.target.value)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            >
                                                {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <select 
                                                value={perm.action}
                                                onChange={(e) => handlePermissionChange(idx, 'action', e.target.value)}
                                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            >
                                                {PERMISSION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemovePermission(idx)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {newRolePermissions.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            No permissions added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreating(false)}
                                    style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'Creating...' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
