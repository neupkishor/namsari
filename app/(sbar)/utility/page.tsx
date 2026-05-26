import Link from 'next/link';
import { MenuIcon } from '@/components/menu/MenuIcon';

const tools = [
    {
        name: 'Date Converter',
        description: 'Convert dates between AD and BS instantly.',
        href: '/utility/date-converter',
        icon: '/icons/calendar.svg'
    },
    {
        name: 'Unit Converter',
        description: 'Convert real estate land units (Ropani, Aana, etc.).',
        href: '/utility/unit-converter',
        icon: '/icons/convert-shapes.svg'
    },
    {
        name: 'EMI Calculator',
        description: 'Calculate monthly loan payments and view amortization.',
        href: '/utility/emi-calculator',
        icon: '/icons/sack-dollar.svg'
    }
];

export default function UtilityPage() {
    return (
        <div style={{ background: 'transparent' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Real Estate Tools</h1>
            <p style={{ marginBottom: '40px', maxWidth: '760px', color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                Essential utilities to help you make informed decisions in the Nepalese real estate market.
            </p>

            <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
                {tools.map((tool) => (
                    <Link href={tool.href} key={tool.name} className="no-underline">
                        <div
                            className="utility-tool-card card flex h-full cursor-pointer flex-col items-center p-8 text-center transition-transform duration-200"
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div className="mb-6 text-[3rem] leading-none">
                                <MenuIcon icon={tool.icon} label={tool.name} className="inline-block" />
                            </div>
                            <h3 className="mb-3 text-[1.5rem] font-bold text-[var(--color-primary)]">{tool.name}</h3>
                            <p className="text-[var(--color-text-muted)]">{tool.description}</p>
                            <div className="mt-6 text-[0.9rem] font-semibold text-[var(--color-gold)]">Open Tool →</div>
                        </div>
                    </Link>
                ))}
            </div>
            <style>{`
                .utility-tool-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
