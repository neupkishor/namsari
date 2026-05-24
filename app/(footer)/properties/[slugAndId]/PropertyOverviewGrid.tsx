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

const UNIT_SEQUENCE = ['sqft', 'sqm', 'aana', 'kattha', 'dhur', 'ropani'] as const;

const TO_SQFT: Record<string, number> = {
    sqft: 1,
    sqm: 10.7639,
    aana: 342.25,
    kattha: 3645,
    dhur: 182.25,
    ropani: 5476
};

function normalizeUnit(unit?: string | null) {
    const normalized = (unit || '').trim().toLowerCase();
    if (normalized === 'square feet' || normalized === 'sq feet' || normalized === 'ft2') return 'sqft';
    if (normalized === 'square meter' || normalized === 'square meters' || normalized === 'm2') return 'sqm';
    if (normalized === 'katha' || normalized === 'katha' || normalized === 'katta') return 'kattha';
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
    if (unit === 'sqft') return formatSqftSystem(value);
    if (unit === 'sqm') return formatSqmSystem(value);
    if (unit === 'aana') return formatAanaSystem(value);
    if (unit === 'kattha') return formatKatthaSystem(value);
    if (unit === 'ropani') return formatRopaniSystem(value);
    if (unit === 'dhur') return formatDhurSystem(value);
    const rounded = value >= 100 ? Math.round(value) : Math.round(value * 100) / 100;
    return `${rounded} ${unit}`;
}

function trimDecimal(value: number) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatSqftSystem(sqftValue: number) {
    const safe = Math.max(0, sqftValue);
    const wholeSqft = Math.floor(safe);
    let sqIn = Math.round((safe - wholeSqft) * 144); // 1 sq.ft = 144 sq.in
    let carrySqft = 0;
    if (sqIn >= 144) {
        carrySqft = Math.floor(sqIn / 144);
        sqIn = sqIn % 144;
    }
    const totalSqft = wholeSqft + carrySqft;
    if (sqIn === 0) return `${totalSqft} Sq.ft`;
    return `${totalSqft} Sq.ft ${sqIn} Sq.in`;
}

function formatSqmSystem(sqmValue: number) {
    const safe = Math.max(0, sqmValue);
    const wholeSqm = Math.floor(safe);
    const remSqft = (safe - wholeSqm) * TO_SQFT.sqm;
    if (remSqft <= 0.01) return `${wholeSqm} Sq.m`;
    return `${wholeSqm} Sq.m ${trimDecimal(remSqft)} Sq.ft`;
}

function formatAanaSystem(aanaValue: number) {
    const safe = Math.max(0, aanaValue);
    const wholeAana = Math.floor(safe);
    const paisaFloat = (safe - wholeAana) * 4; // 1 aana = 4 paisa
    const wholePaisa = Math.floor(paisaFloat);
    const daam = Math.round((paisaFloat - wholePaisa) * 4); // 1 paisa = 4 daam

    if (wholePaisa === 0 && daam === 0) return `${wholeAana} Aana`;
    if (daam === 0) return `${wholeAana} Aana ${wholePaisa} Paisa`;
    return `${wholeAana} Aana ${wholePaisa} Paisa ${daam} Daam`;
}

function formatRopaniSystem(ropaniValue: number) {
    const safe = Math.max(0, ropaniValue);
    const wholeRopani = Math.floor(safe);
    const aanaFloat = (safe - wholeRopani) * 16; // 1 ropani = 16 aana
    const wholeAana = Math.floor(aanaFloat);
    const paisaFloat = (aanaFloat - wholeAana) * 4; // 1 aana = 4 paisa
    const wholePaisa = Math.floor(paisaFloat);
    const daam = Math.round((paisaFloat - wholePaisa) * 4); // 1 paisa = 4 daam

    const parts: string[] = [];
    if (wholeRopani > 0) parts.push(`${wholeRopani} Ropani`);
    if (wholeAana > 0) parts.push(`${wholeAana} Aana`);
    if (wholePaisa > 0) parts.push(`${wholePaisa} Paisa`);
    if (daam > 0) parts.push(`${daam} Daam`);
    return parts.length ? parts.join(' ') : '0 Ropani';
}

function formatKatthaSystem(katthaValue: number) {
    const safe = Math.max(0, katthaValue);
    const wholeKattha = Math.floor(safe);
    const dhur = (safe - wholeKattha) * 20; // 1 kattha = 20 dhur

    if (dhur <= 0.01) return `${wholeKattha} Kattha`;
    if (wholeKattha === 0) return `${trimDecimal(dhur)} Dhur`;
    return `${wholeKattha} Kattha ${trimDecimal(dhur)} Dhur`;
}

function formatDhurSystem(dhurValue: number) {
    const safe = Math.max(0, dhurValue);
    const kattha = Math.floor(safe / 20); // 20 dhur = 1 kattha
    const remainingDhur = safe - kattha * 20;

    if (kattha === 0) return `${trimDecimal(remainingDhur)} Dhur`;
    if (remainingDhur <= 0.01) return `${kattha} Kattha`;
    return `${kattha} Kattha ${trimDecimal(remainingDhur)} Dhur`;
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
                            <span className="overview-icon-chip" aria-hidden="true">
                                <span
                                    aria-hidden="true"
                                    className="overview-icon"
                                    style={{ WebkitMaskImage: `url(${item.icon})`, maskImage: `url(${item.icon})` }}
                                />
                            </span>
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
