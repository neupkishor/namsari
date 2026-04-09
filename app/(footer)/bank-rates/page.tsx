import Prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BankRatesPage() {
    const banks = await Prisma.bank.findMany({
        include: {
            rates: {
                orderBy: { interest_from: 'desc' },
                take: 1
            }
        }
    });

    // Helper to format date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="layout-container" style={{ padding: '60px 0', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--color-primary)' }}>Current Bank Interest Rates</h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Compare the latest fixed deposit and savings interest rates across major banks in Nepal.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                {banks.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
                        No bank rates available at the moment.
                    </div>
                ) : (
                    banks.map(bank => {
                        const currentRate = bank.rates[0];
                        return (
                            <div key={bank.id} className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'white', flex: 1 }}>
                                    <div style={{ width: '80px', height: '80px', marginBottom: '20px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                        {bank.icon ? (
                                            <img src={bank.icon} alt={bank.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                                        ) : (
                                            <span style={{ fontSize: '2rem' }}>🏦</span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{bank.name}</h3>
                                    {bank.description && (
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                                            {bank.description}
                                        </p>
                                    )}

                                    <div style={{ marginTop: 'auto', width: '100%' }}>
                                        {currentRate ? (
                                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Interest Rate</div>
                                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#16a34a' }}>
                                                    {currentRate.interest}%
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '8px' }}>
                                                    Effective from {formatDate(currentRate.interest_from)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                                                Rate updates pending
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
