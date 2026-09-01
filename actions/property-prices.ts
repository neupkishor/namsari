'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

const PROPERTY_PRICE_BASES = [
  'flatPrice', 'flatPricePerMonth', 'flatPricePerQuarter', 'flatPricePerSemiAnnually', 'flatPricePerAnnually',
  'pricePerUnit', 'pricePerUnitPerMonth', 'pricePerUnitPerQuarter', 'pricePerUnitPerSemiAnnually', 'pricePerUnitPerAnnually',
] as const;
type PropertyPriceBase = typeof PROPERTY_PRICE_BASES[number];

async function authorized(propertyId: number) {
  const session = await getSession();
  if (!session?.id) return false;
  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { listedById: true } });
  return property?.listedById === Number(session.id);
}

export async function addPropertyPrice(propertyId: number, base: string, display: string, negotiable: boolean) {
  if (!(await authorized(propertyId))) throw new Error('Unauthorized');
  if (!PROPERTY_PRICE_BASES.includes(base as PropertyPriceBase)) throw new Error('Invalid price base');
  await prisma.propertyPrice.create({ data: { propertyId, base, display, negotiable, isDefault: false } });
  revalidatePath(`/manage/properties/${propertyId}`);
}

export async function setDefaultPropertyPrice(propertyId: number, priceId: number) {
  if (!(await authorized(propertyId))) throw new Error('Unauthorized');
  await prisma.$transaction([
    prisma.propertyPrice.updateMany({ where: { propertyId }, data: { isDefault: false } }),
    prisma.propertyPrice.update({ where: { id: priceId }, data: { isDefault: true } }),
  ]);
  revalidatePath(`/manage/properties/${propertyId}`);
}
