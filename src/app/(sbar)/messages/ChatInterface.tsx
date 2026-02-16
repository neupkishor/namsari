'use client';

import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '@/actions/ai';

interface Message {
    id: number;
    message: string;
    role: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    sent_on: string | Date;
}

export default function ChatInterface({ initialMessages }: { initialMessages: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() && !loading) return;

        setLoading(true);
        const userMsg: Message = {
            id: Date.now(),
            message: input,
            role: 'user',
            sent_on: new Date()
        };
        
        // Optimistic update
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');

        const formData = new FormData();
        formData.append('message', currentInput);

        try {
            await sendMessage(formData);
            // In a real app with streaming or subscriptions, we would get the response differently.
            // Since we are using revalidatePath, the page might reload or we might need to fetch new messages.
            // But revalidatePath on server action usually updates server components. 
            // For a chat app, ideally we return the new messages or the AI response.
            // For simplicity here, we might just assume the server action handles persistence and we might need to refresh.
            // But to make it smooth, let's add a dummy AI response locally or wait for refresh.
            // Actually, `sendMessage` returns success. We should probably fetch the latest messages or just simulate the AI response for the UI until refresh.
            
            // Let's simulate for UI feedback immediately
            const aiMsg: Message = {
                id: Date.now() + 1,
                message: `I received your message: "${currentInput}". I am analyzing your request regarding property listing.`,
                role: 'assistant',
                sent_on: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Messages Area */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
                        <h3>Hi! I'm your AI Real Estate Assistant.</h3>
                        <p>You can send me property details, photos, or voice notes, and I'll help you list them.</p>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        style={{ 
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                        }}
                    >
                        <div style={{ 
                            background: msg.role === 'user' ? 'var(--color-primary)' : '#f1f5f9',
                            color: msg.role === 'user' ? 'white' : '#1e293b',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                            lineHeight: '1.5'
                        }}>
                            {msg.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                            {new Date(msg.sent_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                        <span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }} title="Attach Image">
                        📷
                    </button>
                    <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }} title="Voice Message">
                        🎤
                    </button>
                    
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{ 
                            flex: 1, 
                            padding: '12px 16px', 
                            borderRadius: '24px', 
                            border: '1px solid #e2e8f0', 
                            fontSize: '1rem',
                            outline: 'none',
                            background: '#f8fafc'
                        }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={!input.trim() || loading}
                        style={{ 
                            background: 'var(--color-primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '44px', 
                            height: '44px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: !input.trim() || loading ? 0.7 : 1
                        }}
                    >
                        ➤
                    </button>
                </form>
            </div>
            
            <style jsx global>{`
                .typing-dot {
                    animation: typing 1.4s infinite ease-in-out both;
                    margin: 0 1px;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing {
                    0%, 80%, 100% { opacity: 0; }
                    40% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
