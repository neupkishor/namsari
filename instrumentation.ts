import { logger } from "@neup/logica/logger";

export async function onRequestError(error: unknown, request: any, context: any) {
    const err = error instanceof Error ? error : new Error(String(error));
    const routeType = context?.routerKind || context?.routeType || "server";

    const response = await logger.error({
        message: err.message,
        name: err.name,
        stack: err.stack || null,
        source: routeType === "Pages Router" || routeType === "App Router" ? "app" : String(routeType).toLowerCase(),
        page: request?.url || context?.routePath || null,
        method: request?.method || null,
        routePath: context?.routePath || null,
        routeType,
        renderSource: context?.renderSource || null
    });

    if (!response.ok) {
        console.error("Failed to send request error to Logica logger:", response.body);
    }
}