import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getDefaultPropertyPriceRate } from '@/lib/pricing';

const ai = genkit({
    plugins: [googleAI()],
});

export const AI_AGENT_OCCUPIED_MESSAGE = "Sorry, let's connect after a few time. Our AI agent seem to be occupied as of now.";

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

function normalizeText(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function getMissingFields(draft: z.infer<typeof propertyChatDraftSchema>, defaultRate: string = 'total') {
    const missing: string[] = [];
    const location = draft.location || {};
    const price = draft.price || {};

    if (!normalizeText(location.district) || !normalizeText(location.cityVillage)) missing.push('district and city');
    if (!Array.isArray(draft.purposes) || draft.purposes.length === 0) missing.push('purpose');
    if (!Array.isArray(draft.types) || draft.types.length === 0) missing.push('property type');
    if (typeof price.price !== 'number' || Number.isNaN(price.price)) missing.push('primary price');

    const effectiveRate = price.rate || defaultRate;
    if (effectiveRate !== 'total' && !normalizeText(price.unit)) missing.push('pricing unit');

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

export async function runPropertyChatTurn(input: z.infer<typeof propertyChatInputSchema>) {
    const normalizedDraft = input.draft || {};
    const prompt = [
        'You are a Nepal property-listing assistant.',
        'If the conversation is empty, assistantMessage must be exactly: "Please share everything you have in mind about the property."',
        'Read the conversation and the existing draft carefully.',
        'Extract any listing data that the user has mentioned in natural language.',
        'You have server-provided account context for the logged-in user. Use it when the user refers to their name, username, previous properties, or requirements.',
        'If the user asks about their existing properties or requirements, answer briefly from userContext before continuing the listing flow.',
        'Only use userContext as reference. Do not copy an old property into the new draft unless the user clearly asks you to reuse specific details.',
        'Preserve any already-known draft values unless the user clearly corrected them.',
        'Never ask the user for a listing title or description. Generate title and remarks yourself from the available property details.',
        'Keep the chat simple. Ask one concise follow-up at a time except location, where you should ask for district and city together.',
        'Required flow after the broad first question: if location is missing, ask for district and city; then ask for sale/rent and property type if missing; then ask for price.',
        'Do not ask for province. Infer it only if obvious, otherwise leave it empty.',
        'Use pricing rules: house/apartment sale uses flat total price; land sale uses per-unit price; house/apartment rent uses per-month price; land rent uses per-unit-per-month price.',
        'If the pricing rate needs a unit, ask for the unit such as aana, ropani, sqft, or month. Do not ask for total unit count unless the user volunteers it.',
        'If required fields are missing, ask for the next missing item following the required flow.',
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
    });

    if (!output) {
        throw new Error('AI property listing assistant is unavailable');
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
    return 'Please share everything you have in mind about the property.';
}
