import React from 'react';
import { getUserSessions } from '@/services/auth/actions';
import LoginsClient from './LoginsClient';

export default async function LoginsPage() {
    const sessions = await getUserSessions();

    return <LoginsClient sessions={sessions} />;
}