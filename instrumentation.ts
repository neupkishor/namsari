import { createErrorLog } from "@/lib/error-logger";

export async function onRequestError(error: unknown, request: any, context: any) {
    const err = error instanceof Error ? error : new Error(String(error));
    const routeType = context?.routerKind || context?.routeType || "server";

    try {
        await createErrorLog({
            message: err.message,
            source: routeType === "Pages Router" || routeType === "App Router" ? "app" : String(routeType).toLowerCase(),
            page: request?.url || context?.routePath || null,
            stack: err.stack || null,
            log: {
                method: request?.method || null,
                routePath: context?.routePath || null,
                routeType,
                renderSource: context?.renderSource || null
            }
        });
    } catch (logError) {
        console.error("Failed to persist request error:", logError);
    }
}
