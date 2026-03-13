import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getConversationHistory } from '@/actions/ai';
import ChatInterface from './ChatInterface';

export default async function MessagesPage() {
    const session = await getSession();
    
    if (!session) {
        redirect('/auth/login');
    }

    const messages = await getConversationHistory();

    // Serialize dates for client
    const serializedMessages = messages.map((msg: any) => ({
        ...msg,
        sent_on: msg.sent_on.toISOString()
    }));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '24px', flexShrink: 0 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>AI Assistant</h1>
                <p style={{ color: '#64748b' }}>Chat with our AI to list properties, get insights, and more.</p>
            </header>

            <ChatInterface initialMessages={serializedMessages} />
        </div>
    );
}
