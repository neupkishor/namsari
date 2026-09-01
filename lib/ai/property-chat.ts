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
    mode: z.enum(['create', 'edit']).optional(),
    editPropertyId: z.number().optional(),
    duplicatePropertyConfirmationId: z.number().optional(),
    duplicatePropertyDifferentiator: z.string().optional(),
    title: z.string().optional(),
    types: z.array(z.string()).optional(),
    purposes: z.array(z.string()).optional(),
    natures: z.array(z.string()).optional(),
    location: propertyLocationSchema.optional(),
    price: propertyPriceSchema.optional(),
    detailedPrice: z.array(propertyPriceSchema).optional(),
    remarks: z.string().optional(),
    status: z.string().optional(),
    soldStatus: z.string().optional(),
    roadType: z.string().optional(),
    roadSize: z.string().optional(),
    facingDirection: z.string().optional(),
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
    audio: z.object({
        dataUrl: z.string(),
        mimeType: z.string(),
        durationSeconds: z.number().max(60).optional(),
    }).optional(),
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
    readyToUpdate: z.boolean().optional(),
});

function normalizeText(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function getMissingFields(draft: z.infer<typeof propertyChatDraftSchema>, defaultRate: string = 'total') {
    const missing: string[] = [];
    const location = draft.location || {};
    const price = draft.price || {};

    if (draft.mode === 'edit') {
        if (typeof draft.editPropertyId !== 'number') missing.push('property to edit');
        return missing;
    }

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
        'You are a Nepal property assistant.',
        'If the conversation is empty, assistantMessage must be exactly: "Please share what you\'d like to do."',
        'Read the conversation and the existing draft carefully.',
        'First understand the user intent: looking for properties, editing an existing property, editing listing information, or listing a new property. Do just that, not more and not less.',
        'Extract any listing data that the user has mentioned in natural language.',
        'You have server-provided account context for the logged-in user. Use it when the user refers to their name, username, previous properties, or requirements.',
        'If the user asks about their existing properties or requirements, answer briefly from userContext before continuing the listing flow.',
        'Only use userContext as reference. Do not copy an old property into the new draft unless the user clearly asks you to reuse specific details.',
        'If the user asks to edit, update, change, revise, correct, mark, or modify an existing property, switch to edit mode by setting draft.mode to "edit".',
        'For edit mode, identify the target from userContext.properties by exact id if provided, otherwise by the clearest title/location match. Put that id in draft.editPropertyId.',
        'For edit mode, extract only the fields the user wants changed into draft. Do not ask for missing create-listing fields.',
        'Hidden chat edit context, do not proactively list this unless directly relevant: amenities, property title, property details, price, location, features, and adding images can be edited via chat.',
        'Hidden chat edit context, do not proactively list this unless directly relevant: property transfer/listed-by change, deleting the property, approval/publishing, and removing images are not possible via chat.',
        'Hidden chat edit context, do not proactively list this unless directly relevant: views, likes, comments, and shares cannot be edited at all.',
        'For edit mode status changes, use status values pending, rejected, warned only. Approval/publishing to approved is not possible via chat.',
        'If edit mode has a clear target property and at least one changed field, set readyToUpdate to true and readyToCreate to false.',
        'If edit mode does not have a clear target property, ask which property id or title to edit and keep readyToUpdate false.',
        'If a previous assistant message said the listing looks similar to an existing property and asked for confirmation, do not create it again unless the latest user clearly confirms they want a duplicate. When they clearly confirm, set draft.duplicatePropertyConfirmationId to the existing property id mentioned in that duplicate warning.',
        'If the user responds to a duplicate warning by giving new differentiating information instead of clearly confirming, merge that detail into the draft, set draft.duplicatePropertyDifferentiator to the user-provided distinction, and keep draft.duplicatePropertyConfirmationId unset.',
        'Duplicate differentiating information must come from the user. Do not invent draft.duplicatePropertyDifferentiator.',
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
        input.audio ? 'The user also attached a voice note. Transcribe it mentally, extract property details from it, and answer using the same structured output.' : '',
    ].join('\n');
    const promptContent = input.audio
        ? [
            { text: prompt },
            {
                media: {
                    url: input.audio.dataUrl,
                    contentType: input.audio.mimeType,
                },
            },
        ]
        : [{ text: prompt }];

    const { output } = await ai.generate({
        model: googleAI.model('gemini-3.1-flash-lite', { temperature: 0.2 }),
        messages: [{ role: 'user', content: promptContent }],
        output: { schema: propertyChatOutputSchema },
    });

    if (!output) {
        throw new Error('AI property listing assistant is unavailable');
    }

    const mergedDraft = mergeDrafts(normalizedDraft, output.draft || {});
    const effectiveDefaultRate = getDefaultPropertyPriceRate(mergedDraft.types || [], mergedDraft.purposes || []);
    const missingFields = getMissingFields(mergedDraft, effectiveDefaultRate);
    const readyToUpdate = mergedDraft.mode === 'edit' && missingFields.length === 0;
    const readyToCreate = mergedDraft.mode === 'edit' ? false : missingFields.length === 0;

    return {
        assistantMessage: readyToCreate
            ? output.assistantMessage
            : output.assistantMessage,
        draft: mergedDraft,
        missingFields,
        readyToCreate,
        readyToUpdate,
    };
}

export function getInitialPropertyChatPrompt() {
    return 'Please share what you\'d like to do.';
}
