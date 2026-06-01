import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';

const ai = genkit({
    plugins: [googleAI()],
});

export const propertyPriceRateSchema = z.enum(['total', 'perUnit', 'perMonth', 'perUnitPerMonth']);

export const propertyChatMessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

export const propertyPriceSchema = z.object({
    price: z.number().optional(),
    rate: propertyPriceRateSchema.optional(),
    unit: z.string().optional(),
    totalUnit: z.number().optional(),
    totalPrice: z.number().optional(),
});

const propertyLocationSchema = z.object({
    country: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
    cityVillage: z.string().optional(),
    area: z.string().optional(),
    ward: z.string().optional(),
    landmark: z.string().optional(),
    distanceFrom: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

const propertyFeatureSchema = z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    kitchens: z.number().optional(),
    livingRooms: z.number().optional(),
    floorNumber: z.number().optional(),
    totalFloors: z.number().optional(),
    furnishing: z.string().optional(),
    builtUpArea: z.number().optional(),
    builtUpAreaUnit: z.string().optional(),
    parkingAvailable: z.boolean().optional(),
    elevator: z.boolean().optional(),
    security: z.boolean().optional(),
    waterSupply: z.boolean().optional(),
    electricity: z.boolean().optional(),
});

const propertyOpenHouseSchema = z.object({
    markOpenHouse: z.boolean().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

const propertyChatDraftSchema = z.object({
    title: z.string().optional(),
    types: z.array(z.string()).optional(),
    purposes: z.array(z.string()).optional(),
    natures: z.array(z.string()).optional(),
    location: propertyLocationSchema.optional(),
    price: propertyPriceSchema.optional(),
    detailedPrice: z.array(propertyPriceSchema).optional(),
    remarks: z.string().optional(),
    roadType: z.string().optional(),
    roadSize: z.string().optional(),
    facingDirection: z.string().optional(),
    isPrivate: z.boolean().optional(),
    openHouse: propertyOpenHouseSchema.optional(),
    features: propertyFeatureSchema.optional(),
    amenities: z.array(z.object({
        type: z.string(),
        name: z.string().optional(),
        distance: z.string().optional(),
    })).optional(),
    images: z.array(z.object({
        url: z.string(),
        imageOf: z.string(),
        filename: z.string(),
    })).optional(),
});

export const propertyChatInputSchema = z.object({
    messages: z.array(propertyChatMessageSchema),
    draft: propertyChatDraftSchema.optional(),
    defaultRate: propertyPriceRateSchema.optional(),
    userContext: z.object({
        user: z.object({
            id: z.number(),
            name: z.string().nullable().optional(),
            username: z.string().nullable().optional(),
            type: z.string().nullable().optional(),
        }),
        properties: z.array(z.object({
            id: z.number(),
            title: z.string().nullable().optional(),
            status: z.string().nullable().optional(),
            soldStatus: z.string().nullable().optional(),
            types: z.array(z.string()).optional(),
            purposes: z.array(z.string()).optional(),
            district: z.string().nullable().optional(),
            cityVillage: z.string().nullable().optional(),
            area: z.string().nullable().optional(),
            price: z.unknown().optional(),
        })).optional(),
        requirements: z.array(z.object({
            id: z.number(),
            content: z.string().nullable().optional(),
            propertyTypes: z.string().nullable().optional(),
            purposes: z.string().nullable().optional(),
            district: z.string().nullable().optional(),
            cityVillage: z.string().nullable().optional(),
            area: z.string().nullable().optional(),
            minPrice: z.number().nullable().optional(),
            maxPrice: z.number().nullable().optional(),
            pricingUnit: z.string().nullable().optional(),
            status: z.string().nullable().optional(),
        })).optional(),
    }).optional(),
});

export const propertyChatOutputSchema = z.object({
    assistantMessage: z.string(),
    draft: propertyChatDraftSchema,
    missingFields: z.array(z.string()),
    readyToCreate: z.boolean(),
});

const REQUIRED_FIELD_PRIORITY = [
    'location.district',
    'location.cityVillage',
    'location.province',
    'purposes',
    'types',
    'title',
    'price.price',
];

const PROVINCE_BY_DISTRICT: Record<string, string> = {
    kathmandu: 'Bagmati',
    lalitpur: 'Bagmati',
    bhaktapur: 'Bagmati',
    pokhara: 'Gandaki',
    kaski: 'Gandaki',
    chitwan: 'Bagmati',
    rupandehi: 'Lumbini',
    morang: 'Koshi',
    sunsari: 'Koshi',
    jhapa: 'Koshi',
};

const KNOWN_TYPES = ['house', 'bungalow', 'villa', 'multiplex', 'apartment', 'penthouse', 'land', 'commercial space'];
const KNOWN_PURPOSES = ['sale', 'rent'];

function normalizeText(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function getMissingFields(draft: z.infer<typeof propertyChatDraftSchema>, defaultRate: string = 'total') {
    const missing: string[] = [];
    const location = draft.location || {};
    const price = draft.price || {};

    if (!normalizeText(location.district)) missing.push('district');
    if (!normalizeText(location.cityVillage)) missing.push('city or municipality');
    if (!normalizeText(location.province)) missing.push('province');
    if (!Array.isArray(draft.purposes) || draft.purposes.length === 0) missing.push('purpose');
    if (!Array.isArray(draft.types) || draft.types.length === 0) missing.push('property type');
    if (!normalizeText(draft.title)) missing.push('title');
    if (typeof price.price !== 'number' || Number.isNaN(price.price)) missing.push('primary price');

    const effectiveRate = price.rate || defaultRate;
    if (effectiveRate !== 'total' && !normalizeText(price.unit)) missing.push('pricing unit');
    if ((effectiveRate === 'perUnit' || effectiveRate === 'perUnitPerMonth') && typeof price.totalUnit !== 'number') missing.push('total unit count');

    return missing;
}

function mergeDrafts(base: z.infer<typeof propertyChatDraftSchema>, updates: z.infer<typeof propertyChatDraftSchema>) {
    return {
        ...base,
        ...updates,
        location: {
            ...(base.location || {}),
            ...(updates.location || {}),
        },
        price: {
            ...(base.price || {}),
            ...(updates.price || {}),
        },
        detailedPrice: updates.detailedPrice?.length ? updates.detailedPrice : base.detailedPrice,
        amenities: updates.amenities?.length ? updates.amenities : base.amenities,
        images: updates.images?.length ? updates.images : base.images,
        features: {
            ...(base.features || {}),
            ...(updates.features || {}),
        },
        openHouse: {
            ...(base.openHouse || {}),
            ...(updates.openHouse || {}),
        },
    };
}

function normalizePriceText(text: string) {
    const normalized = text.toLowerCase().replace(/,/g, '');
    const crore = normalized.match(/(\d+(?:\.\d+)?)\s*(crore|cr)/);
    if (crore) return Number(crore[1]) * 10000000;

    const lakh = normalized.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs)/);
    if (lakh) return Number(lakh[1]) * 100000;

    const number = normalized.match(/(?:rs\.?|npr|price|rent|for)\s*(\d+(?:\.\d+)?)/);
    if (number) return Number(number[1]);

    const anyNumber = normalized.match(/\b(\d{5,})\b/);
    return anyNumber ? Number(anyNumber[1]) : undefined;
}

function inferFieldFromAssistant(question: string) {
    const normalized = question.toLowerCase();
    if (normalized.includes('district')) return 'district';
    if (normalized.includes('city') || normalized.includes('municipality')) return 'cityVillage';
    if (normalized.includes('province')) return 'province';
    if (normalized.includes('purpose')) return 'purpose';
    if (normalized.includes('type')) return 'type';
    if (normalized.includes('title')) return 'title';
    if (normalized.includes('unit')) return 'unit';
    if (normalized.includes('price') || normalized.includes('rent')) return 'price';
    return null;
}

function buildFallbackDraft(input: z.infer<typeof propertyChatInputSchema>) {
    const draft = input.draft || {};
    const messages = input.messages || [];
    const lastUser = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant')?.content || '';
    const expectedField = inferFieldFromAssistant(lastAssistant);
    const text = lastUser.trim();
    const normalized = text.toLowerCase();
    const updates: z.infer<typeof propertyChatDraftSchema> = {};

    if (text) {
        if (expectedField === 'district') updates.location = { district: text };
        if (expectedField === 'cityVillage') updates.location = { cityVillage: text };
        if (expectedField === 'province') updates.location = { province: text };
        if (expectedField === 'title') updates.title = text;
        if (expectedField === 'unit') updates.price = { unit: text };

        const type = KNOWN_TYPES.find((entry) => normalized.includes(entry));
        if (type || expectedField === 'type') updates.types = [type || normalized];

        const purpose = KNOWN_PURPOSES.find((entry) => normalized.includes(entry) || normalized.includes(`for ${entry}`));
        if (purpose || expectedField === 'purpose') updates.purposes = [purpose || (normalized.includes('lease') ? 'rent' : normalized)];

        const price = normalizePriceText(text);
        if (price || expectedField === 'price') {
            updates.price = {
                ...(updates.price || {}),
                price: price || Number(normalized.replace(/[^0-9.]/g, '')) || 0,
            };
        }

        const district = Object.keys(PROVINCE_BY_DISTRICT).find((entry) => normalized.includes(entry));
        if (district) {
            updates.location = {
                ...(updates.location || {}),
                district: district === 'pokhara' ? 'Kaski' : district.charAt(0).toUpperCase() + district.slice(1),
                province: PROVINCE_BY_DISTRICT[district],
            };
            if (district === 'pokhara') updates.location.cityVillage = 'Pokhara';
        }

        const areaMatch = text.match(/\b(?:in|at|near)\s+([A-Za-z][A-Za-z\s-]{2,})/);
        if (areaMatch && !updates.location?.area) {
            updates.location = {
                ...(updates.location || {}),
                area: areaMatch[1].trim(),
            };
        }
    }

    return mergeDrafts(draft, updates);
}

function questionForMissingField(field: string, defaultRate: string) {
    const questions: Record<string, string> = {
        district: 'What district is the property in?',
        'city or municipality': 'Which city or municipality is it in?',
        province: 'Which province is it in?',
        purpose: 'Is this property for sale or for rent?',
        'property type': 'What type of property is it, such as house, land, apartment, or commercial space?',
        title: 'What title should we use for this listing?',
        'primary price': 'What is the primary price or rent amount?',
        'pricing unit': `What pricing unit should we use for ${defaultRate}, for example aana, ropani, sqft, or month?`,
        'total unit count': 'How many total units should the price apply to?',
    };

    return questions[field] || `Please provide ${field}.`;
}

function buildContextAnswer(input: z.infer<typeof propertyChatInputSchema>) {
    const text = [...input.messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || '';
    const context = input.userContext;
    if (!context) return null;

    const asksName = text.includes('my name') || text.includes('who am i') || text.includes('username');
    const asksProperties = text.includes('my properties') || text.includes('properties do i have') || text.includes('how many properties') || text.includes('my listings') || text.includes('listed');
    const asksRequirements = text.includes('my requirements') || text.includes('requirements do i have') || text.includes('requirement');

    if (!asksName && !asksProperties && !asksRequirements) return null;

    const parts: string[] = [];
    const displayName = context.user.name || context.user.username || `user #${context.user.id}`;

    if (asksName) {
        parts.push(`You are logged in as ${displayName}${context.user.username ? ` (@${context.user.username})` : ''}.`);
    }

    if (asksProperties) {
        const properties = context.properties || [];
        const propertySummary = properties.length
            ? properties.slice(0, 3).map((property) => {
                const location = [property.cityVillage, property.district].filter(Boolean).join(', ');
                return `${property.title || `Property #${property.id}`}${location ? ` in ${location}` : ''}`;
            }).join('; ')
            : 'none found';
        parts.push(`I can see ${properties.length} recent propert${properties.length === 1 ? 'y' : 'ies'}: ${propertySummary}.`);
    }

    if (asksRequirements) {
        const requirements = context.requirements || [];
        const requirementSummary = requirements.length
            ? requirements.slice(0, 3).map((requirement) => {
                const label = requirement.content || requirement.propertyTypes || `Requirement #${requirement.id}`;
                const location = [requirement.cityVillage, requirement.district].filter(Boolean).join(', ');
                return `${label}${location ? ` in ${location}` : ''}`;
            }).join('; ')
            : 'none found';
        parts.push(`I can see ${requirements.length} recent requirement${requirements.length === 1 ? '' : 's'}: ${requirementSummary}.`);
    }

    return parts.join(' ');
}

function fallbackPropertyChatTurn(input: z.infer<typeof propertyChatInputSchema>) {
    const draft = buildFallbackDraft(input);
    const effectiveDefaultRate = getDefaultPropertyPriceRate(draft.types || [], draft.purposes || []);
    const missingFields = getMissingFields(draft, effectiveDefaultRate);
    const readyToCreate = missingFields.length === 0;
    const contextAnswer = buildContextAnswer(input);

    return {
        assistantMessage: contextAnswer || (readyToCreate
            ? 'I have all required details. Creating the property listing now.'
            : questionForMissingField(missingFields[0], effectiveDefaultRate)),
        draft,
        missingFields,
        readyToCreate,
    };
}

export async function runPropertyChatTurn(input: z.infer<typeof propertyChatInputSchema>) {
    const normalizedDraft = input.draft || {};
    const prompt = [
        'You are a Nepal property-listing assistant.',
        'Read the conversation and the existing draft carefully.',
        'Extract any listing data that the user has mentioned in natural language.',
        'You have server-provided account context for the logged-in user. Use it when the user refers to their name, username, previous properties, or requirements.',
        'If the user asks about their existing properties or requirements, answer briefly from userContext before continuing the listing flow.',
        'Only use userContext as reference. Do not copy an old property into the new draft unless the user clearly asks you to reuse specific details.',
        'Preserve any already-known draft values unless the user clearly corrected them.',
        'Prefer these required fields in order: district, city/municipality, province, purpose, property type, title, primary price, unit if needed, total unit if needed.',
        'If required fields are missing, ask only for the highest-priority missing item and keep the reply concise and natural.',
        'If all required fields are present, set readyToCreate to true and write a short confirmation in assistantMessage.',
        'Do not invent values. Keep the output strictly valid JSON that matches the schema.',
        '',
        `Default rate hint: ${input.defaultRate || 'total'}`,
        `Logged-in user context: ${JSON.stringify(input.userContext || null)}`,
        `Conversation: ${JSON.stringify(input.messages)}`,
        `Current draft: ${JSON.stringify(normalizedDraft)}`,
    ].join('\n');

    const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash', { temperature: 0.2 }),
        prompt,
        output: { schema: propertyChatOutputSchema },
    }).catch(() => ({ output: null }));

    if (!output) {
        return fallbackPropertyChatTurn(input);
    }

    const mergedDraft = mergeDrafts(normalizedDraft, output.draft || {});
    const effectiveDefaultRate = getDefaultPropertyPriceRate(mergedDraft.types || [], mergedDraft.purposes || []);
    const missingFields = getMissingFields(mergedDraft, effectiveDefaultRate);
    const readyToCreate = missingFields.length === 0;

    return {
        assistantMessage: readyToCreate
            ? output.assistantMessage
            : output.assistantMessage,
        draft: mergedDraft,
        missingFields,
        readyToCreate,
    };
}

export function getInitialPropertyChatPrompt() {
    return 'What district is the property in?';
}
