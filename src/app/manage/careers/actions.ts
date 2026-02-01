'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-p ]/g, '')
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

export async function getJobListings() {
    if (!(prisma as any).jobListing) {
        throw new Error("JobListing model not found in Prisma client. Please restart your developer server (npm run dev) to refresh the schema.");
    }
    return await (prisma as any).jobListing.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            _count: {
                select: { applications: true }
            }
        }
    });
}

export async function getJobListing(id: number) {
    return await (prisma as any).jobListing.findUnique({
        where: { id },
        include: {
            applications: {
                orderBy: { created_at: 'desc' }
            }
        }
    });
}

export async function getJobListingBySlug(slug: string) {
    return await (prisma as any).jobListing.findUnique({
        where: { slug },
    });
}

export async function createJobListing(data: any) {
    const job = await (prisma as any).jobListing.create({
        data: {
            title: data.title,
            slug: generateSlug(data.title),
            department: data.department,
            location: data.location,
            type: data.type,
            salary_range: data.salary_range,
            description: data.description,
            requirements: data.requirements,
            application_steps: data.application_steps || '[]',
            status: data.status || 'open'
        }
    });
    revalidatePath('/manage/careers');
    return job;
}

export async function updateJobListing(id: number, data: any) {
    const job = await (prisma as any).jobListing.update({
        where: { id },
        data: {
            title: data.title,
            department: data.department,
            location: data.location,
            type: data.type,
            salary_range: data.salary_range,
            description: data.description,
            requirements: data.requirements,
            application_steps: data.application_steps,
            status: data.status
        }
    });
    revalidatePath('/manage/careers');
    revalidatePath(`/manage/careers/${id}`);
    return job;
}

export async function deleteJobListing(id: number) {
    await (prisma as any).jobApplication.deleteMany({
        where: { jobId: id }
    });
    await (prisma as any).jobListing.delete({
        where: { id }
    });
    revalidatePath('/manage/careers');
}

export async function updateApplicationStatus(id: number, status: string) {
    const application = await (prisma as any).jobApplication.update({
        where: { id },
        data: { status }
    });
    const job = await (prisma as any).jobListing.findUnique({
        where: { id: application.jobId }
    });
    revalidatePath(`/manage/careers/${job?.id}`);
    return application;
}

export async function submitJobApplication(data: {
    jobId: number;
    full_name: string;
    email: string;
    phone: string;
    resume_url?: string;
    cover_letter?: string;
    answers: string; // JSON string
}) {
    const application = await (prisma as any).jobApplication.create({
        data: {
            jobId: data.jobId,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            resume_url: data.resume_url,
            cover_letter: data.cover_letter,
            answers: data.answers,
        }
    });
    revalidatePath(`/manage/careers/${data.jobId}`);
    return application;
}
