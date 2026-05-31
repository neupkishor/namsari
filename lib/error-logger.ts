import prisma from "@/lib/prisma";

type ErrorLogInput = {
    message: string;
    source?: string;
    page?: string | null;
    stack?: string | null;
    log?: unknown;
    userId?: number | null;
    occurredAt?: Date;
};

export async function createErrorLog(input: ErrorLogInput) {
    const message = String(input.message || "Unknown error").slice(0, 8000);

    return prisma.errorLog.create({
        data: {
            message,
            source: String(input.source || "app").slice(0, 120),
            page: input.page ? String(input.page).slice(0, 2048) : null,
            stack: input.stack ? String(input.stack).slice(0, 20000) : null,
            log: input.log === undefined ? undefined : (input.log as any),
            userId: input.userId || null,
            occurred_at: input.occurredAt || new Date()
        }
    });
}
