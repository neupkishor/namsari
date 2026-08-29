import prisma from '@/lib/prisma';
import { authenticatedUserId, jsonError, parseUserId } from '../../user/_lib';

export const runtime = 'nodejs';

const interactions = ['like', 'enquiry:whatsapp', 'enquiry:phone'] as const;
type Interaction = (typeof interactions)[number];

async function readInteraction(request: Request): Promise<string | null> {
    const contentType = request.headers.get('content-type')?.toLowerCase() || '';

    try {
        if (contentType.includes('application/json')) {
            const body: unknown = await request.json();
            if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
            const interaction = (body as Record<string, unknown>).interaction;
            return typeof interaction === 'string' ? interaction.trim().toLowerCase() : null;
        }

        const formData = await request.formData() as unknown as {
            get(name: string): FormDataEntryValue | null;
        };
        const interaction = formData.get('interaction');
        return typeof interaction === 'string' ? interaction.trim().toLowerCase() : null;
    } catch {
        return null;
    }
}

function isInteraction(value: string | null): value is Interaction {
    return value !== null && interactions.some((interaction) => interaction === value);
}

function requestMetadata(request: Request) {
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');

    return {
        ip_address: forwardedFor?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || undefined,
        user_agent: userAgent,
        device_type: userAgent
            ? (/tablet|ipad/i.test(userAgent)
                ? 'tablet'
                : /mobile|iphone|android/i.test(userAgent) ? 'mobile' : 'desktop')
            : undefined,
    };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await context.params;
    const propertyId = parseUserId(rawId);
    if (!propertyId) return jsonError('Invalid property ID', 400);

    const interaction = await readInteraction(request);
    if (!isInteraction(interaction)) {
        return jsonError(`interaction must be one of: ${interactions.join(', ')}`, 400);
    }

    const accountId = authenticatedUserId(request);
    if (interaction === 'like' && !accountId) {
        return jsonError('Authentication required', 401);
    }

    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { id: true },
        });
        if (!property) return jsonError('Property not found', 404);

        const metadata = requestMetadata(request);
        const tempAccountId = request.headers.get('x-session-id')?.trim()
            || (accountId ? `user_${accountId}` : 'anonymous');

        if (interaction === 'like') {
            const result = await prisma.$transaction(async (tx) => {
                const existing = await tx.like.findUnique({
                    where: {
                        property_id_user_id: {
                            property_id: propertyId,
                            user_id: accountId!,
                        },
                    },
                    select: { id: true },
                });

                const liked = !existing;
                if (existing) {
                    await tx.like.delete({ where: { id: existing.id } });
                } else {
                    await tx.like.create({
                        data: { property_id: propertyId, user_id: accountId! },
                    });
                }

                await tx.activityLog.create({
                    data: {
                        temp_account_id: tempAccountId,
                        account_id: accountId,
                        activity_type: liked ? 'like_property' : 'unlike_property',
                        description: `${liked ? 'Liked' : 'Unliked'} property #${propertyId}`,
                        ...metadata,
                    },
                });

                const likesCount = await tx.like.count({ where: { property_id: propertyId } });
                return { liked, likesCount };
            });

            return Response.json({
                success: true,
                property_id: propertyId,
                interaction,
                liked: result.liked,
                likes_count: result.likesCount,
            });
        }

        const channel = interaction === 'enquiry:whatsapp' ? 'whatsapp' : 'phone';
        await prisma.activityLog.create({
            data: {
                temp_account_id: tempAccountId,
                account_id: accountId,
                activity_type: `enquiry_${channel}`,
                description: `Enquired about property #${propertyId} via ${channel}`,
                ...metadata,
            },
        });

        return Response.json({
            success: true,
            property_id: propertyId,
            interaction,
            recorded: true,
        });
    } catch (error) {
        console.error('Property interaction API failed:', error);
        return jsonError('Unable to process property interaction', 500);
    }
}
