'use client';

import React, { useState, useTransition } from 'react';
import { resetAgentPassword } from '@/actions/agents';

interface AgentPasswordResetFormProps {
  agentId: number;
}

export default function AgentPasswordResetForm({ agentId }: AgentPasswordResetFormProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    startTransition(async () => {
      const res = await resetAgentPassword(agentId, password);
      setMessage(res.message || (res.success ? 'Updated.' : 'Failed.'));
      if (res.success) {
        setPassword('');
        setOpen(false);
      }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#334155',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            placeholder="New password"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem'
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPassword('');
              setMessage('');
            }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </form>
      )}
      {message && <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#475569' }}>{message}</div>}
    </div>
  );
}
