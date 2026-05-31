export type AgencyConfigDefUnit = {
    field: string;
    unit: string;
};

export type AgencyConfigSnapshot = {
    compulsoryFields: string[];
    defUnits: AgencyConfigDefUnit[];
    reviewRequired: boolean;
    defaultLocation: Record<string, string>;
    minPhotoCount: number | null;
    canAgentChangeInfo: boolean;
    canAgentDelete: boolean;
};

function toTrimmedString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function toBoolean(value: unknown) {
    return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

function parseList(value: unknown): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.map(item => toTrimmedString(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map(item => toTrimmedString(item)).filter(Boolean);
            }
        } catch {
            // Fall back to line/comma separated parsing.
        }

        return trimmed
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}

function parseLocation(value: unknown): Record<string, string> {
    if (!value) return {};

    if (typeof value === 'object' && !Array.isArray(value)) {
        const entries = Object.entries(value as Record<string, unknown>);
        return entries.reduce<Record<string, string>>((acc, [key, item]) => {
            const stringValue = toTrimmedString(item);
            if (stringValue) acc[key] = stringValue;
            return acc;
        }, {});
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return {};

        try {
            const parsed = JSON.parse(trimmed);
            return parseLocation(parsed);
        } catch {
            return {};
        }
    }

    return {};
}

function parseDefUnits(value: unknown): AgencyConfigDefUnit[] {
    if (!value) return [];

    const normalizeEntry = (entry: any): AgencyConfigDefUnit | null => {
        if (!entry || typeof entry !== 'object') return null;
        const field = toTrimmedString(entry.field ?? entry.name ?? entry.key);
        const unit = toTrimmedString(entry.unit ?? entry.value);
        if (!field || !unit) return null;
        return { field, unit };
    };

    if (Array.isArray(value)) {
        return value.map(normalizeEntry).filter(Boolean) as AgencyConfigDefUnit[];
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map(normalizeEntry).filter(Boolean) as AgencyConfigDefUnit[];
            }
        } catch {
            // Fall back to simple line parsing like roadSize: feet
        }

        return trimmed
            .split(/[,\n]/)
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => {
                const [field, unit] = item.split(':').map(part => part.trim());
                if (!field || !unit) return null;
                return { field, unit };
            })
            .filter(Boolean) as AgencyConfigDefUnit[];
    }

    return [];
}

export function normalizeAgencyConfig(config: any): AgencyConfigSnapshot | null {
    if (!config) return null;

    const compulsoryFields = parseList(config.compulsoryFields ?? config.compulsory_fields);
    const defUnits = parseDefUnits(config.defUnits ?? config.def_units);
    const defaultLocation = parseLocation(config.defaultLocation ?? config.default_location);
    const rawMinPhotoCount = config.minPhotoCount ?? config.min_photo_count;
    const minPhotoCount = rawMinPhotoCount === null || rawMinPhotoCount === undefined || rawMinPhotoCount === ''
        ? null
        : Number(rawMinPhotoCount);

    return {
        compulsoryFields,
        defUnits,
        reviewRequired: toBoolean(config.reviewRequired ?? config.review_required),
        defaultLocation,
        minPhotoCount: Number.isFinite(minPhotoCount as number) ? Number(minPhotoCount) : null,
        canAgentChangeInfo: toBoolean(config.canAgentChangeInfo ?? config.can_agent_change_info),
        canAgentDelete: toBoolean(config.canAgentDelete ?? config.can_agent_delete),
    };
}

export function resolveActiveAgencyId(user: any, operatingId?: number | null) {
    return operatingId ?? (user?.type === 'agency' ? user.id : user?.agency_id ?? null);
}

export function getConfiguredDefaultUnit(config: any, field: string) {
    const snapshot = normalizeAgencyConfig(config);
    if (!snapshot) return '';
    return snapshot.defUnits.find(item => item.field === field)?.unit || '';
}

export function mergeDraftDefaults(draft: Record<string, any>, config: any) {
    const snapshot = normalizeAgencyConfig(config);
    if (!snapshot) return draft;

    return {
        ...draft,
        province: draft.province || snapshot.defaultLocation.province || '',
        district: draft.district || snapshot.defaultLocation.district || '',
        cityVillage: draft.cityVillage || snapshot.defaultLocation.cityVillage || '',
        area: draft.area || snapshot.defaultLocation.area || '',
        ward: draft.ward || snapshot.defaultLocation.ward || '',
        landmark: draft.landmark || snapshot.defaultLocation.landmark || '',
        builtUpAreaUnit: draft.builtUpAreaUnit || getConfiguredDefaultUnit(snapshot, 'builtUpArea') || 'sqft',
    };
}

export function formatRoadSizeValue(value: string, config: any) {
    const snapshot = normalizeAgencyConfig(config);
    const unit = snapshot ? snapshot.defUnits.find(item => item.field === 'roadSize')?.unit : '';
    const trimmed = toTrimmedString(value);
    if (!trimmed || !unit) return trimmed;

    const numericValue = Number(trimmed.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(numericValue)) return trimmed;

    if (new RegExp(`\\b${unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(trimmed)) {
        return trimmed;
    }

    return `${trimmed} ${unit}`.trim();
}

export function isEmptyConfigValue(value: unknown) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length === 0;
    return false;
}
