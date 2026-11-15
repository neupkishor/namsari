'use client';

import { useActionState, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { checkLoginAccount, loginAction } from '@/services/auth/actions';
import { Input } from '@/components/ui';

const initialState: { error?: string } = {};

// Render the login form and any authentication error returned by the server action.
export function LoginForm() {
    const [state = initialState, formAction, isPending] = useActionState(loginAction, initialState);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accountFound, setAccountFound] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [isLookingUp, setIsLookingUp] = useState(false);

    // Restore and verify an identifier saved in the URL after a reload.
    useEffect(() => {
        const savedUsername = new URLSearchParams(window.location.search).get('username.raw');
        if (!savedUsername) return;

        setUsername(savedUsername);
        setIsLookingUp(true);
        void checkLoginAccount(savedUsername)
            .then((result) => {
                if (result.found) setAccountFound(true);
                else setLookupError('Account not found.');
            })
            .catch(() => setLookupError('Unable to check this account. Please try again.'))
            .finally(() => setIsLookingUp(false));
    }, []);

    // Check the identifier before revealing the password step.
    async function handleIdentifierSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLookupError('');
        setIsLookingUp(true);
        try {
            const result = await checkLoginAccount(username);
            if (result.found) {
                const url = new URL(window.location.href);
                url.searchParams.set('username.raw', username);
                window.history.replaceState(null, '', url);
                setAccountFound(true);
            }
            else setLookupError('Account not found.');
        } catch {
            setLookupError('Unable to check this account. Please try again.');
        } finally {
            setIsLookingUp(false);
        }
    }

    // Return to the identifier step so another account can be entered.
    function handleChangeAccount() {
        setAccountFound(false);
        setPassword('');
        setLookupError('');
        const url = new URL(window.location.href);
        url.searchParams.delete('username.raw');
        window.history.replaceState(null, '', url);
    }

    return (
        <form
            action={accountFound ? formAction : undefined}
            onSubmit={accountFound ? undefined : handleIdentifierSubmit}
            className="card"
            style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
            {accountFound ? (
                <>
                    <input type="hidden" name="username" value={username} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ color: 'var(--color-primary)', fontWeight: '600', margin: 0 }}>Welcome back, {username}</p>
                        <button type="button" onClick={handleChangeAccount} style={{ border: 0, background: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                            Change
                        </button>
                    </div>
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                    {state.error && (
                        <div role="alert" aria-live="polite" style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                            {state.error}
                        </div>
                    )}
                    <button type="submit" disabled={isPending} style={{ marginTop: '8px', padding: '14px', background: 'var(--color-primary)', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
                        {isPending ? 'Logging In…' : 'Log In'}
                    </button>
                </>
            ) : (
                <>
                    <Input
                        label="Username, Email or Phone"
                        name="username"
                        type="text"
                        placeholder="Enter username, email or phone"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                    {lookupError && (
                        <div role="alert" aria-live="polite" style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                            {lookupError}
                        </div>
                    )}
                    <button type="submit" disabled={isLookingUp} style={{ marginTop: '8px', padding: '14px', background: 'var(--color-primary)', color: 'white', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: isLookingUp ? 'wait' : 'pointer', opacity: isLookingUp ? 0.7 : 1 }}>
                        {isLookingUp ? 'Checking…' : 'Continue'}
                    </button>
                </>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '8px' }}>
                Don&apos;t have an account? <Link href="/auth/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Create one</Link>
            </p>
        </form>
    );
}
