'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
    resolveActiveAgencyId,
} from '@/lib/agency-config';

export async function getAgencyConfigByAgencyId(agencyId: number) {
    return prisma.agencyConfig.findUnique({
        where: { agencyId },
    });
}

export async function getCurrentAgencyConfig() {
    const session = await getSession();
    if (!session?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: Number(session.id) },
        include: { role: true },
    });

    if (!user) return null;

    const agencyId = resolveActiveAgencyId(user, session.operatingId);
    if (!agencyId) return null;

    return prisma.agencyConfig.findUnique({
        where: { agencyId },
    });
}

export async function saveAgencyConfig(formData: FormData) {
    const session = await getSession();
    if (!session?.id) {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(session.id) },
        include: { role: true },
    });

    if (!user) {
        throw new Error('Unauthorized');
    }

    const agencyId = resolveActiveAgencyId(user, session.operatingId);
    const roleName = user.role?.role?.toLowerCase() || '';
    const isAgency = user.type === 'agency' || Boolean(session.operatingId);
    const isAdmin = user.type === 'admin' || roleName.includes('admin');

    if (!agencyId || (!isAgency && !isAdmin)) {
        throw new Error('Unauthorized');
    }

    const compulsoryFields = formData
        .get('compulsory_fields')
        ?.toString()
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(Boolean) || [];

    const defUnitsRaw = formData.get('def_units')?.toString().trim() || '';
    let defUnits: any[] = [];
    if (defUnitsRaw) {
        try {
            const parsed = JSON.parse(defUnitsRaw);
            defUnits = Array.isArray(parsed) ? parsed : [];
        } catch {
            defUnits = [];
        }
    }

    const defaultLocation = {
        province: formData.get('default_location_province')?.toString().trim() || '',
        district: formData.get('default_location_district')?.toString().trim() || '',
        cityVillage: formData.get('default_location_cityVillage')?.toString().trim() || '',
        area: formData.get('default_location_area')?.toString().trim() || '',
        ward: formData.get('default_location_ward')?.toString().trim() || '',
        landmark: formData.get('default_location_landmark')?.toString().trim() || '',
    };
    const hasDefaultLocation = Object.values(defaultLocation).some(Boolean);

    const payload = {
        compulsoryFields: compulsoryFields.length > 0 ? compulsoryFields : Prisma.DbNull,
        defUnits: defUnits.length > 0 ? defUnits : Prisma.DbNull,
        reviewRequired: formData.get('review_required') === 'on' ? true : null,
        defaultLocation: hasDefaultLocation ? defaultLocation : Prisma.DbNull,
        minPhotoCount: formData.get('min_photo_count')?.toString().trim()
            ? Number(formData.get('min_photo_count'))
            : null,
        canAgentChangeInfo: formData.get('can_agent_change_info') === 'on' ? true : null,
        canAgentDelete: formData.get('can_agent_delete') === 'on' ? true : null,
    };

    await prisma.agencyConfig.upsert({
        where: { agencyId },
        update: {
            compulsoryFields: payload.compulsoryFields,
            defUnits: payload.defUnits,
            reviewRequired: payload.reviewRequired,
            defaultLocation: payload.defaultLocation,
            minPhotoCount: payload.minPhotoCount,
            canAgentChangeInfo: payload.canAgentChangeInfo,
            canAgentDelete: payload.canAgentDelete,
        },
        create: {
            agencyId,
            compulsoryFields: payload.compulsoryFields,
            defUnits: payload.defUnits,
            reviewRequired: payload.reviewRequired,
            defaultLocation: payload.defaultLocation,
            minPhotoCount: payload.minPhotoCount,
            canAgentChangeInfo: payload.canAgentChangeInfo,
            canAgentDelete: payload.canAgentDelete,
        },
    });

    revalidatePath('/manage/config');
    revalidatePath('/manage');
    revalidatePath('/sell');

}
