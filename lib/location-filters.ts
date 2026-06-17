export function normalizeLocationFilterText(value: unknown) {
    return String(value || '').trim().toLowerCase();
}

export function splitLocationFilterValues(value: string | null | undefined): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

export function matchesLocationFilter(parts: Array<string | null | undefined>, filter: string) {
    const normalizedFilter = normalizeLocationFilterText(filter);
    if (!normalizedFilter) return false;

    const filterParts = normalizedFilter
        .split('>')
        .map((item) => item.trim())
        .filter(Boolean);

    const normalizedParts = parts
        .filter(Boolean)
        .map((item) => normalizeLocationFilterText(item));

    if (filterParts.length === 0) return false;

    return filterParts.every((filterPart) =>
        normalizedParts.some((part) => part.includes(filterPart) || filterPart.includes(part))
    );
}

export function matchesAnyLocationFilter(parts: Array<string | null | undefined>, filters: string[]) {
    if (filters.length === 0) return true;
    return filters.some((filter) => matchesLocationFilter(parts, filter));
}
