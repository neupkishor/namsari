'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import type { PropertyPriceBasis } from '@prisma/client';

const PROPERTY_PRICE_BASES: PropertyPriceBasis[] = [
  'total', 'perUnit', 'perMonth', 'perYear', 'perUnitPerMonth', 'perUnitPerYear',
];

// Confirms the signed-in user owns the property being updated.
async function authorized(propertyId: number) {
  const session = await getSession();
  if (!session?.id) return false;
  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { listedById: true } });
  return property?.listedById === Number(session.id);
}

// Updates the property's single price record.
export async function updatePropertyPrice(propertyId: number, basis: string, amount: string, negotiable: boolean) {
  if (!(await authorized(propertyId))) throw new Error('Unauthorized');
  if (!PROPERTY_PRICE_BASES.includes(basis as PropertyPriceBasis)) throw new Error('Invalid price basis');
  const normalizedAmount = amount.trim() ? Number(amount.replace(/,/g, '')) : null;
  if (normalizedAmount != null && (!Number.isFinite(normalizedAmount) || normalizedAmount < 0)) throw new Error('Invalid price');
  await prisma.property.update({
    where: { id: propertyId },
    data: { price_basis: basis as PropertyPriceBasis, price_listed: normalizedAmount, price_negotiable: negotiable },
  });
  revalidatePath(`/manage/properties/${propertyId}`);
}
