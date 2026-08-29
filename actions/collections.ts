'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

type CollectionCriteria = {
    types: string[];
    purposes: string[];
    natures: string[];
    district?: string;
    cityVillage?: string;
    area?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    isFeatured?: boolean;
    isExclusive?: boolean;
    isVerified?: boolean;
};

type CollectionCandidate = {
    id: number;
    price: unknown;
    features: {
        bedrooms: number | null;
        bathrooms: number | null;
    } | null;
};

function normalizeList(values: FormDataEntryValue[]) {
    return values
        .map((value) => String(value).trim().toLowerCase())
        .filter(Boolean);
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
    const normalized = String(value || '').trim();
    return normalized || undefined;
}

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
    const normalized = String(value || '').replace(/[^\d.]/g, '');
    if (!normalized) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBooleanFilter(value: FormDataEntryValue | null) {
    if (value !== 'on') return undefined;
    return true;
}

function getPropertyPriceValue(price: unknown) {
    if (!price || typeof price !== 'object') return null;

    const data = price as { price?: unknown; totalPrice?: unknown };
    const primary = Number(data.price);
    if (Number.isFinite(primary)) return primary;

    const total = Number(data.totalPrice);
    return Number.isFinite(total) ? total : null;
}

function matchesCriteria(property: CollectionCandidate, criteria: CollectionCriteria) {
    const price = getPropertyPriceValue(property.price);

    if (criteria.minPrice != null && (price == null || price < criteria.minPrice)) return false;
    if (criteria.maxPrice != null && (price == null || price > criteria.maxPrice)) return false;
    if (criteria.minBedrooms != null && (property.features?.bedrooms == null || property.features.bedrooms < criteria.minBedrooms)) return false;
    if (criteria.minBathrooms != null && (property.features?.bathrooms == null || property.features.bathrooms < criteria.minBathrooms)) return false;

    return true;
}

function buildCriteria(formData: FormData): CollectionCriteria {
    return {
        types: normalizeList(formData.getAll('criteria_types')),
        purposes: normalizeList(formData.getAll('criteria_purposes')),
        natures: normalizeList(formData.getAll('criteria_natures')),
        district: normalizeOptionalString(formData.get('criteria_district')),
        cityVillage: normalizeOptionalString(formData.get('criteria_city')),
        area: normalizeOptionalString(formData.get('criteria_area')),
        status: normalizeOptionalString(formData.get('criteria_status')),
        minPrice: normalizeOptionalNumber(formData.get('criteria_min_price')),
        maxPrice: normalizeOptionalNumber(formData.get('criteria_max_price')),
        minBedrooms: normalizeOptionalNumber(formData.get('criteria_min_bedrooms')),
        minBathrooms: normalizeOptionalNumber(formData.get('criteria_min_bathrooms')),
        isFeatured: parseBooleanFilter(formData.get('criteria_featured')),
        isExclusive: parseBooleanFilter(formData.get('criteria_exclusive')),
        isVerified: parseBooleanFilter(formData.get('criteria_verified')),
    };
}

export async function createCollection(formData: FormData) {
    const session = await getSession();
    if (!session?.id || session.type !== 'admin') {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('is_public') === 'on';
    const userId = parseInt(session.id);
    const creationMode = (formData.get('creation_mode') as string) || 'manual';
    const type = creationMode === 'criteria' ? 'system_generated' : 'user_generated';
    const viewMode = (formData.get('view_mode') as string) || 'classic';
    const criteria = buildCriteria(formData);
    const selectedPropertyIds = formData.getAll('property_ids')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);

    if (!name || isNaN(userId)) {
        throw new Error("Invalid Input");
    }

    const propertyIds = new Set<number>(selectedPropertyIds);

    if (creationMode === 'criteria') {
        const candidates = await prisma.property.findMany({
            where: {
                isPrivate: false,
                ...(criteria.status ? { status: criteria.status } : {}),
                ...(criteria.isFeatured != null ? { isFeatured: criteria.isFeatured } : {}),
                ...(criteria.isExclusive != null ? { isExclusive: criteria.isExclusive } : {}),
                ...(criteria.isVerified != null ? { isVerified: criteria.isVerified } : {}),
                ...(criteria.types.length ? { types: { some: { name: { in: criteria.types, mode: 'insensitive' } } } } : {}),
                ...(criteria.purposes.length ? { purposes: { some: { name: { in: criteria.purposes, mode: 'insensitive' } } } } : {}),
                ...(criteria.natures.length ? { natures: { some: { name: { in: criteria.natures, mode: 'insensitive' } } } } : {}),
                ...((criteria.district || criteria.cityVillage || criteria.area) ? {
                    location: {
                        is: {
                            ...(criteria.district ? { district: { contains: criteria.district, mode: 'insensitive' } } : {}),
                            ...(criteria.cityVillage ? { cityVillage: { contains: criteria.cityVillage, mode: 'insensitive' } } : {}),
                            ...(criteria.area ? { area: { contains: criteria.area, mode: 'insensitive' } } : {}),
                        }
                    }
                } : {})
            },
            include: {
                features: true
            }
        });

        candidates
            .filter((property: CollectionCandidate) => matchesCriteria(property, criteria))
            .forEach((property: CollectionCandidate) => propertyIds.add(property.id));
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const collection = await tx.collection.create({
            data: {
                name,
                description,
                is_public: isPublic,
                user_id: userId,
                type,
                view_mode: viewMode,
                moreInfo: type === 'system_generated' ? JSON.stringify(criteria) : null
            }
        });

        if (propertyIds.size > 0) {
            await tx.collectionProperty.createMany({
                data: Array.from(propertyIds).map((propertyId) => ({
                    collection_id: collection.id,
                    property_id: propertyId
                })),
                skipDuplicates: true
            });
        }
    });

    revalidatePath('/manage/collections');
    revalidatePath('/collection/[slug]', 'page');
    redirect('/manage/collections');
}

export async function deleteCollection(id: number) {
    await prisma.collection.delete({
        where: { id }
    });
    revalidatePath('/manage/collections');
}

export async function removePropertyFromCollection(collectionId: number, propertyId: number) {
    if (!collectionId || !propertyId) return;

    await prisma.collectionProperty.deleteMany({
        where: {
            collection_id: collectionId,
            property_id: propertyId
        }
    });

    revalidatePath('/manage/collections');
    revalidatePath(`/manage/collections/[slug]`, 'page');
}

export async function removePropertyFromCollectionWithSlug(collectionId: number, propertyId: number, slug: string) {
    if (!collectionId || !propertyId) return;

    await prisma.collectionProperty.deleteMany({
        where: {
            collection_id: collectionId,
            property_id: propertyId
        }
    });

    revalidatePath(`/manage/collections/${slug}`);
}
