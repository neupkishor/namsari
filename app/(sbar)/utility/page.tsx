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
        <div>
            <h1 className="section-title text-center mb-4">Real Estate Tools</h1>
            <p className="mx-auto mb-16 max-w-[600px] text-center text-[var(--color-text-muted)]">
                Essential utilities to help you make informed decisions in the Nepalese real estate market.
            </p>

            <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                {tools.map((tool) => (
                    <Link href={tool.href} key={tool.name} className="no-underline">
                        <div className="card flex h-full cursor-pointer flex-col items-center p-8 text-center transition-transform duration-200">
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
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
