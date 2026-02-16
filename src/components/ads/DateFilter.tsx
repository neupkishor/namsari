'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function DateFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDays = searchParams.get('days') || '30';

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const params = new URLSearchParams(searchParams);
        params.set('days', e.target.value);
        router.push(`?${params.toString()}`);
    }

    return (
        <select 
            value={currentDays} 
            onChange={handleChange}
            className="form-control"
            style={{ width: 'auto', display: 'inline-block' }}
        >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
        </select>
    );
}
