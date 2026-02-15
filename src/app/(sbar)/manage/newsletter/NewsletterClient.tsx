import { PaginationControl } from '@/components/ui';

interface Subscriber {
    id: number;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NewsletterClientProps {
    subscribers: Subscriber[];
    totalPages: number;
    totalCount: number;
}

export default function NewsletterClient({ subscribers, totalPages, totalCount }: NewsletterClientProps) {

    return (
        <div style={{ paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Newsletter Subscribers</h1>
                <p style={{ color: '#64748b' }}>Manage your email subscription list.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {subscribers.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        No subscribers yet.
                    </div>
                ) : (
                    subscribers.map((sub) => (
                        <div key={sub.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary-light)' }}>
                                    {sub.email}
                                </div>
                                <span style={{
                                    background: sub.isActive ? '#dcfce7' : '#fee2e2',
                                    color: sub.isActive ? '#166534' : '#991b1b',
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                                }}>
                                    {sub.isActive ? 'Active' : 'Unsubscribed'}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📅 Subscribed: {new Date(sub.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px', textAlign: 'right' }}>
                                {/* Potential Actions here */}
                                <button style={{ fontSize: '0.85rem', color: '#ef4444', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right', color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                Total Subscribers: <strong>{totalCount}</strong>
            </div>

            <PaginationControl totalPages={totalPages} />
        </div>
    );
}
