import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/actions/errors";

export async function POST(request: Request) {
    try {
        const session = await auth();
        const body = await request.json();

        await logError({
            message: body?.message || "Unknown client error",
            source: body?.source || "app",
            page: body?.page || request.headers.get("referer") || null,
            stack: body?.stack || null,
            log: {
                digest: body?.digest || null,
                cause: body?.cause || null,
                userAgent: request.headers.get("user-agent"),
                details: body?.log || null
            },
            userId: session?.user?.id ? Number(session.user.id) : null,
            occurredAt: body?.occurredAt ? new Date(body.occurredAt) : new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error while logging error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
