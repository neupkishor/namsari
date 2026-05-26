'use client';

import React, { useState } from 'react';
import { assignRoleToUser, grantUserPermission, revokeUserPermission } from '@/actions/permissions';
import { useRouter } from 'next/navigation';

export default function UserPermissionClient({ user, roles }: { user: any, roles: any[] }) {
    const router = useRouter();
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(user.role?.id || null);
    const [loading, setLoading] = useState(false);
    
    // State for delegation
    const [actorId, setActorId] = useState('');
    const [permString, setPermString] = useState('');
    const [grantLoading, setGrantLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const roleId = selectedRoleId ? Number(selectedRoleId) : null;
        
        const res = await assignRoleToUser(user.id, roleId);
        setLoading(false);
        
        if (res.success) {
            alert('User role updated successfully');
            router.refresh();
        } else {
            alert('Failed to update user role');
        }
    };

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actorId || !permString) return;

        setGrantLoading(true);
        const res = await grantUserPermission(user.id, Number(actorId), permString);
        setGrantLoading(false);

        if (res.success) {
            alert('Permission granted successfully');
            setActorId('');
            setPermString('');
            router.refresh();
        } else {
            alert('Failed to grant permission. Check ID and try again.');
        }
    };

    const handleRevoke = async (actorId: number) => {
        if (!confirm('Are you sure you want to revoke these permissions?')) return;
        
        const res = await revokeUserPermission(user.id, actorId);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to revoke permission');
        }
    };

    const currentRole = roles.find(r => r.id === Number(selectedRoleId));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Main User & Role Section */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '2rem', fontWeight: '600' }}>
                                {user.name?.[0] || user.username[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{user.name}</h2>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>@{user.username}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user.email}</span>
                            <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', color: '#475569', textTransform: 'capitalize' }}>
                                {user.type}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '1rem', color: '#334155' }}>Assigned Role</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <select 
                            value={selectedRoleId || ''} 
                            onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', maxWidth: '400px' }}
                        >
                            <option value="">No Role (Default User)</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.role}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            style={{ 
                                padding: '12px 24px', 
                                background: 'var(--color-primary)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {currentRole && (
                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>Role Details: {currentRole.name}</h3>
                        <p style={{ color: '#64748b', marginBottom: '16px' }}>{currentRole.description}</p>
                        
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Permissions</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                            {currentRole.permissions.map((p: any) => (
                                <div key={p.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{p.resource}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {p.action === 'readOnly' ? 'View (1)' :
                                         p.action === 'read&write' ? 'View & Create (3)' :
                                         p.action === 'read&write&delete' ? 'View, Create & Delete (6)' :
                                         p.action === 'read&delete' ? 'View & Delete' :
                                         p.action}
                                    </div>
                                </div>
                            ))}
                            {currentRole.permissions.length === 0 && (
                                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No specific permissions defined.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delegation Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Permissions Given (Delegated) */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Delegate Permissions</h3>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Grant specific permissions to other users (e.g., agents) to act on behalf of this account.</p>

                    <form onSubmit={handleGrant} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>User ID to Permit</label>
                            <input 
                                type="number" 
                                placeholder="e.g. 123" 
                                value={actorId}
                                onChange={(e) => setActorId(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>Permissions (JSON/Text)</label>
                            <input 
                                type="text" 
                                placeholder='e.g. {"property": "create"}' 
                                value={permString}
                                onChange={(e) => setPermString(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={grantLoading}
                            style={{ 
                                padding: '10px', 
                                background: '#3b82f6', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: grantLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {grantLoading ? 'Granting...' : 'Grant Permission'}
                        </button>
                    </form>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: '#334155' }}>Active Delegations</h4>
                        {user.permissionsGiven?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {user.permissionsGiven.map((perm: any) => (
                                    <div key={perm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#334155' }}>To: {perm.actor.name} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(ID: {perm.actor.id})</span></div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{perm.permissions}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleRevoke(perm.actor.id)}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No permissions delegated.</p>
                        )}
                    </div>
                </div>

                {/* Permissions Received */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Received Permissions</h3>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Permissions granted to this user by others.</p>

                    {user.permissionsReceived?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {user.permissionsReceived.map((perm: any) => (
                                <div key={perm.id} style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                    <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>From: {perm.owner.name} <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(ID: {perm.owner.id})</span></div>
                                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>{perm.permissions}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Granted on {new Date(perm.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No permissions received.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
