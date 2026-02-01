import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { updateBank, deleteBank, addBankRate } from '../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BankDetailsPage({ params }: { params: { slug: string } }) {
    const bank = await prisma.bank.findUnique({
        where: { slug: params.slug },
        include: {
            rates: {
                orderBy: { interest_from: 'desc' }
            }
        }
    });

    if (!bank) notFound();

    const updateBankAction = updateBank.bind(null, bank.id);
    const deleteBankAction = deleteBank.bind(null, bank.id);
    const addRateAction = addBankRate.bind(null, bank.id);

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <Link href="/manage/banks" style={{ display: 'inline-block', marginBottom: '24px', color: '#64748b' }}>
                ← Back to Banks
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px', alignItems: 'start' }}>
                {/* Left Column: Bank Details & Rates history */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Bank Info Card */}
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Bank Details</h2>
                            <form action={deleteBankAction}>
                                <button type="submit" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => { if (!confirm('Are you sure?')) return false; }}>
                                    Delete Bank
                                </button>
                            </form>
                        </div>

                        <form action={updateBankAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                                <input name="name" defaultValue={bank.name} className="form-control" required />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Icon URL</label>
                                <input name="icon" defaultValue={bank.icon || ''} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
                                <textarea name="description" defaultValue={bank.description || ''} className="form-control" rows={3} />
                            </div>
                            <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                        </form>
                    </div>

                    {/* Rates History */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Interest Rate History</h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Rate (%)</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Effective From</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left' }}>Valid To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bank.rates.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No rates recorded yet.</td>
                                    </tr>
                                ) : (
                                    bank.rates.map(rate => (
                                        <tr key={rate.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 24px', fontWeight: '600', color: 'var(--color-primary)' }}>{rate.interest}%</td>
                                            <td style={{ padding: '12px 24px' }}>{new Date(rate.interest_from).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 24px', color: '#64748b' }}>
                                                {rate.interest_to ? new Date(rate.interest_to).toLocaleDateString() : 'Present'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Add New Rate */}
                <div className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Update Interest Rate</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>Add a new interest rate entry. This will effectively become the current rate if the date is latest.</p>

                    <form action={addRateAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Interest Rate (%)</label>
                            <input name="interest" type="number" step="0.01" className="form-control" placeholder="e.g. 8.5" required />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Effective From</label>
                            <input name="interest_from" type="date" className="form-control" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Valid To (Optional)</label>
                            <input name="interest_to" type="date" className="form-control" />
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Leave empty if currently active.</div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Add Rate Update</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
