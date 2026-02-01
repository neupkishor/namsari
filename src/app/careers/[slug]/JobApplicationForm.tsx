'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitJobApplication } from '@/app/manage/careers/actions';

export default function JobApplicationForm({ job, steps, currentStepIndex, session, slug }: any) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state stored in localStorage keyed by session
    const [answers, setAnswers] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`job_app_${session}`);
            return saved ? JSON.parse(saved) : {
                full_name: '',
                email: '',
                phone: '',
                moreinformation: {}
            };
        }
        return { full_name: '', email: '', phone: '', moreinformation: {} };
    });

    useEffect(() => {
        localStorage.setItem(`job_app_${session}`, JSON.stringify(answers));
    }, [answers, session]);

    const handleAnswerChange = (itemId: string, value: any) => {
        setAnswers((prev: any) => ({
            ...prev,
            moreinformation: {
                ...prev.moreinformation,
                [itemId]: value
            }
        }));
    };

    const handleBaseInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAnswers((prev: any) => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        router.push(`/careers/${slug}?step=${currentStepIndex + 1}&session=${session}`);
    };

    const prevStep = () => {
        router.push(`/careers/${slug}?step=${currentStepIndex - 1}&session=${session}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Transform moreinformation from { itemId: value } to [{ "field name": "users answer" }] format as requested
            // We'll mapping itemId to the content/question label
            const formattedMoreInfo: any[] = [];
            steps.forEach((step: any) => {
                step.items.forEach((item: any) => {
                    if (['mcq', 'short_answer', 'long_answer'].includes(item.type)) {
                        const answer = answers.moreinformation[item.id] || '';
                        formattedMoreInfo.push({
                            [item.content]: answer
                        });
                    }
                });
            });

            await submitJobApplication({
                jobId: job.id,
                full_name: answers.full_name,
                email: answers.email,
                phone: answers.phone,
                answers: JSON.stringify(formattedMoreInfo)
            });

            setIsSuccess(true);
            localStorage.removeItem(`job_app_${session}`);
        } catch (err) {
            console.error(err);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>✅</div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Application Submitted!</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '500px' }}>
                    Thank you for applying to <strong>{job.title}</strong>. Our team will review your application and get back to you soon.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="btn-corporate"
                    style={{ marginTop: '20px' }}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // Step 0 is reserved for basic info: Name, Email, Phone
    if (currentStepIndex === 0) {
        return (
            <div className="card" style={{ padding: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Let's start with the basics</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Full Name</label>
                        <input name="full_name" value={answers.full_name} onChange={handleBaseInfoChange} placeholder="John Doe" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Email Address</label>
                        <input type="email" name="email" value={answers.email} onChange={handleBaseInfoChange} placeholder="john@example.com" required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Phone Number</label>
                        <input type="tel" name="phone" value={answers.phone} onChange={handleBaseInfoChange} placeholder="+977 98..." required style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                    </div>

                    <button
                        onClick={nextStep}
                        disabled={!answers.full_name || !answers.email || !answers.phone}
                        className="btn-corporate"
                        style={{ marginTop: '12px', opacity: (!answers.full_name || !answers.email || !answers.phone) ? 0.6 : 1 }}
                    >
                        Continue to Application →
                    </button>
                </div>
            </div>
        );
    }

    const currentStep = steps[currentStepIndex - 1]; // because step 0 is basics
    if (!currentStep) return <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Step not found. Please go back or restart.</div>;

    const isLastStep = currentStepIndex === steps.length;

    return (
        <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-gold)', textTransform: 'uppercase' }}>
                        Step {currentStepIndex} of {steps.length}
                    </span>
                    <div style={{ height: '8px', width: '200px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(currentStepIndex / steps.length) * 100}%`, background: 'var(--color-gold)', transition: 'width 0.3s' }}></div>
                    </div>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>{currentStep.title}</h2>
                {currentStep.description && <p style={{ color: 'var(--color-text-muted)' }}>{currentStep.description}</p>}
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {currentStep.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {item.type === 'text_block' && (
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#334155' }}>{item.content}</p>
                        )}

                        {item.type === 'warning_block' && (
                            <div style={{ padding: '20px', background: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '8px', color: '#9a3412', fontSize: '0.95rem', fontWeight: '500' }}>
                                ⚠️ {item.content}
                            </div>
                        )}

                        {item.type === 'mcq' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontWeight: '700', fontSize: '1rem' }}>{item.content}</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {item.options.map((opt: string, idx: number) => (
                                        <label key={idx} style={{
                                            padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
                                            background: answers.moreinformation[item.id] === opt ? '#fffbeb' : 'white',
                                            borderColor: answers.moreinformation[item.id] === opt ? 'var(--color-gold)' : '#e2e8f0'
                                        }}>
                                            <input
                                                type="radio"
                                                name={item.id}
                                                value={opt}
                                                checked={answers.moreinformation[item.id] === opt}
                                                onChange={() => handleAnswerChange(item.id, opt)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                                            />
                                            <span style={{ fontWeight: '600' }}>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.type === 'short_answer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '1rem' }}>{item.content} {item.required && '*'}</label>
                                <input
                                    value={answers.moreinformation[item.id] || ''}
                                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                                    maxLength={item.maxLength}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                    placeholder="Type your answer..."
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                    {(answers.moreinformation[item.id] || '').length} / {item.maxLength}
                                </span>
                            </div>
                        )}

                        {item.type === 'long_answer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontWeight: '700', fontSize: '1rem' }}>{item.content} {item.required && '*'}</label>
                                <textarea
                                    value={answers.moreinformation[item.id] || ''}
                                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                                    maxLength={item.maxLength}
                                    rows={6}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                                    placeholder="Tell us more..."
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                                    {(answers.moreinformation[item.id] || '').length} / {item.maxLength}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <footer style={{ display: 'flex', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '32px', marginTop: '12px' }}>
                <button
                    onClick={prevStep}
                    style={{
                        flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white',
                        fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-muted)'
                    }}
                >
                    ← Back
                </button>
                {isLastStep ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-corporate"
                        style={{ flex: 2 }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Complete Application'}
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        className="btn-corporate"
                        style={{ flex: 2 }}
                    >
                        Next Step →
                    </button>
                )}
            </footer>
        </div>
    );
}
