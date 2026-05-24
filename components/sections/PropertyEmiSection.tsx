'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type PropertyEmiSectionProps = {
    totalPrice: number;
};

const CHART_COLORS = ['var(--color-primary)', '#d9a3a3'];

function formatAmountInLakhSystem(value: number) {
    const n = Math.floor(Math.max(0, value || 0));
    if (n === 0) return '0';

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const hajar = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    const parts: string[] = [];
    if (crore > 0) parts.push(`${crore} Crore`);
    if (lakh > 0) parts.push(`${lakh} Lakhs`);
    if (hajar > 0) parts.push(`${hajar} Hajar`);
    if (remainder > 0) parts.push(`${remainder}`);

    return parts.join(' ');
}

export function PropertyEmiSection({ totalPrice }: PropertyEmiSectionProps) {
    const normalizedTotalPrice = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0;
    const defaultDownPayment = Math.round(normalizedTotalPrice * 0.4);
    const [downPayment, setDownPayment] = useState(defaultDownPayment);
    const [rate, setRate] = useState(10);
    const [termYears, setTermYears] = useState(10);

    const clampedDownPayment = Math.min(Math.max(downPayment, 0), normalizedTotalPrice);
    const loanAmount = Math.max(normalizedTotalPrice - clampedDownPayment, 0);
    const downPaymentPercent = normalizedTotalPrice > 0 ? (clampedDownPayment / normalizedTotalPrice) * 100 : 0;

    const { monthlyEmi, totalInterest, totalPayment, chartData } = useMemo(() => {
        const months = Math.max(Math.round(termYears * 12), 1);
        const yearlyRate = Math.max(rate, 0);

        if (!loanAmount || yearlyRate === 0) {
            const payment = loanAmount;
            const emiNoInterest = payment / months;
            return {
                monthlyEmi: emiNoInterest,
                totalInterest: 0,
                totalPayment: payment,
                chartData: [
                    { name: 'Principal', value: loanAmount },
                    { name: 'Interest', value: 0 }
                ]
            };
        }

        const monthlyRate = yearlyRate / 12 / 100;
        const factor = Math.pow(1 + monthlyRate, months);
        const emi = (loanAmount * monthlyRate * factor) / (factor - 1);
        const total = emi * months;
        const interest = total - loanAmount;

        return {
            monthlyEmi: emi,
            totalInterest: interest,
            totalPayment: total,
            chartData: [
                { name: 'Principal', value: loanAmount },
                { name: 'Interest', value: interest }
            ]
        };
    }, [loanAmount, rate, termYears]);

    const formatCurrency = (value: number) => {
        return `Rs. ${formatAmountInLakhSystem(value)}`;
    };

    return (
        <section
            className="emi-section"
            style={{
                padding: '24px',
                border: '1px solid #e7d4d4',
                borderRadius: '16px',
                background: '#fff'
            }}
        >
            <div className="emi-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div>
                    <div className="emi-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={68} stroke="none">
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)'
                                }}
                            >
                                {rate}%
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(monthlyEmi)}</div>
                            <div style={{ color: '#8a3a3a', fontWeight: 600, marginTop: '4px' }}>Monthly EMI</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '18px', borderTop: '1px solid #f0dede', paddingTop: '14px', color: '#6e3a3a' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--color-primary)' }}>Loan Amount:</strong> {formatCurrency(loanAmount)}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--color-primary)' }}>Total Interest Payable:</strong> {formatCurrency(totalInterest)}
                        </div>
                        <div>
                            <strong style={{ color: 'var(--color-primary)' }}>Total Payment:</strong> {formatCurrency(totalPayment)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '14px', minWidth: 0 }}>
                    <label style={{ display: 'grid', gap: '8px', color: '#6e3a3a', fontWeight: 700 }}>
                        Total Price
                        <input
                            type="number"
                            value={normalizedTotalPrice}
                            disabled
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e7d4d4', background: '#fff7f7', color: '#7a4a4a' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: '8px', color: '#6e3a3a', fontWeight: 700 }}>
                        Down Payment ({downPaymentPercent.toFixed(2)}%)
                        <input
                            type="number"
                            min={0}
                            max={normalizedTotalPrice}
                            value={clampedDownPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e7d4d4' }}
                        />
                    </label>

                    <div className="emi-two-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'grid', gap: '8px', color: '#6e3a3a', fontWeight: 700 }}>
                            Interest Rate (% p.a.)
                            <input
                                type="number"
                                min={0}
                                step={0.1}
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e7d4d4' }}
                            />
                        </label>

                        <label style={{ display: 'grid', gap: '8px', color: '#6e3a3a', fontWeight: 700 }}>
                            Term (Years)
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={termYears}
                                onChange={(e) => setTermYears(Number(e.target.value))}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e7d4d4' }}
                            />
                        </label>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    .emi-section {
                        padding: 16px !important;
                    }
                    .emi-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .emi-summary-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .emi-two-field-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
