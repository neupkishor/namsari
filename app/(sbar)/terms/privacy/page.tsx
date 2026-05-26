import React from 'react';

export default function PrivacyPage() {
    return (
        <main style={{ backgroundColor: '#ffffff', minHeight: '100%', paddingBottom: '80px' }}>
            <div className="mx-auto w-full max-w-[800px] px-0.5 pt-3 sm:px-6 lg:px-8">
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', color: 'var(--color-primary)' }}>
                    Privacy Policy
                </h1>
                <p style={{ color: '#64748b', marginBottom: '40px' }}>Last Updated: February 1, 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>1. Information Collection</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            We collect information that you provide directly to us, such as when you create an account, list a property, or contact an agent. This may include your name, email address, phone number, and property details.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>2. Use of Information</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            The information we collect is used to provide, maintain, and improve our services, to facilitate communication between buyers and sellers, and to send you updates about relevant property listings.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>3. Data Sharing</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            We do not sell your personal data. We only share information with third parties (like real estate agencies) when you explicitly request a contact or offer through our platform.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>4. Security</h2>
                        <p style={{ lineHeight: '1.7', color: '#475569' }}>
                            We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
