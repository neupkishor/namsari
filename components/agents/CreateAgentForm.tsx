'use client';

import { useState } from 'react';
import { createAgencyAgent, addExistingAgent } from '@/actions/agents';

export default function CreateAgentForm({ agencyId }: { agencyId: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'add'>('create');
    const [loading, setLoading] = useState(false);

    // Create State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [exclusive, setExclusive] = useState(false);

    // Add State
    const [username, setUsername] = useState('');

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('password', password);
        formData.append('agencyId', agencyId.toString());
        if (exclusive) formData.append('exclusive', 'on');

        try {
            await createAgencyAgent(formData);
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            alert(error.message || "Failed to create agent");
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('username', username);
        formData.append('agencyId', agencyId.toString());

        try {
            await addExistingAgent(formData);
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            alert(error.message || "Failed to add agent");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setExclusive(false);
        setUsername('');
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="btn-primary"
            >
                + Add Agent
            </button>
        );
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Manage Agency Agents</h3>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button 
                        onClick={() => setMode('create')}
                        style={{ 
                            flex: 1, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            background: mode === 'create' ? '#eff6ff' : '#f8fafc',
                            color: mode === 'create' ? '#1d4ed8' : '#64748b',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Create New Account
                    </button>
                    <button 
                        onClick={() => setMode('add')}
                        style={{ 
                            flex: 1, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            background: mode === 'add' ? '#eff6ff' : '#f8fafc',
                            color: mode === 'add' ? '#1d4ed8' : '#64748b',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Add Existing Agent
                    </button>
                </div>

                {mode === 'create' ? (
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name</label>
                            <input className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email</label>
                            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Phone</label>
                            <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1234567890" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
                            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="******" />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                            <input 
                                type="checkbox" 
                                id="exclusive" 
                                checked={exclusive} 
                                onChange={e => setExclusive(e.target.checked)} 
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="exclusive" style={{ fontSize: '0.9rem', color: '#991b1b', cursor: 'pointer' }}>
                                <strong>Exclusive Agent</strong>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>This freezes the agent to your agency. They cannot join others until unfreezed.</div>
                            </label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Agent Username</label>
                            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required placeholder="e.g. johndoe123" />
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                Enter the username of the existing agent you want to add to your agency.
                            </p>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Agent'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
