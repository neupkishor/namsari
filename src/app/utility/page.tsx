import Link from 'next/link';

const tools = [
    {
        name: 'Date Converter',
        description: 'Convert dates between AD and BS instantly.',
        href: '/utility/date-converter',
        icon: '📅'
    },
    {
        name: 'Unit Converter',
        description: 'Convert real estate land units (Ropani, Aana, etc.).',
        href: '/utility/unit-converter',
        icon: '📏'
    },
    {
        name: 'EMI Calculator',
        description: 'Calculate monthly loan payments and view amortization.',
        href: '/utility/emi-calculator',
        icon: '💰'
    }
];

export default function UtilityPage() {
    return (
        <div>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>Real Estate Tools</h1>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
                Essential utilities to help you make informed decisions in the Nepalese real estate market.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {tools.map((tool) => (
                    <Link href={tool.href} key={tool.name} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '24px' }}>{tool.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: 'var(--color-primary)' }}>{tool.name}</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>{tool.description}</p>
                            <div style={{ marginTop: '24px', color: 'var(--color-gold)', fontWeight: '600', fontSize: '0.9rem' }}>Open Tool →</div>
                        </div>
                    </Link>
                ))}
            </div>
            <style>{`
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
