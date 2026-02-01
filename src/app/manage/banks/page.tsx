import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ManageBanksPage() {
    const banks = await prisma.bank.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            rates: {
                orderBy: { interest_from: 'desc' },
                take: 1
            }
        }
    });

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Manage Banks</h1>
                <Link href="/manage/banks/create" className="btn-primary">
                    + Add New Bank
                </Link>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Bank</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Current Rate</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Latest Update</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banks.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No banks found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            banks.map(bank => {
                                const currentRate = bank.rates[0];
                                return (
                                    <tr key={bank.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {bank.icon ? (
                                                    <img src={bank.icon} alt={bank.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏦</div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{bank.name}</div>
                                                    {bank.description && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{bank.description.substring(0, 50)}...</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {currentRate ? (
                                                <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{currentRate.interest}%</span>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', color: '#64748b' }}>
                                            {currentRate ? new Date(currentRate.interest_from).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <Link href={`/manage/banks/${bank.slug}`} style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
