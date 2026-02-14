'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBank(formData: FormData) {
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;
    const description = formData.get('description') as string;

    if (!name) throw new Error('Bank name is required');

    const bank = await prisma.bank.create({
        data: {
            name,
            icon,
            description
        }
    });

    revalidatePath('/manage/banks');
    redirect('/manage/banks');
}

export async function updateBank(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;
    const description = formData.get('description') as string;

    await prisma.bank.update({
        where: { id },
        data: {
            name,
            icon,
            description
        }
    });

    revalidatePath('/manage/banks');
    revalidatePath(`/manage/banks/${id}`);
}

export async function deleteBank(id: number) {
    await prisma.bank.delete({ where: { id } });
    revalidatePath('/manage/banks');
    redirect('/manage/banks');
}

export async function addBankRate(bankId: number, formData: FormData) {
    const interest = parseFloat(formData.get('interest') as string);
    const from = formData.get('interest_from') as string;
    const to = formData.get('interest_to') as string; // Optional

    if (isNaN(interest) || !from) throw new Error('Invalid rate data');

    await prisma.bankRate.create({
        data: {
            bank_id: bankId,
            interest: interest,
            interest_from: new Date(from),
            interest_to: to ? new Date(to) : null,
        }
    });

    revalidatePath('/manage/banks');
    revalidatePath(`/manage/banks/${bankId}`); // Relying on ID for path revalidation context, assuming slug page handles revalidation correctly if it uses slug
}
