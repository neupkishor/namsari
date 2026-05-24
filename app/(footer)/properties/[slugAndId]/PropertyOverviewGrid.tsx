'use client';

import { useMemo, useState } from 'react';

type OverviewItem = {
    icon: string;
    value: string;
    label: string;
    displayValue: string;
};

type PropertyOverviewGridProps = {
    items: OverviewItem[];
    builtUpAreaValue?: number | null;
    builtUpAreaUnit?: string | null;
};

const UNIT_SEQUENCE = ['sqft', 'sqm', 'aana', 'dhur', 'ropani'] as const;

const TO_SQFT: Record<string, number> = {
    sqft: 1,
    sqm: 10.7639,
    aana: 342.25,
    dhur: 182.25,
    ropani: 5476
};

function normalizeUnit(unit?: string | null) {
    const normalized = (unit || '').trim().toLowerCase();
    if (normalized === 'square feet' || normalized === 'sq feet' || normalized === 'ft2') return 'sqft';
    if (normalized === 'square meter' || normalized === 'square meters' || normalized === 'm2') return 'sqm';
    return normalized;
}

function readCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const encoded = encodeURIComponent(name) + '=';
    const parts = document.cookie.split(';');
    for (const part of parts) {
        const token = part.trim();
        if (token.startsWith(encoded)) {
            return decodeURIComponent(token.slice(encoded.length));
        }
    }
    return null;
}

function writeCookie(name: string, value: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function formatArea(value: number, unit: string) {
    if (!Number.isFinite(value)) return '-';
    const rounded = value >= 100 ? Math.round(value) : Math.round(value * 100) / 100;
    return `${rounded} ${unit}`;
}

export default function PropertyOverviewGrid({
    items,
    builtUpAreaValue,
    builtUpAreaUnit
}: PropertyOverviewGridProps) {
    const sourceUnit = normalizeUnit(builtUpAreaUnit || 'sqft');
    const canConvertArea = Number.isFinite(builtUpAreaValue) && !!TO_SQFT[sourceUnit];

    const [prefUnit, setPrefUnit] = useState<string>(() => {
        const fromCookie = normalizeUnit(readCookie('prefUnit'));
        if (fromCookie && UNIT_SEQUENCE.includes(fromCookie as typeof UNIT_SEQUENCE[number])) {
            return fromCookie;
        }
        return sourceUnit;
    });
    const [prefLang, setPrefLang] = useState<'english' | 'romanized'>(() => {
        const fromCookie = (readCookie('prefLang') || '').trim().toLowerCase();
        return fromCookie === 'romanized' ? 'romanized' : 'english';
    });

    const areaDisplayValue = useMemo(() => {
        if (!canConvertArea || builtUpAreaValue == null) return null;
        const nextUnit = UNIT_SEQUENCE.includes(prefUnit as typeof UNIT_SEQUENCE[number]) ? prefUnit : sourceUnit;
        const sqftValue = builtUpAreaValue * TO_SQFT[sourceUnit];
        const converted = sqftValue / TO_SQFT[nextUnit];
        return formatArea(converted, nextUnit);
    }, [builtUpAreaValue, canConvertArea, prefUnit, sourceUnit]);

    const handleAreaCardClick = () => {
        if (!canConvertArea) return;
        const current = UNIT_SEQUENCE.includes(prefUnit as typeof UNIT_SEQUENCE[number]) ? prefUnit : sourceUnit;
        const currentIndex = UNIT_SEQUENCE.indexOf(current as typeof UNIT_SEQUENCE[number]);
        const next = UNIT_SEQUENCE[(currentIndex + 1) % UNIT_SEQUENCE.length];
        setPrefUnit(next);
        writeCookie('prefUnit', next);
    };

    const handleDirectionCardClick = () => {
        const nextLang: 'english' | 'romanized' = prefLang === 'english' ? 'romanized' : 'english';
        setPrefLang(nextLang);
        writeCookie('prefLang', nextLang);
    };

    return (
        <div className="overview-grid">
            {items.map((item) => {
                const isAreaCard = item.label.toLowerCase() === 'area';
                const isDirectionCard = item.label.toLowerCase() === 'facing' || item.label.toLowerCase() === 'direction';
                const display = isAreaCard && areaDisplayValue ? areaDisplayValue : item.displayValue;
                const directionDisplay = isDirectionCard ? convertDirectionLabel(item.displayValue, prefLang) : display;
                return (
                    <div
                        key={`${item.label}-${item.value}`}
                        className="overview-card"
                        onClick={isAreaCard ? handleAreaCardClick : isDirectionCard ? handleDirectionCardClick : undefined}
                        role={isAreaCard || isDirectionCard ? 'button' : undefined}
                        tabIndex={isAreaCard || isDirectionCard ? 0 : undefined}
                        onKeyDown={isAreaCard || isDirectionCard ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isAreaCard) handleAreaCardClick();
                                if (isDirectionCard) handleDirectionCardClick();
                            }
                        } : undefined}
                        title={isAreaCard ? 'Click to change area unit' : isDirectionCard ? 'Click to switch direction language' : undefined}
                        style={isAreaCard || isDirectionCard ? { cursor: 'pointer' } : undefined}
                    >
                        <div className="overview-content">
                            <span
                                aria-hidden="true"
                                className="overview-icon"
                                style={{ WebkitMaskImage: `url(${item.icon})`, maskImage: `url(${item.icon})` }}
                            />
                            <div className="overview-value">{directionDisplay}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function convertDirectionLabel(value: string, lang: 'english' | 'romanized') {
    const raw = (value || '').trim();
    if (!raw || raw === '-') return '-';

    const table: Array<{ english: string; romanized: string }> = [
        { english: 'east', romanized: 'purba' },
        { english: 'west', romanized: 'paschim' },
        { english: 'north', romanized: 'uttar' },
        { english: 'south', romanized: 'dakshin' },
        { english: 'north east', romanized: 'uttar purba' },
        { english: 'north west', romanized: 'uttar paschim' },
        { english: 'south east', romanized: 'dakshin purba' },
        { english: 'south west', romanized: 'dakshin paschim' }
    ];

    const normalized = raw
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const pair = table.find((d) => d.english === normalized || d.romanized === normalized);
    if (!pair) return raw;

    const target = lang === 'romanized' ? pair.romanized : pair.english;
    return target
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
