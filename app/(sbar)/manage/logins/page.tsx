import React from 'react';
import { getUserSessions } from '@/actions/auth';
import LoginsClient from './LoginsClient';

export default async function LoginsPage() {
    const sessions = await getUserSessions();

    return <LoginsClient sessions={sessions} />;
}