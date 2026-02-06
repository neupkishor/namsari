'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EMICalculatorPage() {
    const [amount, setAmount] = useState(1000000); // 10 Lakhs default
    const [rate, setRate] = useState(12); // 12% default
    const [years, setYears] = useState(10); // 10 Years default

    const { emi, totalInterest, totalPayment, chartData } = useMemo(() => {
        const principal = Number(amount);
        const monthlyRate = Number(rate) / 12 / 100;
        const months = Number(years) * 12;

        if (!principal || !monthlyRate || !months) {
            return { emi: 0, totalInterest: 0, totalPayment: 0, chartData: [] };
        }

        const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPay = emiValue * months;
        const totalInt = totalPay - principal;

        return {
            emi: Math.round(emiValue),
            totalInterest: Math.round(totalInt),
            totalPayment: Math.round(totalPay),
            chartData: [
                { name: 'Principal Amount', value: principal },
                { name: 'Total Interest', value: Math.round(totalInt) }
            ]
        };
    }, [amount, rate, years]);

    const COLORS = ['var(--color-primary)', 'var(--color-gold)'];

    // Format currency (NPR)
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Link href="/utility" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: '600', marginBottom: '24px' }}>
                ← Back to Tools
            </Link>

            <div className="card" style={{ padding: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary)' }}>EMI Calculator</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Plan your finances with our easy monthly installment calculator.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '700', color: '#334155' }}>Loan Amount (Rs.)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1.1rem', fontWeight: '600' }}
                            />
                            <input
                                type="range"
                                min="100000"
                                max="50000000"
                                step="100000"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '700', color: '#334155' }}>Interest Rate (%)</label>
                            <input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1.1rem', fontWeight: '600' }}
                            />
                            <input
                                type="range"
                                min="1"
                                max="25"
                                step="0.5"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontWeight: '700', color: '#334155' }}>Loan Tenure (Years)</label>
                            <input
                                type="number"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1.1rem', fontWeight: '600' }}
                            />
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="1"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                            />
                        </div>
                    </div>

                    {/* Results & Chart */}
                    <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Monthly EMI</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{formatCurrency(emi)}</div>
                        </div>

                        <div style={{ width: '100%', height: '250px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ width: '100%', marginTop: '24px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Interest</div>
                                <div style={{ fontWeight: '700', color: 'var(--color-gold)' }}>{formatCurrency(totalInterest)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Payment</div>
                                <div style={{ fontWeight: '700', color: 'var(--color-primary-light)' }}>{formatCurrency(totalPayment)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
