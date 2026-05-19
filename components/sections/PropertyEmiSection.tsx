'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type PropertyEmiSectionProps = {
    totalPrice: number;
};

const CHART_COLORS = ['#3b82f6', '#c7d2fe'];

export function PropertyEmiSection({ totalPrice }: PropertyEmiSectionProps) {
    const normalizedTotalPrice = Number.isFinite(totalPrice) && totalPrice > 0 ? totalPrice : 0;
    const defaultDownPayment = Math.round(normalizedTotalPrice * 0.2);
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

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        })
            .format(value || 0)
            .replace('NPR', 'Rs.');

    return (
        <section
            className="emi-section"
            style={{
                padding: '24px',
                border: '1px solid #e5e7eb',
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
                                    <Tooltip formatter={(value: number | string) => formatCurrency(Number(value))} />
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
                                    color: '#475569'
                                }}
                            >
                                {rate}%
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1f2937' }}>{formatCurrency(monthlyEmi)}</div>
                            <div style={{ color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Monthly EMI</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '18px', borderTop: '1px solid #e5e7eb', paddingTop: '14px', color: '#475569' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#1f2937' }}>{formatCurrency(loanAmount)}</strong> Loan Amount
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#1f2937' }}>{formatCurrency(totalInterest)}</strong> Total Interest Payable
                        </div>
                        <div>
                            <strong style={{ color: '#1f2937' }}>{formatCurrency(totalPayment)}</strong> Total Payment
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '14px', minWidth: 0 }}>
                    <label style={{ display: 'grid', gap: '8px', color: '#475569', fontWeight: 700 }}>
                        Total Price
                        <input
                            type="number"
                            value={normalizedTotalPrice}
                            disabled
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b' }}
                        />
                    </label>

                    <label style={{ display: 'grid', gap: '8px', color: '#475569', fontWeight: 700 }}>
                        Down Payment ({downPaymentPercent.toFixed(2)}%)
                        <input
                            type="number"
                            min={0}
                            max={normalizedTotalPrice}
                            value={clampedDownPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        />
                    </label>

                    <div className="emi-two-field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={{ display: 'grid', gap: '8px', color: '#475569', fontWeight: 700 }}>
                            Interest Rate (% p.a.)
                            <input
                                type="number"
                                min={0}
                                step={0.1}
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            />
                        </label>

                        <label style={{ display: 'grid', gap: '8px', color: '#475569', fontWeight: 700 }}>
                            Term (Years)
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={termYears}
                                onChange={(e) => setTermYears(Number(e.target.value))}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
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
