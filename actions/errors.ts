"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { createErrorLog } from "@/lib/error-logger";

type ErrorLogInput = {
    message: string;
    source?: string;
    page?: string | null;
    stack?: string | null;
    log?: unknown;
    userId?: number | null;
    occurredAt?: Date;
};

function isAdminUser(user: any) {
    return user?.type === "admin" || user?.role?.role?.toLowerCase().includes("admin");
}

export async function logError(input: ErrorLogInput) {
    return createErrorLog(input);
}

export async function deleteErrorLog(id: string) {
    const user = await getCurrentUser();
    if (!isAdminUser(user) || user?.operatingId) {
        throw new Error("Unauthorized");
    }

    await prisma.errorLog.delete({ where: { id } });
    revalidatePath("/manage/errors");
}
